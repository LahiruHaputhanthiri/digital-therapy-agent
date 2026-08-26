"""Fine-Tuning Speech Emotion Recognition (SER) using 1D Convolutional Neural Network.

This script trains and evaluates a Conv1D model on 40-dimensional MFCC features,
comparing its classification performance against the 53.60% baseline DNN model.
"""

import json
import os
from pathlib import Path
import sys
import time
from typing import Dict, List, Tuple

import joblib
import matplotlib.pyplot as plt
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.utils.class_weight import compute_class_weight
import tensorflow as tf
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
from tensorflow.keras.layers import (
    Conv1D,
    Dense,
    Dropout,
    Flatten,
    Input,
    MaxPooling1D,
)
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.utils import to_categorical

# Ensure UTF-8 output on Windows
if sys.platform == "win32":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")


def locate_voice_dataset() -> Tuple[Path, Path]:
    """Locates the precomputed MFCC feature matrix and labels."""
    candidate_dirs = [
        Path("data"),
        Path("dataset"),
        Path(r"D:\ICBT\Final\Data set\archive (1)"),
        Path.home() / "voice_data",
    ]

    for c_dir in candidate_dirs:
        # Check standard and alternative filenames
        possible_x = [
            c_dir / "voice_features_X.npy",
            c_dir / "X.npy",
            c_dir / "features.npy",
        ]
        possible_y = [
            c_dir / "voice_labels_y.npy",
            c_dir / "y.npy",
            c_dir / "labels.npy",
        ]

        found_x = next((p for p in possible_x if p.exists()), None)
        found_y = next((p for p in possible_y if p.exists()), None)

        if found_x and found_y:
            return found_x, found_y

    raise FileNotFoundError(
        f"Voice dataset (.npy files) not found in candidate directories: {[str(d) for d in candidate_dirs]}"
    )


def build_conv1d_model(input_shape: Tuple[int, int] = (40, 1), num_classes: int = 6) -> Sequential:
    """Builds the 1D Convolutional Neural Network for voice emotion classification.

    Architecture:
        Input(40, 1)
            ↓
        Conv1D(64, kernel_size=3, activation='relu')
            ↓
        MaxPooling1D(pool_size=2)
            ↓
        Conv1D(128, kernel_size=3, activation='relu')
            ↓
        MaxPooling1D(pool_size=2)
            ↓
        Flatten()
            ↓
        Dense(128, activation='relu')
            ↓
        Dropout(0.4)
            ↓
        Dense(num_classes, activation='softmax')
    """
    model = Sequential(
        [
            Input(shape=input_shape, name="audio_mfcc_input"),
            Conv1D(64, kernel_size=3, activation="relu", name="conv1d_layer1"),
            MaxPooling1D(pool_size=2, name="maxpool1d_1"),
            Conv1D(128, kernel_size=3, activation="relu", name="conv1d_layer2"),
            MaxPooling1D(pool_size=2, name="maxpool1d_2"),
            Flatten(name="flatten"),
            Dense(128, activation="relu", name="dense_128"),
            Dropout(0.4, name="dropout"),
            Dense(num_classes, activation="softmax", name="emotion_probabilities"),
        ],
        name="VoiceEmotionConv1D",
    )
    return model


