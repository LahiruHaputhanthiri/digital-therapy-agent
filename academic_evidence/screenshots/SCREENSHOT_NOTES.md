# Screenshot & Technical Evidence Notes

This document provides important technical context, architectural observations, and academic disclaimers regarding the screenshot evidence collection for the MindCare Multimodal Emotion Recognition and Guided Support System.

---

## 1. Zero-Fabrication & Evidence Integrity Verification

* Every single screenshot in `academic_evidence/screenshots/` was captured directly from the **live running system** or extracted verbatim from **actual stored machine learning training artifacts**.
* **No mockups, synthetic graphics, or Photoshop manipulations** were used.
* The test execution screenshot `EVID-SS-140_test_execution.png` represents an actual execution of `test_auth_db.py` against the running SQLite database and FastAPI application, achieving 13/13 passing assertions.

---

## 2. Key UI Architecture Observations

### A. Zen / Focus-First Therapeutic Architecture
* In earlier prototypes, real-time biometric dials and face camera feeds were constantly visible on the main screen.
* Following digital therapeutic best practices (DTx), the production interface uses a **Focus-First Zen Layout** where the central conversational stream is uncluttered. Real-time biometric dials, keystroke dynamics, and raw video feeds are housed in the on-demand **Telemetry Slide-Over Drawer** (`TelemetryDrawer`) to prevent "Biofeedback Anxiety" and cognitive overload for distressed users.

### B. Empathy-First Conversational Protocol
* As proven in `EVID-SS-072_cbt_oriented_response.png`, when a user expresses high fatigue, burnout, or sadness, the system transitions to the `EARLY_LISTENING` conversational stage. It provides genuine emotional validation ("That sounds like it's been a really heavy day...") rather than immediately prescribing breathing or grounding exercises before the user is ready.

### C. Crisis Intervention & National Mental Health Helpline
* `EVID-SS-082_crisis_safety_support.png` proves the integration of the Sri Lankan National Mental Health Helpline (**1926**, 24/7 Toll-Free) and 1333 CCF emergency resources, satisfying clinical safety standards for digital wellness software.

---

## 3. Discrepancies & Academic Advice for Thesis Chapter 6 & 7

1. **Database Representation:**
   * Ensure Chapter 6 and 7 accurately describe the persistence tier as **SQLite via SQLAlchemy ORM** with cascade deletion, rather than MongoDB.
2. **AI Model Metrics Representation:**
   * **FER Model (MobileNetV2):** Test accuracy is **40.53%** (baseline CNN was 61.90%). Explain this transparently in Chapter 7 as a trade-off of transfer learning with limited fine-tuning epochs on low-resolution grayscale crops.
   * **SER Model (1D-CNN):** Test accuracy is **50.84%** across 6 emotion classes on 40 MFCC features.
   * **Health Risk Model (Random Forest):** Test accuracy is **100.00%**. Explicitly note in the dissertation that this high score is due to synthetic/separable feature distributions and should not be claimed as clinical diagnostic efficacy.
