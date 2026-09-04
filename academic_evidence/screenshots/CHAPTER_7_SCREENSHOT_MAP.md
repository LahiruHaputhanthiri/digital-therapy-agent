# Chapter 7: Testing and Validation — Screenshot Evidence Mapping

This document maps all 34 verified academic screenshot evidence items to the corresponding sections of **Chapter 7 (Testing and Validation)** for the BSc Software Engineering thesis dissertation and final VIVA defense presentation.

---

## 7.1 System Functional & Workspace Testing

This section validates core platform stability, user lifecycle flows, and ambient workspace rendering.

* **EVID-SS-001** (`01_system/EVID-SS-001_landing_page.png`)  
  *Figure 7.1:* MindCare System Landing Page showing ambient wellness introduction, trilingual switcher, and secure entry triggers.
* **EVID-SS-002** (`01_system/EVID-SS-002_main_dashboard.png`)  
  *Figure 7.2:* MindCare Digital Therapeutics (DTx) Workspace featuring distraction-free conversational layout.
* **EVID-SS-003** (`01_system/EVID-SS-003_therapy_interface.png`)  
  *Figure 7.3:* Central Therapy Interface displaying active modality indicators (Voice, Face, Keystroke), live TTS voice response controls, and ambient stress status badge.
* **EVID-SS-010** (`02_authentication/EVID-SS-010_login_screen.png`)  
  *Figure 7.4:* JWT Authentication Sign-In Modal supporting standard credential validation and demo access quick-fills.
* **EVID-SS-011** (`02_authentication/EVID-SS-011_registration_screen.png`)  
  *Figure 7.5:* User Registration Dialog incorporating Role-Based Access Control (RBAC) role selection and secure password hashing.
* **EVID-SS-012** (`02_authentication/EVID-SS-012_user_dashboard.png`)  
  *Figure 7.6:* Authenticated Client Dashboard demonstrating session verification and isolated telemetry persistence.

---

## 7.2 AI & Deep Learning Model Evaluation

This section presents empirical evaluation metrics, classification reports, and confusion matrices for the three trained machine learning models.

* **EVID-SS-150** (`16_ml_evaluation/EVID-SS-150_face_classification_report.png`)  
  *Figure 7.7:* Facial Emotion Recognition (FER) MobileNetV2 Classification Report (FER-2013 test set, N=7,178, Accuracy=40.53%).
* **EVID-SS-151** (`16_ml_evaluation/EVID-SS-151_face_confusion_matrix.png`)  
  *Figure 7.8:* Facial Emotion Recognition Confusion Matrix Heatmap across 7 canonical facial emotion classes.
* **EVID-SS-152** (`16_ml_evaluation/EVID-SS-152_voice_classification_report.png`)  
  *Figure 7.9:* Speech Emotion Recognition (SER) 1D-CNN Classification Report over 40 static MFCC features (Test set N=1,609, Accuracy=50.84%).
* **EVID-SS-153** (`16_ml_evaluation/EVID-SS-153_voice_confusion_matrix.png`)  
  *Figure 7.10:* Speech Emotion Recognition Confusion Matrix Heatmap across 6 vocal emotion categories.
* **EVID-SS-154** (`16_ml_evaluation/EVID-SS-154_health_classification_report.png`)  
  *Figure 7.11:* Health & Biometric Risk Classifier Classification Report (Random Forest via 5-Fold GridSearchCV, N=10,000).
* **EVID-SS-155** (`16_ml_evaluation/EVID-SS-155_health_confusion_matrix.png`)  
  *Figure 7.12:* Health Risk Classification Confusion Matrix Heatmap for `fit`, `at-risk`, and `unhealthy` classes.
* **EVID-SS-032** (`05_facial_emotion/EVID-SS-032_emotion_distribution.png`)  
  *Figure 7.13:* Real-Time Emotion Probability Distribution Bar Chart rendered in the live UI telemetry drawer.
* **EVID-SS-050** (`07_stress/EVID-SS-050_stress_gauge.png`)  
  *Figure 7.14:* Circular Biometric Stress Gauge displaying normalized stress index (0-100%), classification category, and clinical disclaimer.
* **EVID-SS-052** (`07_stress/EVID-SS-052_combined_telemetry.png`)  
  *Figure 7.15:* Combined Clinical Insights Drawer synthesizing multimodal emotional valence and stress trend.

---

## 7.3 Multimodal Sensing & Behavioral Telemetry Testing

This section validates the client-side behavioral sensor pipelines, privacy guards, and typing telemetry.

* **EVID-SS-020** (`04_multimodal/EVID-SS-020_camera_sensor_panel.png`)  
  *Figure 7.16:* Camera Sensor Drawer Panel with on-device tensor processing disclaimer and privacy blur controls.
