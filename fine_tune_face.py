"""Fine-tuning Facial Emotion Recognition using MobileNetV2 Transfer Learning.

This script trains and evaluates a MobileNetV2-based model on the FER-2013 dataset,
comparing its performance against the 61.90% baseline CNN model.
"""

import json
import os
from pathlib import Path
import sys
import time
from typing import Dict, List, Tuple

import matplotlib.pyplot as plt
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.utils.class_weight import compute_class_weight
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
from tensorflow.keras.layers import (
    Dense,
    Dropout,
    GlobalAveragePooling2D,
    Input,
    RandomFlip,
    RandomRotation,
    RandomTranslation,
    RandomZoom,
)
from tensorflow.keras.models import Model, load_model
from tensorflow.keras.optimizers import Adam

# Ensure UTF-8 output on Windows
if sys.platform == "win32":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")


def locate_dataset() -> Tuple[Path, Path]:
    """Locates the FER-2013 dataset train and test directories."""
    candidate_paths = [
        Path("data"),
        Path("dataset"),
        Path("FER-2013"),
        Path(r"D:\ICBT\Final\Data set\Facde Imotion"),
        Path.home() / "FER-2013",
    ]

    for candidate in candidate_paths:
        train_p = candidate / "train"
        test_p = candidate / "test"
        if train_p.exists() and test_p.exists():
            return train_p, test_p

    raise FileNotFoundError(
        f"FER-2013 dataset not found in any candidate paths: {[str(p) for p in candidate_paths]}"
    )


def build_augmentation_layer() -> tf.keras.Sequential:
    """Builds moderate data augmentation pipeline for facial emotion recognition."""
    return tf.keras.Sequential(
        [
            RandomFlip("horizontal"),
            RandomRotation(0.05),
            RandomZoom(0.1),
            RandomTranslation(height_factor=0.05, width_factor=0.05),
        ],
        name="facial_data_augmentation",
    )


def create_mobilenet_emotion_model(
    input_shape: Tuple[int, int, int] = (96, 96, 3), num_classes: int = 7
) -> Tuple[Model, Model]:
    """Builds MobileNetV2 transfer learning model with custom classification head.

    Architecture:
        Input(96, 96, 3)
            ↓
        MobileNetV2 (ImageNet weights, initially frozen)
            ↓
        GlobalAveragePooling2D
            ↓
        Dense(256, ReLU)
            ↓
        Dropout(0.5)
            ↓
        Dense(7, Softmax)
    """
    print("\n[Architecture] Instantiating MobileNetV2 base with ImageNet weights...")
    base_model = MobileNetV2(
        weights="imagenet", include_top=False, input_shape=input_shape
    )
    base_model.trainable = False

    inputs = Input(shape=input_shape, name="input_image")
    x = base_model(inputs, training=False)
    x = GlobalAveragePooling2D(name="global_avg_pool")(x)
    x = Dense(256, activation="relu", name="dense_head_256")(x)
    x = Dropout(0.5, name="dropout_head")(x)
    outputs = Dense(num_classes, activation="softmax", name="emotion_probabilities")(x)

    model = Model(inputs=inputs, outputs=outputs, name="MobileNetV2_FER")
    return model, base_model


def plot_and_save_confusion_matrix(
    cm: np.ndarray,
    class_names: List[str],
    save_path: Path,
    title: str = "FER-2013 MobileNetV2 Confusion Matrix (Normalized)",
) -> None:
    """Plots and saves normalized confusion matrix heatmap."""
    cm_norm = cm.astype("float") / (cm.sum(axis=1, keepdims=True) + 1e-7)

    fig, ax = plt.subplots(figsize=(8, 6), dpi=300)
    cax = ax.matshow(cm_norm, cmap=plt.cm.Blues, vmin=0, vmax=1.0)
    fig.colorbar(cax)

    ax.set_xticks(range(len(class_names)))
    ax.set_yticks(range(len(class_names)))
    ax.set_xticklabels(class_names, rotation=45, ha="left", fontsize=10)
    ax.set_yticklabels(class_names, fontsize=10)

    for i in range(len(class_names)):
        for j in range(len(class_names)):
            val = cm_norm[i, j]
            text = f"{val * 100:.1f}%\n({cm[i, j]})"
            color = "white" if val > 0.5 else "black"
            ax.text(j, i, text, ha="center", va="center", color=color, fontsize=8)

    ax.set_xlabel("Predicted Emotion", fontsize=12, labelpad=10)
    ax.set_ylabel("True Emotion", fontsize=12, labelpad=10)
    ax.set_title(title, fontsize=13, fontweight="bold", pad=15)
    plt.tight_layout()
    plt.savefig(save_path, bbox_inches="tight")
    plt.close(fig)


