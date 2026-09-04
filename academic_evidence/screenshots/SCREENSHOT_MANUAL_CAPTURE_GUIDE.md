# Manual Screenshot Capture Guide for Academic Report & VIVA

This guide provides exact, step-by-step instructions for the author to capture any remaining live hardware screenshots (e.g. webcam face detection, microphone recording waveforms) on a local Windows machine.

---

## 1. Preparation Checklist

1. **Start Backend Server:**
   ```powershell
   cd d:\ICBT\Final\digital-therapy-agent\backend
   .\.venv\Scripts\Activate.ps1
   uvicorn main:app --host 127.0.0.1 --port 8000
   ```
2. **Start Frontend Server:**
   ```powershell
   cd d:\ICBT\Final\digital-therapy-agent\emotion-stress-frontend
   npm run dev
   ```
3. **Browser Setup:**
   * Open Google Chrome or Microsoft Edge.
   * Navigate to `http://localhost:3000`.
   * Set zoom level to **100%** (Ctrl + 0).
   * Maximize the browser window for crisp 1080p/4K resolution.

---

## 2. Screenshot Capture Tools & Settings

* **Windows Shortcut:** Press `Win + Shift + S` (Snipping Tool).
* **Selection Mode:** Choose **Window Snip** (top bar icon) or **Rectangular Snip**.
* **Quality Guideline:** Ensure no desktop taskbars or private background applications are visible.
* **Saving Format:** PNG (lossless compression).

---

## 3. Step-by-Step Scenario Guides

### Scenario A: Live Webcam Face Capture (EVID-SS-022)
1. In the therapy dashboard, click the **Insights & Telemetry** icon in the header (top-right).
2. Scroll down to the **Camera & Facial Signals** card.
3. Toggle the camera switch to **ON**.
4. Allow browser camera permission when prompted.
5. Position your face in front of the lens with good lighting.
6. Press `Win + Shift + S` and capture the video feed container showing the face detection frame and smile/furrow probabilities.
7. Save file to:
   `academic_evidence/screenshots/04_multimodal/EVID-SS-022_active_camera_feed.png`

---

### Scenario B: Live Microphone Audio Waveform (EVID-SS-040)
1. In the central chat window, click the **Microphone** icon on the right side of the Input Bar.
2. Allow microphone access.
3. Speak clearly into the microphone in English, Sinhala, or Tamil (e.g. *"I am feeling very tired after studying for long hours"*).
4. While the red pulsing recording indicator and audio animation are active, press `Win + Shift + S`.
5. Capture the Input Bar and active recording pulse.
6. Save file to:
   `academic_evidence/screenshots/06_voice_emotion/EVID-SS-040_voice_recording_active.png`

---

### Scenario C: Trilingual Speech-to-Text & TTS Demonstration
1. Switch language to **Sinhala (සිංහල)** using the language button in the header.
2. Click the microphone button and speak in Sinhala: *"මට අද ගොඩක් මහන්සියි"* ("I am very tired today").
3. Release the recording button.
4. Observe the automatic Gemini STT verbatim transcription and edge-tts audio playback indicator (`si-LK-ThiliniNeural`).
5. Capture the resulting conversational bubble.
6. Save file to:
   `academic_evidence/screenshots/10_multilingual/EVID-SS-094_sinhala_stt_tts_turn.png`

---

## 4. Final Submission Checklist

- [x] 34 core screenshots captured and indexed in `EVIDENCE_INDEX.md`.
- [x] All 3 ML model confusion matrices copied directly from training artifacts.
- [x] All 3 ML classification reports rendered as high-resolution PNGs.
- [x] Real integration test execution log and terminal image verified (13/13 passed).
- [ ] Author captures live hardware webcam feed (`EVID-SS-022`) using this guide.
- [ ] Author captures live microphone speech pulse (`EVID-SS-040`) using this guide.