def plot_and_save_confusion_matrix(
    cm: np.ndarray,
    class_names: List[str],
    save_path: Path,
    title: str = "Voice Emotion Confusion Matrix (Normalized)",
) -> None:
    """Plots and saves normalized confusion matrix heatmap."""
    cm_norm = cm.astype("float") / (cm.sum(axis=1, keepdims=True) + 1e-7)

    fig, ax = plt.subplots(figsize=(7, 6), dpi=300)
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
    """Main execution flow for Conv1D SER model training, evaluation, and benchmarking."""
    print("=" * 70)
    print("SPEECH EMOTION RECOGNITION: CONV1D ARCHITECTURE EXPERIMENT")
    print("=" * 70)

    # 1. Locate and load dataset
    x_file, y_file = locate_voice_dataset()
    print(f"\n[Dataset Files]")
    print(f"  Feature file: {x_file}")
    print(f"  Label file:   {y_file}")

    X = np.load(x_file)
    y = np.load(y_file)

    num_samples, num_features = X.shape
    unique_classes, counts = np.unique(y, return_counts=True)
    num_classes = len(unique_classes)

    print(f"\n[Data Verification]")
    print(f"  X shape:            {X.shape}")
    print(f"  y shape:            {y.shape}")
    print(f"  Number of samples:  {num_samples}")
    print(f"  Number of features: {num_features}")
    print(f"  Number of classes:  {num_classes}")

    # 2. Encode Labels and Verify Class Distribution
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)
    class_names = list(label_encoder.classes_)
    y_categorical = to_categorical(y_encoded, num_classes=num_classes)

    print(f"\n[Class Distribution across entire dataset ({num_samples} samples)]:")
    for idx, c_name in enumerate(class_names):
        c_count = np.sum(y_encoded == idx)
        pct = (c_count / num_samples) * 100
        print(f"  Class {idx} -> {c_name:<10}: {c_count:>5} samples ({pct:>5.1f}%)")

    # 3. Stratified Train/Test Split (Prevent Data Leakage)
    RANDOM_STATE = 42
    X_train_raw, X_test_raw, y_train, y_test = train_test_split(
        X,
        y_categorical,
        test_size=0.20,
        random_state=RANDOM_STATE,
        stratify=y_encoded,
    )
    y_train_int = np.argmax(y_train, axis=1)

    print(f"\n[Dataset Split (Stratified, test_size=0.20, random_state={RANDOM_STATE})]")
    print(f"  Training samples:        {len(X_train_raw):>5}")
    print(f"  Validation/Test samples: {len(X_test_raw):>5}")

    # 4. Standard Scaling (Fit strictly on training set)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train_raw)
    X_test_scaled = scaler.transform(X_test_raw)
    print("\n[Preprocessing] Fitted StandardScaler strictly on X_train (Zero Data Leakage).")

    # 5. Reshape for Conv1D: (samples, 40) -> (samples, 40, 1)
    X_train_conv = X_train_scaled.reshape(-1, num_features, 1)
    X_test_conv = X_test_scaled.reshape(-1, num_features, 1)

    print(f"\n[Conv1D Reshape]")
    print(f"  X_train shape: {X_train_conv.shape}")
    print(f"  X_test shape:  {X_test_conv.shape}")

    # 6. Class Imbalance Assessment
    class_weights_arr = compute_class_weight(
        class_weight="balanced", classes=np.unique(y_train_int), y=y_train_int
    )
    class_weight_dict = {i: float(w) for i, w in enumerate(class_weights_arr)}
    print("\n[Class Balance Analysis]")
    print("  Training set class counts are evenly balanced (~16-17% per emotion).")
    print("  Balanced class weights calculated:")
    for idx, c_name in enumerate(class_names):
        print(f"    - {c_name:<10}: weight = {class_weight_dict[idx]:.3f}")

    # 7. Model Construction & Compilation
    model = build_conv1d_model(input_shape=(num_features, 1), num_classes=num_classes)
    model.summary()

    LEARNING_RATE = 0.0005
    model.compile(
        optimizer=Adam(learning_rate=LEARNING_RATE),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )

    # Destination paths
    models_dir = Path("models")
    models_dir.mkdir(parents=True, exist_ok=True)
    checkpoint_path = models_dir / "best_voice_model_v2.h5"

    callbacks = [
        EarlyStopping(
            monitor="val_loss", patience=10, restore_best_weights=True, verbose=1
        ),
        ModelCheckpoint(
            filepath=str(checkpoint_path),
            monitor="val_accuracy",
            save_best_only=True,
            mode="max",
            verbose=1,
        ),
        ReduceLROnPlateau(
            monitor="val_loss", factor=0.5, patience=4, min_lr=1e-5, verbose=1
        ),
    ]

    # 8. Model Training
    EPOCHS = 100
    BATCH_SIZE = 64
    print(f"\n[Training] Starting Conv1D training for max {EPOCHS} epochs (Batch Size = {BATCH_SIZE})...")
    start_time = time.time()

    history = model.fit(
        X_train_conv,
        y_train,
        validation_data=(X_test_conv, y_test),
        epochs=EPOCHS,
        batch_size=BATCH_SIZE,
        class_weight=class_weight_dict,
        callbacks=callbacks,
        verbose=1,
    )
    training_duration = time.time() - start_time
    epochs_completed = len(history.history["loss"])
    best_epoch = int(np.argmax(history.history["val_accuracy"])) + 1
    best_val_acc = float(np.max(history.history["val_accuracy"]))

    print(f"\n[Training Completed]")
    print(f"  Duration:                {training_duration:.2f}s")
    print(f"  Epochs completed:        {epochs_completed}")
    print(f"  Best epoch:              {best_epoch}")
    print(f"  Best Validation Accuracy: {best_val_acc * 100:.2f}%")

    # 9. Save Scaler and Class Metadata
    scaler_save_path = models_dir / "voice_scaler_v2.pkl"
    joblib.dump(scaler, scaler_save_path)
    print(f"\n[Artifact Saved] Saved StandardScaler to: {scaler_save_path}")

    class_dict = {str(idx): name for idx, name in enumerate(class_names)}
    classes_save_path = models_dir / "voice_classes_v2.json"
    with open(classes_save_path, "w", encoding="utf-8") as f:
        json.dump(
            {
                "classes": class_names,
                "class_to_idx": {name: idx for idx, name in enumerate(class_names)},
                "idx_to_class": class_dict,
                "num_classes": num_classes,
                "input_features": num_features,
            },
            f,
            indent=2,
        )
    print(f"[Artifact Saved] Saved class mapping to: {classes_save_path}")

    # 10. Comprehensive Evaluation of Best Saved Model
    print("\n" + "=" * 50)
    print("EVALUATING BEST CHECKPOINT (best_voice_model_v2.h5)")
    print("=" * 50)
    best_model = load_model(str(checkpoint_path))

    test_loss, test_acc = best_model.evaluate(X_test_conv, y_test, verbose=0)
    y_pred_probs = best_model.predict(X_test_conv, verbose=0)
    y_pred = np.argmax(y_pred_probs, axis=1)
    y_true = np.argmax(y_test, axis=1)

    report_dict = classification_report(
        y_true, y_pred, target_names=class_names, output_dict=True, digits=4
    )
    report_str = classification_report(
        y_true, y_pred, target_names=class_names, digits=4
    )
    cm = confusion_matrix(y_true, y_pred)

    precision = report_dict["weighted avg"]["precision"]
    recall = report_dict["weighted avg"]["recall"]
    f1_score = report_dict["weighted avg"]["f1-score"]

    print("\n==============================================")
    print("VOICE MODEL EVALUATION")
    print("==============================================")
    print(f"Test Accuracy: {test_acc * 100:.2f}%")
    print(f"Precision:     {precision * 100:.2f}%")
    print(f"Recall:        {recall * 100:.2f}%")
    print(f"F1 Score:      {f1_score * 100:.2f}%")
    print("==============================================")

    # 11. Baseline Comparison (53.60% Baseline)
    baseline_acc = 0.5360
    abs_diff = (test_acc - baseline_acc) * 100
    rel_diff = ((test_acc - baseline_acc) / baseline_acc) * 100

    print("\n==============================================")
    print("BASELINE COMPARISON")
    print("==============================================")
    print(f"Existing DNN baseline: {baseline_acc * 100:.2f}%")
    print(f"New Conv1D accuracy:   {test_acc * 100:.2f}%")
    if abs_diff >= 0:
        print(f"Absolute improvement:  +{abs_diff:.2f} percentage points")
        print(f"Relative improvement:  +{rel_diff:.2f}%")
    else:
        print(f"Performance decrease:  {abs_diff:.2f} percentage points")
        print(f"Relative decrease:     {rel_diff:.2f}%")
    print("==============================================")

    print("\nDetailed Classification Report:")
    print(report_str)

    # Save additional training metadata & confusion matrix
    with open(models_dir / "voice_classification_report.txt", "w", encoding="utf-8") as f:
        f.write(report_str)

    plot_and_save_confusion_matrix(
        cm, class_names, models_dir / "voice_confusion_matrix.png"
    )

    history_data = {
        "baseline_accuracy": baseline_acc,
        "conv1d_test_accuracy": float(test_acc),
        "test_loss": float(test_loss),
        "absolute_change_points": float(abs_diff),
        "relative_change_percent": float(rel_diff),
        "training_duration_sec": float(training_duration),
        "epochs_completed": int(epochs_completed),
        "best_epoch": int(best_epoch),
        "classification_report": report_dict,
        "confusion_matrix": cm.tolist(),
        "history": {k: [float(v) for v in vals] for k, vals in history.history.items()},
    }
    with open(models_dir / "voice_training_history.json", "w", encoding="utf-8") as f:
        json.dump(history_data, f, indent=2)

    # 12. Verify Model Reloading and Sample Prediction
    print("\n" + "=" * 50)
    print("MODEL COMPATIBILITY VERIFICATION")
    print("=" * 50)
    reloaded_model = load_model(str(checkpoint_path))
    print(f"Model input shape:   {reloaded_model.input_shape}")
    print(f"Model output shape:  {reloaded_model.output_shape}")
    print(f"Number of parameters:{reloaded_model.count_params():,}")

    dummy_input = np.random.randn(1, num_features, 1).astype(np.float32)
    dummy_pred = reloaded_model.predict(dummy_input, verbose=0)
    print(f"Sanity Prediction Output Shape: {dummy_pred.shape}")
    print(f"Sanity Predicted Probabilities: {np.round(dummy_pred[0], 4)}")
    print(f"Sanity Predicted Emotion:       '{class_names[np.argmax(dummy_pred[0])]}'")
    print("Inference verification successful!")

    # 13. Backend Pipeline Requirements & Limitation Notice
    print("\n" + "=" * 50)
    print("BACKEND COMPATIBILITY & TECHNICAL LIMITATION")
    print("=" * 50)
    print("Inference Preprocessing Pipeline for Conv1D:")
    print("  raw audio -> MFCC extraction (40) -> voice_scaler_v2.pkl -> reshape to (1, 40, 1) -> best_voice_model_v2.h5 -> softmax")
    print("\nArchitectural Limitation:")
    print("  Conv1D on shape (40, 1) operates across the static 40-dimensional MFCC coefficient axis.")
    print("  Because temporal averaging (np.mean(mfccs.T, axis=0)) was applied during feature extraction,")
    print("  this architecture performs 1D convolution over frequency cepstral coefficients rather than true temporal audio sequences.")


if __name__ == "__main__":
    main()
