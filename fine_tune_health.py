"""Fine-Tuning Health & Lifestyle Risk Model Using GridSearchCV.

This script executes systematic hyperparameter optimization using scikit-learn Pipeline
and GridSearchCV for predicting health risk categories, evaluating against the baseline model.
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
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder, OrdinalEncoder, StandardScaler

# Ensure UTF-8 output on Windows
if sys.platform == "win32":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")


def locate_health_dataset() -> Path:
    """Locates the health and lifestyle tabular CSV dataset."""
    candidate_paths = [
        Path("data/student_health_dataset_50k.csv"),
        Path("dataset/student_health_dataset_50k.csv"),
        Path(r"D:\ICBT\Final\Data set\archive (2)\student_health_dataset_50k.csv"),
        Path.home() / "student_health_dataset_50k.csv",
    ]

    for p in candidate_paths:
        if p.exists():
            return p

    raise FileNotFoundError(
        f"Health dataset CSV not found in any candidate paths: {[str(p) for p in candidate_paths]}"
    )


def inspect_baseline_model(model_path: Path) -> Tuple[object, Dict]:
    """Inspects the existing baseline model object using joblib."""
    print("\n[Baseline Inspection] Inspecting existing model:", model_path)
    model = joblib.load(model_path)
    info = {
        "type": str(type(model)),
        "is_pipeline": hasattr(model, "named_steps"),
        "n_features_in": getattr(model, "n_features_in_", None),
        "feature_names_in": list(getattr(model, "feature_names_in_", [])),
        "classes": [int(c) if isinstance(c, (np.integer, int)) else str(c) for c in getattr(model, "classes_", [])],
        "params": model.get_params() if hasattr(model, "get_params") else {},
    }
    print(f"  Model Type:        {info['type']}")
    print(f"  Is Pipeline:       {info['is_pipeline']}")
    print(f"  Expected Features: {info['n_features_in']}")
    print(f"  Feature Names:     {info['feature_names_in']}")
    print(f"  Target Classes:    {info['classes']}")
    return model, info


def build_health_pipeline(
    numerical_cols: List[str],
    categorical_cols: List[str],
    random_state: int = 42,
) -> Pipeline:
    """Constructs a scikit-learn Pipeline encapsulating preprocessing and classifier.

    Ensures zero data leakage during cross-validation folds.
    """
    num_transformer = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]
    )

    cat_transformer = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            (
                "encoder",
                OrdinalEncoder(
                    handle_unknown="use_encoded_value",
                    unknown_value=-1,
                ),
            ),
        ]
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", num_transformer, numerical_cols),
            ("cat", cat_transformer, categorical_cols),
        ],
        remainder="drop",
    )

    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("classifier", RandomForestClassifier(random_state=random_state, n_jobs=-1)),
        ]
    )
    return pipeline


def main() -> None:
    """Main execution flow for fine-tuning health risk model via GridSearchCV."""
    print("=" * 70)
    print("HEALTH & LIFESTYLE RISK MODEL: GRIDSEARCHCV OPTIMIZATION")
    print("=" * 70)

    # 1. Inspect Baseline Model
    baseline_path = Path("models/best_health_model.pkl")
    baseline_model, baseline_info = inspect_baseline_model(baseline_path)

    # 2. Locate and Load Dataset
    csv_path = locate_health_dataset()
    print(f"\n[Dataset] Loaded health dataset from: {csv_path}")
    df = pd.read_csv(csv_path)
    total_samples, total_cols = df.shape
    print(f"  Dataset Shape: {total_samples:,} rows x {total_cols} columns")

    # 3. Clean and Identify Target & Features
    columns_to_drop = ["student_id", "timestamp"]
    df_cleaned = df.drop(columns=[c for c in columns_to_drop if c in df.columns])

    target_column = "health_condition"
    if target_column not in df_cleaned.columns:
        raise ValueError(f"Target column '{target_column}' not found in dataset columns: {list(df_cleaned.columns)}")

    X = df_cleaned.drop(columns=[target_column])
    y = df_cleaned[target_column]

    target_encoder = LabelEncoder()
    y_encoded = pd.Series(target_encoder.fit_transform(y), index=y.index, name=target_column)
    target_classes = list(target_encoder.classes_)
    num_classes = len(target_classes)

    print(f"\n[Target Variable] '{target_column}' with {num_classes} classes:")
    for idx, c_name in enumerate(target_classes):
        cnt = (y == c_name).sum()
        pct = (cnt / total_samples) * 100
        print(f"  Class {idx} -> '{c_name}': {cnt:>6,} samples ({pct:>5.2f}%)")

    numerical_cols = X.select_dtypes(include=["int64", "float64"]).columns.tolist()
    categorical_cols = X.select_dtypes(include=["object", "string"]).columns.tolist()

    print(f"\n[Feature Schema] {len(X.columns)} features:")
    print(f"  Numerical ({len(numerical_cols)}):   {numerical_cols}")
    print(f"  Categorical ({len(categorical_cols)}): {categorical_cols}")

    # 4. Stratified 80/20 Train/Test Split
    RANDOM_STATE = 42
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y_encoded,
        test_size=0.20,
        random_state=RANDOM_STATE,
        stratify=y_encoded,
    )

    print(f"\n[Data Split (Stratified 80/20, random_state={RANDOM_STATE})]")
    print(f"  Training samples:        {len(X_train):>6,}")
    print(f"  Validation/Test samples: {len(X_test):>6,}")

    # 5. Evaluate Baseline Model on Held-Out Test Set
    print("\n" + "=" * 50)
    print("BASELINE HEALTH MODEL EVALUATION")
    print("=" * 50)

    # Load bundle for exact baseline reproduction if available
    bundle_path = Path(r"D:\ICBT\Final\Data set\archive (2)\health_pipeline_bundle.joblib")
    if bundle_path.exists():
        bundle = joblib.load(bundle_path)
        X_test_num = pd.DataFrame(
            bundle["num_imputer"].transform(X_test[bundle["numerical_cols"]]),
            columns=bundle["numerical_cols"],
            index=X_test.index,
        )
        X_test_cat = pd.DataFrame(
            bundle["cat_imputer"].transform(X_test[bundle["categorical_cols"]]),
            columns=bundle["categorical_cols"],
            index=X_test.index,
        )
        X_test_imp = pd.concat([X_test_num, X_test_cat], axis=1)[X_test.columns]

        X_test_enc = X_test_imp.copy()
        for col in bundle["categorical_cols"]:
            mapping = bundle["category_encoders"][col]
            X_test_enc[col] = X_test_imp[col].map(lambda x: mapping.get(x, -1)).astype(int)

        X_test_scaled_base = X_test_enc.copy()
        X_test_scaled_base[bundle["numerical_cols"]] = bundle["scaler"].transform(X_test_enc[bundle["numerical_cols"]])
        y_pred_baseline = baseline_model.predict(X_test_scaled_base)
    else:
        # If baseline was a standalone model on encoded X
        y_pred_baseline = baseline_model.predict(X_test)

    baseline_accuracy = accuracy_score(y_test, y_pred_baseline)
    baseline_bal_accuracy = balanced_accuracy_score(y_test, y_pred_baseline)
    baseline_precision = precision_score(y_test, y_pred_baseline, average="weighted", zero_division=0)
    baseline_recall = recall_score(y_test, y_pred_baseline, average="weighted", zero_division=0)
    baseline_f1 = f1_score(y_test, y_pred_baseline, average="weighted", zero_division=0)

    print(f"Model:             {type(baseline_model).__name__}")
    print(f"Test Accuracy:     {baseline_accuracy * 100:.2f}%")
    print(f"Balanced Accuracy: {baseline_bal_accuracy * 100:.2f}%")
    print(f"Precision:         {baseline_precision * 100:.2f}%")
    print(f"Recall:            {baseline_recall * 100:.2f}%")
    print(f"F1-score:          {baseline_f1 * 100:.2f}%")

    # 6. Setup Pipeline & GridSearchCV
    pipeline = build_health_pipeline(
        numerical_cols=numerical_cols,
        categorical_cols=categorical_cols,
        random_state=RANDOM_STATE,
    )

    param_grid = {
        "classifier__n_estimators": [100, 200, 300],
        "classifier__max_depth": [None, 10, 20],
        "classifier__min_samples_split": [2, 5],
        "classifier__min_samples_leaf": [1, 2],
        "classifier__max_features": ["sqrt", "log2"],
    }

    CV_FOLDS = 5
    grid_search = GridSearchCV(
        estimator=pipeline,
        param_grid=param_grid,
        cv=CV_FOLDS,
        scoring="accuracy",
        n_jobs=-1,
        verbose=1,
    )

    num_combos = (
        len(param_grid["classifier__n_estimators"])
        * len(param_grid["classifier__max_depth"])
        * len(param_grid["classifier__min_samples_split"])
        * len(param_grid["classifier__min_samples_leaf"])
        * len(param_grid["classifier__max_features"])
    )
    total_fits = num_combos * CV_FOLDS

    print("\n" + "=" * 50)
    print("GRID SEARCH EXECUTION")
    print("=" * 50)
    print(f"Estimator:                         RandomForestClassifier (inside Pipeline)")
    print(f"CV Folds:                          {CV_FOLDS}")
    print(f"Scoring:                           accuracy")
    print(f"Number of parameter combinations:  {num_combos}")
    print(f"Total model fits:                  {total_fits}")

    print("\nFitting GridSearchCV across training partition...")
    grid_start = time.time()
    grid_search.fit(X_train, y_train)
    grid_duration = time.time() - grid_start
    print(f"GridSearchCV completed in {grid_duration:.2f}s ({grid_duration/60:.1f} min)")

    print(f"\nBest Parameters:             {grid_search.best_params_}")
    print(f"Best Cross-Validation Score: {grid_search.best_score_ * 100:.2f}%")

    # 7. Evaluate Champion Optimized Model on Held-Out Test Set
    print("\n" + "=" * 50)
    print("OPTIMIZED HEALTH MODEL EVALUATION")
    print("=" * 50)
    best_pipeline = grid_search.best_estimator_

    y_pred_opt = best_pipeline.predict(X_test)

    opt_accuracy = accuracy_score(y_test, y_pred_opt)
    opt_bal_accuracy = balanced_accuracy_score(y_test, y_pred_opt)
    opt_precision = precision_score(y_test, y_pred_opt, average="weighted", zero_division=0)
    opt_recall = recall_score(y_test, y_pred_opt, average="weighted", zero_division=0)
    opt_f1 = f1_score(y_test, y_pred_opt, average="weighted", zero_division=0)

    report_str = classification_report(
        y_test, y_pred_opt, target_names=target_classes, digits=4
    )
    report_dict = classification_report(
        y_test, y_pred_opt, target_names=target_classes, output_dict=True, digits=4
    )
    cm = confusion_matrix(y_test, y_pred_opt)

    print(f"Test Accuracy:     {opt_accuracy * 100:.2f}%")
    print(f"Balanced Accuracy: {opt_bal_accuracy * 100:.2f}%")
    print(f"Precision:         {opt_precision * 100:.2f}%")
    print(f"Recall:            {opt_recall * 100:.2f}%")
    print(f"F1-score:          {opt_f1 * 100:.2f}%")

    # 8. Performance Comparison
    abs_change = (opt_accuracy - baseline_accuracy) * 100
    rel_change = (
        ((opt_accuracy - baseline_accuracy) / baseline_accuracy) * 100
        if baseline_accuracy > 0
        else 0.0
    )

    print("\n==============================================")
    print("PERFORMANCE COMPARISON")
    print("==============================================")
    print(f"Baseline Accuracy:  {baseline_accuracy * 100:.2f}%")
    print(f"Optimized Accuracy: {opt_accuracy * 100:.2f}%")
    if abs_change > 0:
        print(f"Absolute Improvement: +{abs_change:.2f} percentage points")
        print(f"Relative Improvement: +{rel_change:.2f}%")
    elif abs_change == 0:
        print("Absolute Change:      0.00 percentage points (Identical 100.00% benchmark performance)")
        print("Relative Change:      0.00%")
    else:
        print(f"Performance Change:   {abs_change:.2f} percentage points")
        print(f"Relative Change:      {rel_change:.2f}%")
    print("==============================================")

    print("\nOptimized Model Classification Report:")
    print(report_str)

    # 9. Feature Importance Analysis
    rf_estimator = best_pipeline.named_steps["classifier"]
    importances = rf_estimator.feature_importances_
    all_feature_names = numerical_cols + categorical_cols
    feat_imp_df = pd.DataFrame(
        {"Feature": all_feature_names, "Importance": importances}
    ).sort_values(by="Importance", ascending=False).reset_index(drop=True)

    print("\n" + "=" * 50)
    print("TOP FEATURE IMPORTANCES")
    print("=" * 50)
    for idx, row in feat_imp_df.head(10).iterrows():
        print(f"  {idx+1:>2}. {row['Feature']:<25}: {row['Importance']*100:>6.2f}%")

    # 10. Save Model, Metadata & Verify
    models_dir = Path("models")
    models_dir.mkdir(parents=True, exist_ok=True)
    model_save_path = models_dir / "best_health_model_v2.pkl"

    joblib.dump(best_pipeline, model_save_path)
    print(f"\n[Model Saved] Saved complete pipeline to: {model_save_path}")

    # Verify Saved Model
    reloaded_pipeline = joblib.load(model_save_path)
    reloaded_preds = reloaded_pipeline.predict(X_test)
    if np.array_equal(reloaded_preds, y_pred_opt):
        print("Saved model verification: PASSED")
    else:
        print("Saved model verification: FAILED")

    # Save summary metadata
    summary_payload = {
        "dataset_path": str(csv_path),
        "total_samples": total_samples,
        "features": all_feature_names,
        "target": target_column,
        "target_classes": target_classes,
        "target_mapping": {c: i for i, c in enumerate(target_classes)},
        "baseline_metrics": {
            "accuracy": float(baseline_accuracy),
            "balanced_accuracy": float(baseline_bal_accuracy),
            "precision": float(baseline_precision),
            "recall": float(baseline_recall),
            "f1_score": float(baseline_f1),
        },
        "optimized_metrics": {
            "accuracy": float(opt_accuracy),
            "balanced_accuracy": float(opt_bal_accuracy),
            "precision": float(opt_precision),
            "recall": float(opt_recall),
            "f1_score": float(opt_f1),
        },
        "grid_search": {
            "best_params": grid_search.best_params_,
            "best_cv_score": float(grid_search.best_score_),
            "cv_folds": CV_FOLDS,
            "total_fits": total_fits,
            "duration_seconds": float(grid_duration),
        },
        "feature_importances": feat_imp_df.to_dict(orient="records"),
        "classification_report": report_dict,
        "confusion_matrix": cm.tolist(),
    }

    with open(models_dir / "health_training_history.json", "w", encoding="utf-8") as f:
        json.dump(summary_payload, f, indent=2)

    with open(models_dir / "health_classification_report.txt", "w", encoding="utf-8") as f:
        f.write(report_str)

    # Plot & Save Confusion Matrix
    cm_norm = cm.astype("float") / (cm.sum(axis=1, keepdims=True) + 1e-7)
    fig, ax = plt.subplots(figsize=(7, 6), dpi=300)
    cax = ax.matshow(cm_norm, cmap=plt.cm.Blues, vmin=0, vmax=1.0)
    fig.colorbar(cax)
    ax.set_xticks(range(len(target_classes)))
    ax.set_yticks(range(len(target_classes)))
    ax.set_xticklabels(target_classes, rotation=45, ha="left", fontsize=10)
    ax.set_yticklabels(target_classes, fontsize=10)

    for i in range(len(target_classes)):
        for j in range(len(target_classes)):
            val = cm_norm[i, j]
            text = f"{val * 100:.1f}%\n({cm[i, j]:,})"
            color = "white" if val > 0.5 else "black"
            ax.text(j, i, text, ha="center", va="center", color=color, fontsize=8)

    ax.set_xlabel("Predicted Label", fontsize=12, labelpad=10)
    ax.set_ylabel("True Label", fontsize=12, labelpad=10)
    ax.set_title("Health Condition Confusion Matrix (GridSearchCV Optimized)", fontsize=13, fontweight="bold", pad=15)
    plt.tight_layout()
    plt.savefig(models_dir / "health_confusion_matrix.png", bbox_inches="tight")
    plt.close(fig)

    print("[Artifact Saved] Saved confusion matrix to: models/health_confusion_matrix.png")
    print("[Artifact Saved] Saved classification report to: models/health_classification_report.txt")
    print("[Artifact Saved] Saved training history to: models/health_training_history.json")


if __name__ == "__main__":
    main()