def main() -> None:
    """Main execution flow for fine-tuning and evaluating MobileNetV2 on FER-2013."""
    print("=" * 70)
    print("FACIAL EMOTION RECOGNITION: MOBILENETV2 TRANSFER LEARNING")
    print("=" * 70)

    # 1. Verify and locate dataset
    train_dir, test_dir = locate_dataset()
    print(f"[Dataset Location] Train: {train_dir}")
    print(f"[Dataset Location] Test:  {test_dir}")

    # Standard class ordering matches folder layout: angry, disgust, fear, happy, neutral, sad, surprise
    class_names = ["angry", "disgust", "fear", "happy", "neutral", "sad", "surprise"]
    capitalized_classes = [c.capitalize() for c in class_names]
    num_classes = len(class_names)

    # Check sample counts
    train_counts = {c: len(list((train_dir / c).glob("*"))) for c in class_names}
    test_counts = {c: len(list((test_dir / c).glob("*"))) for c in class_names}
    total_train = sum(train_counts.values())
    total_test = sum(test_counts.values())

    print(f"\n[Class Distribution] Total Training Samples: {total_train}")
    for c, cnt in train_counts.items():
        print(f"  - {c.capitalize():<10}: {cnt:>5} samples ({cnt/total_train*100:>5.1f}%)")

    print(f"\n[Class Distribution] Total Validation/Test Samples: {total_test}")
    for c, cnt in test_counts.items():
        print(f"  - {c.capitalize():<10}: {cnt:>5} samples ({cnt/total_test*100:>5.1f}%)")

    # 2. Compute balanced class weights to handle significant class imbalance (e.g. disgust vs happy)
    # Collect all train labels for exact weighting
    train_labels = []
    for idx, c in enumerate(class_names):
        train_labels.extend([idx] * train_counts[c])
    train_labels = np.array(train_labels)

    class_weights_arr = compute_class_weight(
        class_weight="balanced", classes=np.unique(train_labels), y=train_labels
    )
    class_weight_dict = {i: float(w) for i, w in enumerate(class_weights_arr)}

    print("\n[Class Weighting] Computed Balanced Class Weights:")
    for idx, c in enumerate(class_names):
        print(f"  - {c.capitalize():<10} (Class {idx}): weight = {class_weight_dict[idx]:.3f}")

    # 3. Create Data Pipelines
    BATCH_SIZE = 64
    IMAGE_SIZE = (48, 48)  # Native FER-2013 size on disk
    TARGET_SIZE = (96, 96)  # Resized MobileNetV2 input size

    print(f"\n[Data Pipeline] Loading images (Batch Size = {BATCH_SIZE})...")
    raw_train_ds = tf.keras.utils.image_dataset_from_directory(
        train_dir,
        labels="inferred",
        label_mode="categorical",
        class_names=class_names,
        color_mode="grayscale",
        batch_size=BATCH_SIZE,
        image_size=IMAGE_SIZE,
        shuffle=True,
        seed=42,
    )

    raw_test_ds = tf.keras.utils.image_dataset_from_directory(
        test_dir,
        labels="inferred",
        label_mode="categorical",
        class_names=class_names,
        color_mode="grayscale",
        batch_size=BATCH_SIZE,
        image_size=IMAGE_SIZE,
        shuffle=False,
    )

    augmentation = build_augmentation_layer()

    def preprocess_train_sample(images, labels):
        # 1. Data augmentation on (batch, 48, 48, 1) float32 [0, 255]
        images = augmentation(images, training=True)
        # 2. Resize to (96, 96)
        images = tf.image.resize(images, TARGET_SIZE)
        # 3. Grayscale to RGB (96, 96, 3)
        images = tf.image.grayscale_to_rgb(images)
        # 4. MobileNetV2 official preprocessing function (scales to [-1, 1])
        images = preprocess_input(images)
        return images, labels

    def preprocess_eval_sample(images, labels):
        images = tf.image.resize(images, TARGET_SIZE)
        images = tf.image.grayscale_to_rgb(images)
        images = preprocess_input(images)
        return images, labels

    autotune = tf.data.AUTOTUNE
    train_ds = (
        raw_train_ds.map(preprocess_train_sample, num_parallel_calls=autotune)
        .prefetch(autotune)
    )
    val_ds = (
        raw_test_ds.map(preprocess_eval_sample, num_parallel_calls=autotune)
        .prefetch(autotune)
    )

    # 4. Build Model
    model, base_model = create_mobilenet_emotion_model(
        input_shape=(96, 96, 3), num_classes=num_classes
    )
    model.summary()

    # Destination paths
    models_dir = Path("models")
    models_dir.mkdir(parents=True, exist_ok=True)
    checkpoint_v2_path = models_dir / "best_face_model_v2.h5"

    # 5. Compile Stage 1 (Frozen Base)
    STAGE1_LR = 1e-4
    model.compile(
        optimizer=Adam(learning_rate=STAGE1_LR),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )

    callbacks_stage1 = [
        EarlyStopping(
            monitor="val_accuracy", patience=3, restore_best_weights=True, verbose=1
        ),
        ModelCheckpoint(
            filepath=str(checkpoint_v2_path),
            monitor="val_accuracy",
            save_best_only=True,
            mode="max",
            verbose=1,
        ),
        ReduceLROnPlateau(
            monitor="val_loss", factor=0.5, patience=2, min_lr=1e-6, verbose=1
        ),
    ]

    print("\n" + "=" * 50)
    print("STAGE 1: TRAINING TOP CLASSIFICATION HEAD (Base Frozen)")
    print("=" * 50)
    stage1_epochs = 10
    start_time = time.time()

    history_stage1 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=stage1_epochs,
        class_weight=class_weight_dict,
        callbacks=callbacks_stage1,
        verbose=1,
    )
    stage1_duration = time.time() - start_time
    print(f"Stage 1 training completed in {stage1_duration:.1f}s")

    # 6. Stage 2: Fine-tuning top layers of MobileNetV2
    print("\n" + "=" * 50)
    print("STAGE 2: FINE-TUNING TOP 30 LAYERS OF MOBILENETV2")
    print("=" * 50)
    base_model.trainable = True
    # Freeze all layers except the last 30
    for layer in base_model.layers[:-30]:
        layer.trainable = False

    trainable_count = sum(len(layer.trainable_weights) for layer in model.layers)
    print(f"[Fine-Tuning] Unfroze top 30 layers of base model. Trainable weight tensors: {trainable_count}")

    STAGE2_LR = 1e-5
    model.compile(
        optimizer=Adam(learning_rate=STAGE2_LR),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )

    callbacks_stage2 = [
        EarlyStopping(
            monitor="val_accuracy", patience=3, restore_best_weights=True, verbose=1
        ),
        ModelCheckpoint(
            filepath=str(checkpoint_v2_path),
            monitor="val_accuracy",
            save_best_only=True,
            mode="max",
            verbose=1,
        ),
        ReduceLROnPlateau(
            monitor="val_loss", factor=0.5, patience=2, min_lr=1e-7, verbose=1
        ),
    ]

    stage2_epochs = 5
    stage2_start = time.time()
    history_stage2 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=stage2_epochs,
        class_weight=class_weight_dict,
        callbacks=callbacks_stage2,
        verbose=1,
    )
    stage2_duration = time.time() - stage2_start
    total_training_duration = stage1_duration + stage2_duration
    print(f"Stage 2 fine-tuning completed in {stage2_duration:.1f}s")
    print(f"Total training duration: {total_training_duration:.1f}s")

    # Combine histories
    combined_history = {
        "accuracy": history_stage1.history.get("accuracy", [])
        + history_stage2.history.get("accuracy", []),
        "loss": history_stage1.history.get("loss", [])
        + history_stage2.history.get("loss", []),
        "val_accuracy": history_stage1.history.get("val_accuracy", [])
        + history_stage2.history.get("val_accuracy", []),
        "val_loss": history_stage1.history.get("val_loss", [])
        + history_stage2.history.get("val_loss", []),
    }

    # 7. Evaluate the best checkpoint model
    print("\n" + "=" * 50)
    print("EVALUATING BEST CHECKPOINT (best_face_model_v2.h5)")
    print("=" * 50)
    best_model = load_model(str(checkpoint_v2_path))

    # Run inference across the test dataset
    y_true_list = []
    y_pred_probs_list = []

    for images, labels in val_ds:
        probs = best_model.predict(images, verbose=0)
        y_pred_probs_list.append(probs)
        y_true_list.append(labels.numpy())

    y_pred_probs = np.vstack(y_pred_probs_list)
    y_true_cats = np.vstack(y_true_list)
    y_true = np.argmax(y_true_cats, axis=1)
    y_pred = np.argmax(y_pred_probs, axis=1)

    new_accuracy = float(np.mean(y_pred == y_true))
    baseline_accuracy = 0.6189746  # 61.90% baseline
    abs_improvement = (new_accuracy - baseline_accuracy) * 100
    rel_improvement = ((new_accuracy - baseline_accuracy) / baseline_accuracy) * 100

    report_str = classification_report(
        y_true, y_pred, target_names=capitalized_classes, digits=4
    )
    report_dict = classification_report(
        y_true, y_pred, target_names=capitalized_classes, output_dict=True
    )
    cm = confusion_matrix(y_true, y_pred)

    # 8. Save Metrics, Reports, and Confusion Matrix
    # JSON Training Summary
    summary_data = {
        "baseline_validation_accuracy": baseline_accuracy,
        "mobilenetv2_validation_accuracy": new_accuracy,
        "absolute_improvement_points": abs_improvement,
        "relative_improvement_percent": rel_improvement,
        "total_training_duration_seconds": total_training_duration,
        "class_indices": {c: i for i, c in enumerate(class_names)},
        "classification_report": report_dict,
        "confusion_matrix": cm.tolist(),
        "training_history": combined_history,
    }
    with open(models_dir / "face_training_history.json", "w", encoding="utf-8") as f:
        json.dump(summary_data, f, indent=2)

    with open(
        models_dir / "face_classification_report.txt", "w", encoding="utf-8"
    ) as f:
        f.write(report_str)

    plot_and_save_confusion_matrix(
        cm, capitalized_classes, models_dir / "face_confusion_matrix.png"
    )

    # 9. Format Required Output Comparison
    print("\n" + "=" * 46)
    print("FACE MODEL PERFORMANCE COMPARISON")
    print("=" * 46)
    print(f"Baseline validation accuracy:   {baseline_accuracy * 100:.2f}%")
    print(f"MobileNetV2 validation accuracy: {new_accuracy * 100:.2f}%")
    if abs_improvement >= 0:
        print(f"Absolute improvement:           +{abs_improvement:.2f} percentage points")
        print(f"Relative improvement:           +{rel_improvement:.2f}%")
    else:
        print(f"Change:                         {abs_improvement:.2f} percentage points")
        print(f"Relative change:                {rel_improvement:.2f}%")
    print("=" * 46)

    print("\nDetailed Classification Report:")
    print(report_str)

    # 10. Compatibility Verification & Sanity Inference
    print("\n" + "=" * 50)
    print("MODEL COMPATIBILITY VERIFICATION")
    print("=" * 50)
    test_reloaded_model = load_model(str(checkpoint_v2_path))
    print(f"Model Input Shape:  {test_reloaded_model.input_shape}")
    print(f"Model Output Shape: {test_reloaded_model.output_shape}")
    print(f"Total Parameters:   {test_reloaded_model.count_params():,}")

    dummy_sample = np.random.uniform(-1.0, 1.0, size=(1, 96, 96, 3)).astype(np.float32)
    sample_prediction = test_reloaded_model.predict(dummy_sample, verbose=0)
    print(f"Sample Inference Output Shape: {sample_prediction.shape}")
    print(f"Sample Predicted Probabilities: {np.round(sample_prediction[0], 4)}")
    print("Inference sanity test passed successfully!")

    print("\n[Compatibility Note]")
    print(
        "The new model requires 96x96x3 preprocessing. The backend must be updated separately before replacing the production face model."
    )


if __name__ == "__main__":
    main()
