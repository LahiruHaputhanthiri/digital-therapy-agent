# Missing Screenshot Evidence & Manual Acquisition Guide

This document lists the screenshot evidence items that could not be fully captured automatically in the headless browser sandbox because they depend on **physical hardware devices (webcam, microphone)** or **OS-level browser permission dialogs**.

---

## Missing Screenshot Inventory

### 1. EVID-SS-021 — Native Browser Microphone Permission Prompt
* **Required Screen:** Native OS/Browser permission modal ("Allow MindCare to use your microphone?").
* **Why It Is Needed:** Proves compliance with browser security models and explicit user consent policies before accessing acoustic sensors.
* **Exists in Code?** YES — Implemented via Web Audio API `navigator.mediaDevices.getUserMedia({ audio: true })` in `src/hooks/useMediaDevices.ts`.
* **Why Not Captured Automatically:** Headless and automated browser agents bypass native OS permission dialogs.
* **Exact Manual Steps to Capture:**
  1. Open Chrome/Edge in standard user mode at `http://localhost:3000`.
  2. Click the microphone icon in the central InputBar.
  3. Capture a screenshot of the resulting native browser permission pop-up.
  4. Save as: `academic_evidence/screenshots/04_multimodal/EVID-SS-021_mic_permission_prompt.png`.
* **Importance:** **HIGH** (Chapter 7.3 & Ethics / Privacy compliance)

---

### 2. EVID-SS-022 — Live Webcam Video Feed with Face Detection Box
* **Required Screen:** Live video element showing the user's physical face stream with active green/blue bounding box and real-time facial landmark overlay.
* **Why It Is Needed:** Visually demonstrates the active video acquisition pipeline for Facial Emotion Recognition (FER).
* **Exists in Code?** YES — Implemented in `src/components/sensors/CameraFeed.tsx` (using `<video>` tag and OpenCV/canvas pre-processing).
* **Why Not Captured Automatically:** Automated subagent environment has no physical webcam device attached.
* **Exact Manual Steps to Capture:**
  1. Connect a USB or built-in webcam.
  2. Navigate to `http://localhost:3000`, open the Telemetry Drawer, and enable Camera sensor.
  3. Ensure your face is clearly visible in the camera preview window.
  4. Capture a high-resolution screenshot showing the active video feed.
  5. Save as: `academic_evidence/screenshots/04_multimodal/EVID-SS-022_active_camera_feed.png`.
* **Importance:** **HIGH** (Chapter 7.3 & VIVA Presentation)

---

### 3. EVID-SS-023 / EVID-SS-040 — Live Audio Waveform & Speech Recording in Progress
* **Required Screen:** Multimodal InputBar showing the live pulsing recording indicator and animated audio waveform visualization while speaking.
* **Why It Is Needed:** Proves live Speech Emotion Recognition (SER) and Speech-to-Text (STT) acoustic capture.
* **Exists in Code?** YES — Implemented in `src/components/sensors/AudioRecorder.tsx` and `src/components/chat/InputBar.tsx`.
* **Why Not Captured Automatically:** Automated subagent cannot emit continuous physical vocal sound waves into the microphone.
* **Exact Manual Steps to Capture:**
  1. Connect a working microphone.
  2. Click the microphone icon in the chat input bar to start recording.
  3. Speak a test sentence (e.g. "I have been feeling really overwhelmed today").
  4. Capture a screenshot while the red pulsing timer and recording badge are active.
  5. Save as: `academic_evidence/screenshots/06_voice_emotion/EVID-SS-040_voice_recording_active.png`.
* **Importance:** **HIGH** (Chapter 7.3 & VIVA Presentation)

---

### 4. EVID-SS-060 / EVID-SS-061 / EVID-SS-062 — Multimodal Incongruence & Polar Conflict Demonstration
* **Required Screen:** Chat turn and telemetry showing conflicting modalities (e.g., Happy Face @ 0.85 + Sad Voice @ 0.80) resolving to `uncertain` with an empathetic validation response.
* **Why It Is Needed:** Validates the late-fusion probability mixture algorithm and explicit polar conflict detection logic (`main.py` lines 591–604).
* **Exists in Code?** YES — Fully implemented in `backend/main.py` `fuse_emotions()`.
* **Why Not Captured Automatically:** Requires simultaneously presenting a smiling facial expression to the webcam while speaking in a sad, low-pitch vocal tone.
* **Exact Manual Steps to Capture:**
  1. Start both camera and microphone in the active therapy session.
  2. Smile broadly at the camera while speaking a sad sentence slowly into the microphone.
  3. Send the turn to the backend.
  4. Open the Telemetry Drawer and capture the emotion distribution showing the `uncertain` label and balanced mixture bars.
  5. Save as: `academic_evidence/screenshots/04_multimodal/EVID-SS-062_fused_polar_conflict.png`.
* **Importance:** **MEDIUM** (Chapter 7.3 Multimodal Fusion Analysis)

---

### 5. EVID-SS-110 / EVID-SS-111 — Health & Biometric Tabular Prediction Form
* **Required Screen:** Standalone tabular input form for manual entry of sleep hours, heart rate, step count, and physical activity to predict health risk level (`at-risk`, `fit`, `unhealthy`).
* **Why It Is Needed:** Demonstrates standalone testing of the `best_health_model_v2.pkl` Random Forest model.
* **Exists in Code?** **PARTIALLY VERIFIED** — The model is fully trained (`best_health_model_v2.pkl`) and loaded at backend startup (`main.py` lines 170–182). In the current frontend, stress is dynamically inferred via the multimodal telemetry pipeline rather than a dedicated manual data-entry form.
* **Exact Manual Steps to Capture (if desired):**
  1. Run a local python script / FastAPI Swagger UI at `http://localhost:8000/docs`.
  2. Execute a test prediction against the model using Swagger interactive documentation.
  3. Capture the Swagger UI input/output response.
  4. Save as: `academic_evidence/screenshots/12_health_risk/EVID-SS-110_health_swagger_test.png`.
* **Importance:** **LOW** (Covered in detail via ML classification report EVID-SS-154)

---

## Priority Summary for Dissertation Submission

| Priority | Action Item | Target Section | Impact on Thesis |
|---|---|---|---|
| 🔴 **CRITICAL** | Capture live camera face stream (`EVID-SS-022`) | Chapter 7.3 | Proves visual sensing works with real hardware |
| 🔴 **CRITICAL** | Capture active voice recording pulse (`EVID-SS-040`) | Chapter 7.3 | Proves acoustic sensing works with real hardware |
| 🟡 **MEDIUM** | Capture polar conflict turn (`EVID-SS-062`) | Chapter 7.3 | Demonstrates research contribution of late-fusion |
| 🟢 **LOW** | Capture Swagger health prediction (`EVID-SS-110`) | Chapter 7.2 | Supplementary evidence for tabular ML model |