* **EVID-SS-024** (`04_multimodal/EVID-SS-024_text_input_bar.png`)  
  *Figure 7.17:* Multimodal Input Bar with speech recording trigger, camera feed synchronization, and active modality status indicators.
* **EVID-SS-100** (`11_keystroke/EVID-SS-100_keystroke_telemetry.png`)  
  *Figure 7.18:* Keystroke Dynamics Telemetry Card showing real-time dwell time (ms), flight time (ms), typing cadence consistency, and hesitation pause counts.

---

## 7.4 Therapeutic Interaction & Clinical Interventions Testing

This section verifies the empathy-first conversational engine, guided CBT responses, and somatic de-escalation overlays.

* **EVID-SS-070** (`08_chat_cbt/EVID-SS-070_chat_interface.png`)  
  *Figure 7.19:* Conversational CBT Stream demonstrating clean message bubble hierarchy and adaptive quick suggestions.
* **EVID-SS-071** (`08_chat_cbt/EVID-SS-071_user_message_ai_reply.png`)  
  *Figure 7.20:* Live Dialogue Turn demonstrating user message intake and AI therapeutic validation.
* **EVID-SS-072** (`08_chat_cbt/EVID-SS-072_cbt_oriented_response.png`)  
  *Figure 7.21:* Empathy-First Validation Response (EARLY_LISTENING stage validating user exhaustion prior to proposing exercises).
* **EVID-SS-073** (`08_chat_cbt/EVID-SS-073_emotion_aware_reply.png`)  
  *Figure 7.22:* Emotion-Aware Conversational Response tailored to detected emotional valence.
* **EVID-SS-080** (`09_interventions/EVID-SS-080_box_breathing_interface.png`)  
  *Figure 7.23:* 4-4-4-4 Box Breathing Interactive Somatic Exercise Overlay with animated inhalation, retention, and exhalation cycles.
* **EVID-SS-081** (`09_interventions/EVID-SS-081_grounding_interface.png`)  
  *Figure 7.24:* 5-4-3-2-1 Sensory Grounding De-escalation Protocol Interface for acute distress and panic reduction.
* **EVID-SS-082** (`09_interventions/EVID-SS-082_crisis_safety_support.png`)  
  *Figure 7.25:* Crisis Safety Intervention Modal presenting the Sri Lanka 1926 National Mental Health Helpline (24/7 Toll-Free).

---

## 7.5 Trilingual Localization & Cultural Safety Testing

This section demonstrates the system's trilingual capability across English, Sinhala, and Tamil.

* **EVID-SS-090** (`10_multilingual/EVID-SS-090_english_interface.png`)  
  *Figure 7.26:* English Language Interface displaying standard therapeutic terminology.
* **EVID-SS-091** (`10_multilingual/EVID-SS-091_sinhala_interface.png`)  
  *Figure 7.27:* Sinhala Language Interface (සිංහල) utilizing native Unicode typography and culturally resonant psychological phrasing.
* **EVID-SS-092** (`10_multilingual/EVID-SS-092_tamil_interface.png`)  
  *Figure 7.28:* Tamil Language Interface (தமிழ்) displaying native script and culturally validated empathetic guidance.
* **EVID-SS-093** (`10_multilingual/EVID-SS-093_language_switching_control.png`)  
  *Figure 7.29:* Dynamic Trilingual Language Switcher Control operating without requiring full-page reload.

---

## 7.6 Administration, Security & Role-Based Access Control Testing

This section validates user governance, system health telemetry, and privacy controls.

* **EVID-SS-120** (`13_admin/EVID-SS-120_admin_dashboard.png`)  
  *Figure 7.30:* MindCare Admin Control Center overview displaying platform health, user directory, and model readiness status.
* **EVID-SS-121** (`13_admin/EVID-SS-121_user_management.png`)  
  *Figure 7.31:* Administrative User Management Table with 3-Tier RBAC role visualization (`user`, `admin`, `super_admin`).
* **EVID-SS-122** (`13_admin/EVID-SS-122_system_statistics.png`)  
  *Figure 7.32:* Platform Telemetry & System Statistics showing live database turn counts and AI microservice health.
* **EVID-SS-130** (`14_privacy_security/EVID-SS-130_privacy_settings.png`)  
  *Figure 7.33:* Client Privacy Controls and Sensor Consent Configuration Toggles.

---

## 7.7 Automated Integration & Persistence Testing

This section documents the execution and empirical validation of backend test suites.

* **EVID-SS-140** (`15_testing/EVID-SS-140_test_execution.png`)  
  *Figure 7.34:* Automated Integration Test Execution verifying all 13 RBAC security, token authentication, and ChatLog persistence assertions passed with 100% success.
