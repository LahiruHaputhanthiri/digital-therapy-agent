# MindCare: University VIVA Defense Speaker Notes & Oral Presentation Guide

**Candidate:** Haputhanthirige Thushara Lahiru Kavishal (Lahiru Kavishal)  
**Student ID:** st20360354 | **Registration No:** KG/BSCSD/16/41  
**Degree:** BSc (Hons) Software Engineering  
**Supervisor:** Dr. T.S.A. Gunawardena  
**Module:** CSE6035 Development Project (PRES1 Evaluation — 20% Module Weighting)  
**Project Title:** MindCare — Emotion Recognition & Mental Support System Using AI Voice Assistant  
**Institution:** Cardiff Metropolitan University / ICBT Campus  
**Target Duration:** 12 to 14 Minutes (+ 5–10 Minutes Panel VIVA Q&A)  
**Primary Deliverable:** `st20360354_CSE6035_PRES1_MindCare.pdf` / `MindCare_CSE6035_Presentation.pptx`

---

## Defense Timing & Pacing Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│ TIMELINE BREAKDOWN (Target: 13:00 Minutes)                              │
│ • Slide 1: Title & Introduction                  (0:30 min)            │
│ • Slide 2: Introduction & Problem Statement      (1:00 min)            │
│ • Slide 3: Literature Review & Research Gap      (1:15 min)            │
│ • Slide 4: Aim & Research Objectives             (0:45 min)            │
│ • Slide 5: Methodology & System Architecture     (1:15 min)            │
│ • Slide 6: ML Implementation (FER & SER)         (1:15 min)            │
│ • Slide 7: Multimodal Fusion & Stress Estimation (1:00 min)            │
│ • Slide 8: Therapy, Multilingual & Privacy       (1:00 min)            │
│ • Slide 9: Testing & Empirical Validation        (0:45 min)            │
│ • Slide 10: LIVE ARTEFACT DEMONSTRATION          (4:00 mins - CRITICAL)│
│ • Slide 11: Critical System Limitations          (0:45 min)            │
│ • Slide 12: Future Work & Strategic Roadmap      (0:45 min)            │
│ • Slide 13: References, Q&A & Formal Defense     (0:30 min)            │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Slide 1 — Title Slide

### What to say
> "Good morning, respected members of the examination panel and examiners. My name is Lahiru Kavishal, and today I am presenting my final-year BSc (Hons) Software Engineering dissertation project titled **'MindCare: Emotion Recognition and Mental Support System Using AI Voice Assistant'** for module CSE6035.
> Under the supervision of Dr. T.S.A. Gunawardena at ICBT Campus, in partnership with Cardiff Metropolitan University, I have designed and developed an intelligent, privacy-conscious digital wellness companion. MindCare provides real-time multimodal affective estimation and culturally attuned, trilingual non-clinical support."

### Key points to emphasize
- Full candidate identity (`st20360354 / KG/BSCSD/16/41`) and university affiliation.
- Clear positioning: AI voice assistant with affective sensing and guided non-clinical wellness support.
- Professional academic tone.

### Evidence / Visual to point at
- Slide title, candidate credentials, and formal institutional badges.

### Possible VIVA Questions & Suggested Answers
- **Q:** *What inspired the focus on multimodal emotion recognition for mental wellness?*  
  **A:** Conventional mental wellness chatbots rely entirely on typed text, which increases cognitive friction during acute distress and fails to capture rich, non-verbal facial and vocal expressions.

---

## Slide 2 — Introduction & Problem Statement

### What to say
> "Globally, the World Health Organization reports that 1 in 4 individuals will suffer from a mental health condition during their lifetime, with over 76% of affected people in low- and middle-income countries receiving zero professional care.
> In Sri Lanka, this crisis is intensified by a severe clinical workforce deficit: only 0.2 psychiatrists per 100,000 population, against an alarming suicide mortality rate of 14.6 per 100,000. Cultural stigma further discourages people from seeking traditional in-person clinical consultations.
> Current digital solutions fail because they are almost exclusively English-centric, text-heavy, and non-affective. Typing out emotional trauma during acute anxiety introduces significant interaction friction. MindCare addresses this by providing non-invasive camera and microphone sensing coupled with native Sinhala, Tamil, and English guided support."

### Key points to emphasize
- Severe clinical deficit in Sri Lanka (0.2 psychiatrists / 100k vs WHO recommendations).
- Usability barrier: typing detailed feelings during acute distress causes user drop-off.
- Need for localized, low-barrier, trilingual digital wellness tools.

### Evidence / Visual to point at
- **Figure 1 (EVID-SS-001):** MindCare landing interface demonstrating trilingual accessibility and privacy-first framing.

### Possible VIVA Questions & Suggested Answers
- **Q:** *Why is Sri Lanka specifically vulnerable to digital mental health disparities?*  
  **A:** Beyond the workforce deficit, language barriers are significant; over 90% of commercial therapeutic bots operate solely in English, excluding Sinhala and Tamil speaking populations.

---

## Slide 3 — Literature Review & Research Gap

### What to say
> "Our critical review of the literature revealed four pivotal themes:
> First, unimodal affective computing is inherently fragile: facial recognition is vulnerable to lighting and head posture, speech recognition degrades under ambient noise, and manual typing imposes high cognitive friction.
> Second, multimodal late fusion offers the highest modularity and stability, allowing independent feature extractors to run asynchronously without crashing if a sensor drops out.
> Third, unrestricted generative AI poses severe safety hazards—such as hallucinations and sycophancy—in psychological contexts, making constrained state-machine workflows essential.
> Fourth, existing tools remain heavily English-centric.
> Consequently, our identified research gap is the lack of a low-barrier system that integrates multimodal sensing, native trilingual localization, and constrained conversational safety within a unified, privacy-conscious platform."

### Key points to emphasize
- Unimodal vulnerability (Dinges et al., 2005; Khubrani, 2026; Suri et al., 2026).
- Risks of unconstrained LLMs in mental health (Patel et al., 2026; Rezaei et al., 2026).
- The 4-pillar research gap synthesized from Thesis Chapter 2.

### Evidence / Visual to point at
- 4 Theme cards (01 Unimodal, 02 Fusion, 03 AI Safety, 04 Localization) and the highlighted Research Gap container with core capability pills.

### Possible VIVA Questions & Suggested Answers
- **Q:** *Why did you choose Late Fusion over Early Fusion based on your literature findings?*  
  **A:** Early fusion requires synchronizing heterogeneous high-dimensional raw tensors (video frames vs audio spectrograms) at the same sampling rate, making it computationally heavy and brittle to missing sensors. Late fusion aggregates independent class probability distributions, enabling graceful single-sensor degradation.

---

## Slide 4 — Aim & Research Objectives

### What to say
> "To address this gap, our primary aim is to:
> *'Develop a trilingual, multimodal and privacy-conscious AI-based wellness companion capable of estimating emotional states and providing guided non-clinical support.'*
> To achieve this aim, we formulated six distinct research objectives:
> 1. Real-time facial emotion recognition across 7 universal classes.
> 2. Acoustic speech emotion recognition over 40-dimensional MFCC features.
> 3. Asynchronous multimodal late fusion with polar conflict detection.
> 4. Stage-aware constrained CBT conversational dialogue using a state machine and deterministic fallback rules.
> 5. Full trilingual accessibility across English, Sinhala, and Tamil.
> 6. Privacy-conscious processing with in-memory handling and local privacy masking."

### Key points to emphasize
- Full, verbatim project aim statement.
- 6 measurable, technically verifiable objectives directly linked to implementation and testing.
- Non-clinical wellness scope.

### Evidence / Visual to point at
- Primary aim banner and the 6 numbered objective cards.

### Possible VIVA Questions & Suggested Answers
- **Q:** *How do you define 'non-clinical guided support' in this project?*  
  **A:** The system does not diagnose mental illnesses or prescribe pharmacological treatments. It provides emotional validation, reflective cognitive-behavioural framing, physiological de-escalation exercises, and direct helpline referrals.

---

## Slide 5 — Methodology & System Architecture

### What to say
> "Here I am illustrating our development methodology and system architecture.
> We followed an adapted 12-week Agile-Scrum framework for continuous sprint iterations, combined with the CRISP-DM lifecycle for machine learning governance.
> Looking at Figure 4, the platform is decoupled into four clean layers:
> - The **Presentation Tier** is built on Next.js and React, handling WebRTC media capture and WebSocket streaming.
> - The **API Gateway Tier** runs Python FastAPI with Uvicorn, managing asynchronous WebSocket connections and JWT authentication.
> - The **ML Inference Tier** houses our TensorFlow facial model, Librosa acoustic pipeline, and tabular classifiers.
> - Persistent application data is managed via SQLite 3 using SQLAlchemy ORM.
> Figure 10 demonstrates the asynchronous sequence flow: media streams to the backend, parallel ML inferences occur via worker threads, emotions are fused, and Gemini generates a structured response without blocking the 60 FPS UI."

### Key points to emphasize
- 4-Tier decoupled architecture (Next.js &rarr; FastAPI &rarr; ML Inference &rarr; SQLite 3).
- Non-blocking asynchronous event loop via `asyncio.to_thread`.
- Accurate tech stack: strictly FastAPI, SQLite 3, TensorFlow, and WebRTC (no Node.js backend / MongoDB).

### Evidence / Visual to point at
- **Figure 4:** High-Level Decoupled Architecture diagram (thesis Figure 4).
- **Figure 10:** End-to-End Multimodal Sequence Flow (thesis Figure 10).

### Possible VIVA Questions & Suggested Answers
- **Q:** *Why did you choose FastAPI over traditional frameworks like Flask or Django?*  
  **A:** FastAPI provides native ASGI asynchronous WebSocket handling, high concurrency via `uvloop`, and automatic Pydantic request validation, making it ideal for streaming real-time audio and video packets without blocking I/O.

---

## Slide 6 — ML Implementation: Facial & Speech Emotion

### What to say
> "For machine learning implementation, we evaluated both facial and vocal emotion models on held-out test partitions.
> For Facial Emotion Recognition on the FER-2013 dataset (N=7,178 test samples):
> Our custom baseline 2D-CNN achieved **61.90% accuracy**, whereas fine-tuned MobileNetV2 achieved **40.53% accuracy**. Consequently, the baseline CNN was deployed in production.
> Our empirical analysis revealed that MobileNetV2 suffered from a domain gap: transfer learning features pretrained on ImageNet (224x224 RGB natural objects) did not transfer well to low-resolution (48x48) grayscale facial crops with high label noise.
> For Speech Emotion Recognition on RAVDESS and TESS datasets:
> Our baseline DNN achieved **53.60% accuracy** over 40 mean-pooled MFCC features across 6 classes, outperforming the 1D-CNN (50.84%).
> As shown in the confusion matrices, Happy (62.8%) and Surprise (67.5%) exhibit the highest recognition stability."

### Key points to emphasize
- Clearly distinguish models: Baseline 2D-CNN (**61.90%**) vs MobileNetV2 (**40.53%**); Speech DNN (**53.60%**).
- Explicit domain gap explanation for MobileNetV2 underperformance.
- 40-dimensional MFCC extraction sampled at 22,050 Hz.

### Evidence / Visual to point at
- **EVID-SS-151:** Normalized Facial Confusion Matrix.
- **EVID-SS-153:** Normalized Speech Confusion Matrix.
- Prominent accuracy comparison cards and the empirical finding callout.

### Possible VIVA Questions & Suggested Answers
- **Q:** *Why did MobileNetV2 underperform compared to the simpler custom 2D-CNN?*  
  **A:** FER-2013 images are 48x48 grayscale with significant intra-class variance and label noise (~65% human ceiling). Upscaling to 96x96 introduces interpolation blur, while MobileNetV2's deeper feature representations overfitted to higher-level ImageNet spatial textures rather than localized facial action units.

---

## Slide 7 — Multimodal Fusion & Stress Estimation

### What to say
> "To synthesize the affective signals, MindCare implements a 50/50 weighted late fusion strategy across normalized facial and speech probability distributions.
> A critical feature is our **Polar Conflict Detection**: when opposing valences are detected simultaneously—such as a smiling face paired with a crying, distressed voice—the system flags the state as *'Uncertain'* rather than computing an inaccurate average.
> If one sensor is unavailable or disabled by the user, the engine provides graceful single-modality degradation.
> The fused emotion is mapped to our Somatic Stress Index using clinical weightings: Fear (0.90), Anger (0.85), and Sadness (0.75) represent high stress, while Joy (0.15) and Neutral (0.30) indicate low stress.
> Figure 2 and Figure 3 show our live telemetry drawer displaying real-time gauge updates and 7-class probability distributions."

### Key points to emphasize
- Late fusion formula: `fused_prob[e] = 0.50 * P_face[e] + 0.50 * P_voice[e]`.
- Polar conflict logic (Happy + Sad &rarr; Uncertain).
- Clinical emotion-to-stress mapping weights and 3-tier thresholds (<0.35 Low, 0.35–0.69 Moderate, &ge;0.70 High).

### Evidence / Visual to point at
- **Figure 2 (EVID-SS-050):** Somatic Stress Gauge.
- **Figure 3 (EVID-SS-032):** 7-Class Emotion Distribution Telemetry.

### Possible VIVA Questions & Suggested Answers
- **Q:** *What happens if the user turns off the camera? Does the system break?*  
  **A:** No. The engine detects the missing visual stream and automatically falls back to single-modality speech emotion estimation. If both sensors are disabled, it defaults to neutral text-based interaction with 0.70 baseline confidence.

---

## Slide 8 — Therapy, Multilingual Support & Privacy

### What to say
> "Our therapeutic and privacy architecture rests on three core pillars:
> First, our **Constrained CBT Therapy Engine**: Google Gemini Flash 3.7 operates under strict structured JSON output schemas and an Empathy-First rule—meaning it validates user distress before suggesting any exercises. It transitions across five discrete stages: Crisis, Coping, Early Listening, Exploration, and De-escalation, backed by a deterministic local rule fallback if the LLM exceeds 1.5 seconds.
> Second, **Trilingual Cultural Localization**: the UI and therapeutic vocabulary support native English, Sinhala, and Tamil scripts, synthesized using host-available neural voices such as *si-LK-Thilini* and *ta-LK-Saranya*.
> Third, **Privacy-Conscious Architecture**: camera frames and audio buffers undergo temporary in-memory processing and are immediately garbage-collected with zero server video recording. Users can enable local privacy blurring, and all stored chat records are isolated by user ID with GDPR cascade deletion."

### Key points to emphasize
- Empathy-First Rule & 5-stage CBT state machine.
- Local deterministic fallback rule engine for latency and safety guarantees.
- In-memory media processing (zero persistent video storage) + GDPR cascade deletion.

### Evidence / Visual to point at
- **Figure 4 (EVID-SS-003):** Therapy Workspace with live conversational bubble and active stage badge.
- **Figure 5 (EVID-SS-130):** Privacy Settings Modal with per-sensor consent toggles.

### Possible VIVA Questions & Suggested Answers
- **Q:** *How do you prevent the LLM from giving dangerous advice in self-harm scenarios?*  
  **A:** We implement a pre-LLM deterministic regex keyword filter in English, Sinhala, and Tamil. If crisis keywords are detected, the system overrides LLM generation, enters the `CRISIS` stage immediately, and renders verified helpline resources including Sri Lanka's 1926 National Helpline.

---

## Slide 9 — Testing & Empirical Validation

### What to say
> "To verify platform integrity and security, we executed an automated end-to-end integration and security test suite.
> As shown on the slide, all **13 out of 13 automated test assertions passed with a 100% success rate**.
> The test suite validated:
> - JWT authentication and 24-hour token lifecycles.
> - 3-Tier Role-Based Access Control, confirming that standard users are strictly blocked with HTTP 403 on unauthorized escalation endpoints.
> - SQLite schema integrity and cascading entity deletions.
> - Strict user-scoped chat log isolation preventing cross-tenant data leakage.
> - WebSocket connection stability with automated heartbeat monitoring.
> - ML health checks verifying that all tensor weights and scalers load into memory without corruption."

### Key points to emphasize
- **13 / 13 AUTOMATED TESTS PASSED** (100% pass rate).
- Multi-domain testing: Security (RBAC), Authentication (JWT), Database (ORM/Cascade), API/WebSocket, and ML pipelines.
- Traceable project evidence from actual terminal test execution (`run_and_capture_tests.py`).

### Evidence / Visual to point at
- **Figure 6 (EVID-SS-140):** Automated Test Execution terminal output displaying all 13 passed assertions.

### Possible VIVA Questions & Suggested Answers
- **Q:** *How did you test role-based access control?*  
  **A:** We issued signed JWT tokens for three distinct roles: `AliceUser` (user), `BobAdmin` (admin), and `RootSuperAdmin` (super admin). Automated requests then attempted unauthorized administrative actions using the standard user token, asserting that the FastAPI security middleware returned HTTP 403 Forbidden.

---

## Slide 10 — LIVE ARTEFACT DEMONSTRATION (4:00 Minutes)

### What to say & Demonstration Flow
> "I will now conduct the live software demonstration of MindCare following a structured 10-step workflow across our frontend, backend, and machine learning components:
> 
> **[Step 1: Backend & Service Health]**  
> 'First, we observe our FastAPI backend running on port 8000 with TensorFlow and Librosa models loaded in memory.'
> 
> **[Step 2: Authentication & Trilingual Landing]**  
> 'Opening `http://localhost:3000`, we see the landing interface. I will toggle the language selector to Sinhala (සිංහල) and Tamil (தமிழ்), demonstrating instant re-rendering of localized scripts. We log in using our test account `AliceUser`.'
> 
> **[Step 3: WebRTC Media Acquisition & Privacy Blur]**  
> 'Entering the therapy workspace, we grant camera and microphone permissions. Notice the privacy toggle which applies client-side real-time Gaussian blur to the camera preview.'
> 
> **[Step 4 & 5: Facial & Vocal Emotion Sensing]**  
> 'As I speak into the microphone: *\"I feel overwhelmed by my dissertation deadlines,\"* the audio chunk is captured via WebRTC and transmitted over WebSockets.'
> 
> **[Step 6: Multimodal Fusion & Live Telemetry]**  
> 'The backend executes facial and voice inference in parallel. Opening the telemetry drawer, we observe the Somatic Stress Gauge updating live to 42% Moderate Stress with 7-class emotion probabilities.'
> 
> **[Step 7 & 8: Empathy-First Dialogue & Neural TTS]**  
> 'The AI responds with emotional validation before prescribing exercises. We listen to the neural speech synthesis.'
> 
> **[Step 9: Interactive De-escalation & Crisis Interlock]**  
> 'I will now trigger Box Breathing, launching a soothing 4-4-4-4 animated breathing circle. Demonstrating safety, typing crisis keywords immediately invokes the Sri Lanka 1926 National Helpline modal.'
> 
> **[Step 10: Admin Governance]**  
> 'Finally, switching to the Admin account reveals our user management directory, chat volume statistics, and ML pipeline health metrics.'"

### Key points to emphasize
- Full end-to-end integration: Browser &rarr; WebSocket &rarr; ML &rarr; Gemini &rarr; TTS &rarr; DB.
- Live feature proof: Trilingual i18n, Box Breathing overlay, 1926 Crisis Helpline, and Admin RBAC.
- Fast sub-1.5s response latency.

### Evidence / Visual to point at
- Live application on screen, supported by backup visuals: **Figure 7 (EVID-SS-080)** Box Breathing & **Figure 8 (EVID-SS-120)** Admin Dashboard.

---

## Slide 11 — Critical System Limitations

### What to say
> "In accordance with academic rigor, we critically acknowledge four primary system limitations:
> First, the **Visual Domain Gap**: FER-2013 contains 48x48 low-resolution grayscale crops with high intra-class label noise (~65% human agreement ceiling). This domain mismatch caused fine-tuned MobileNetV2 to underperform (40.53%) compared to our custom baseline CNN (61.90%).
> Second, **Speech Acoustic Loss**: mean-pooling across 40 static MFCC features discards temporal pitch transitions and prosodic contours, leaving the SER model sensitive to ambient room noise and microphone hardware.
> Third, **Platform Dependency**: regional browser-native neural TTS for Sinhala and Tamil depends on host operating system voice packs, requiring cloud API fallbacks on unsupported browsers.
> Fourth, **Evaluation Constraint**: FER and SER models were evaluated on separate public datasets; no unified multimodal benchmark dataset exists, and the platform has not yet undergone longitudinal clinical trials."

### Key points to emphasize
- Complete academic transparency: no exaggerated or fabricated claims.
- Explicit explanation of FER-2013 resolution limits and MFCC temporal loss.
- Non-clinical boundary.

### Evidence / Visual to point at
- 4 Limitations cards (01 Domain Gap, 02 Acoustic Loss, 03 TTS Dependency, 04 Academic Scope) and the Academic Integrity Note.

### Possible VIVA Questions & Suggested Answers
- **Q:** *Why is there no single multimodal accuracy percentage reported for the whole system?*  
  **A:** Because facial and speech models were trained and evaluated on independent benchmark datasets (FER-2013 for vision; RAVDESS/TESS for speech). Stating an arbitrary combined accuracy without an empirical paired multi-sensor test benchmark would be academically unscientific.

---

## Slide 12 — Future Work & Strategic Roadmap

### What to say
> "To address these limitations, we have structured a four-phase strategic development roadmap:
> In **Phase 1 (Data & Temporal Models)**, we will train on synchronized paired audio-visual corpora such as CREMA-D and deploy Vision Transformers (ViT) for facial features alongside wav2vec 2.0 and LSTM for temporal acoustic dynamics.
> In **Phase 2 (Deep Fusion)**, we will replace static 50/50 late fusion with attention-based cross-modal fusion that dynamically weights modalities based on real-time signal-to-noise ratio and face visibility.
> In **Phase 3 (Biometric Sensing)**, we plan to integrate Bluetooth smart wearables to capture Heart Rate Variability (HRV) and Electrodermal Activity (EDA) for objective physiological stress validation.
> In **Phase 4 (Clinical Trials)**, we will conduct an IRB-approved longitudinal clinical trial with certified psychologists to validate therapeutic efficacy in Sri Lankan healthcare settings."

### Key points to emphasize
- Concrete 4-phase technical roadmap (Transformers, Cross-Attention, Wearables, Clinical Trials).
- Long-term vision: evolving from a non-clinical wellness assistant into an evidence-based digital therapeutic platform.

### Evidence / Visual to point at
- 4 Roadmap cards (Phase 1 Data, Phase 2 Fusion, Phase 3 Biometrics, Phase 4 Trials) and the Strategic Vision banner.

### Possible VIVA Questions & Suggested Answers
- **Q:** *How would attention-based fusion improve upon your current 50/50 late fusion?*  
  **A:** Attention mechanisms calculate dynamic softmax weights based on feature certainty—for instance, if the user turns away from the camera, facial attention automatically drops to 0.1 while acoustic attention scales to 0.9.

---

## Slide 13 — References & Q&A Closing Slide

### What to say
> "In conclusion, MindCare demonstrates that real-time multimodal affective sensing, controlled generative AI, and cultural localization can be harmonized to deliver an accessible, safe, and privacy-conscious wellness companion for underserved communities.
> I would like to extend my sincere gratitude to my supervisor, Dr. T.S.A. Gunawardena, the academic panel, and Cardiff Metropolitan University.
> Thank you for your time. I am now delighted to take your questions."

### Key points to emphasize
- Final synthesis of project contribution.
- Candidate credentials: `st20360354 / KG/BSCSD/16/41`.
- Formal, confident opening for the panel Q&A session.

### Evidence / Visual to point at
- Harvard references list (Zhang et al. 2022, Patel et al. 2026, Khubrani 2026, Goodfellow et al. 2013, WHO 2022).

---

# COMPREHENSIVE VIVA QUESTIONS & DEFENSE ANSWERS

### 1. Why did the baseline 2D-CNN outperform fine-tuned MobileNetV2?
**Model Defense Answer:**
> "MobileNetV2 was pre-trained on ImageNet, which consists of high-resolution 224x224 RGB photographs of diverse real-world objects. In contrast, FER-2013 contains low-resolution (48x48) grayscale facial crops with substantial intra-class label noise (~65% human agreement). Upscaling 48x48 images to 96x96 introduced interpolation artifacts, and MobileNetV2's deeper feature hierarchy overfitted to ImageNet spatial statistics. Our custom baseline 2D-CNN, with compact localized convolutional kernels and direct dropout regularization, proved much better adapted to low-resolution facial action units, achieving 61.90% vs 40.53% for MobileNetV2."

### 2. Why was Late Fusion selected over Early or Intermediate Fusion?
**Model Defense Answer:**
> "Early fusion concatenates raw features prior to classification. However, video frames (2D spatial pixel matrices) and audio signals (1D acoustic waveforms) operate at completely different sampling rates and dimensionalities. Early fusion requires complex temporal synchronization and collapses if one sensor disconnects. Late fusion computes independent posterior probability distributions, enabling modular asynchronous execution, graceful single-sensor degradation, and explicit polar conflict detection."

### 3. How does the 50/50 weighted fusion mathematically operate?
**Model Defense Answer:**
> "Both the facial CNN and speech DNN output normalized softmax probability distributions across the 7 canonical emotion classes. The late fusion engine computes:
> `fused_prob[emotion] = 0.50 * P_face[emotion] + 0.50 * P_voice[emotion]`
> The emotion class with the highest fused probability is selected as the dominant state. If only one modality is active, the active modality's probability distribution is passed through at 1.0 weight."

### 4. What happens when face and voice disagree (e.g., smiling face but crying voice)?
**Model Defense Answer:**
> "Our engine implements explicit **Polar Conflict Detection**. If the facial model detects a positive valence (Happy with probability > 0.40) while the speech model detects a high-distress negative valence (Sadness or Fear with probability > 0.40), the system suppresses a misleading mathematical average and assigns an *'Uncertain'* emotional label with a moderate 0.50 stress weighting. This prevents the CBT conversational agent from offering inappropriate responses."

### 5. Why did you choose Python FastAPI for the backend instead of Node.js or Flask?
**Model Defense Answer:**
> "FastAPI is built natively on Starlette and `uvloop`, providing asynchronous non-blocking ASGI WebSocket concurrency. Because our ML inference models (TensorFlow and Librosa) run natively in Python, using FastAPI eliminated the need for inter-process communication between a separate Node.js server and Python ML scripts. Furthermore, FastAPI's Pydantic schemas enforce strict data validation on all incoming telemetry payloads."

### 6. Why are WebSockets used instead of standard REST API polling?
**Model Defense Answer:**
> "Multimodal streaming requires continuous bi-directional communication. HTTP polling incurs heavy request-header overhead and latency jitter. WebSockets establish a single persistent full-duplex TCP connection, enabling real-time streaming of base64 audio/video chunks and instantaneous broadcast of `AI_REPLY`, `METRICS_UPDATE`, and `SAFETY_ALERT` events with sub-50ms network latency."

### 7. Why is SQLite 3 used with SQLAlchemy instead of MongoDB or PostgreSQL?
**Model Defense Answer:**
> "For this standalone prototype and single-instance deployment, SQLite 3 provides zero-configuration, serverless, file-based relational persistence with zero external infrastructure overhead. SQLAlchemy ORM provides clean model abstractions, type safety, relationship mapping, and cascading foreign-key deletions. The architecture is database-agnostic, meaning switching to PostgreSQL for production requires changing only the database connection string in `.env`."

### 8. How is privacy guaranteed during webcam and microphone processing?
**Model Defense Answer:**
> "MindCare follows a privacy-by-design architecture:
> 1. Explicit browser sensor consent is required before any media stream initializes.
> 2. The client interface includes an optional Gaussian blur filter for the local video preview.
> 3. Video frames and audio buffers are processed ephemerally in server RAM and immediately discarded; zero raw video or audio files are ever written to disk or permanent databases.
> 4. All stored chat logs are strictly isolated by User ID with complete cascade deletion upon account termination."

### 9. What are the limitations of browser-native Text-to-Speech (TTS)?
**Model Defense Answer:**
> "Browser-native SpeechSynthesis depends on the underlying operating system and browser vendor's installed voice packs. While English (`en-US`) is universally supported, native Sinhala (`si-LK`) and Tamil (`ta-LK`) voices are missing on certain legacy OS installations. To ensure accessibility, MindCare incorporates server-side Edge Neural TTS fallbacks (*si-LK-ThiliniNeural*, *ta-LK-SaranyaNeural*) that stream base64 MP3 audio when local voices are unavailable."

### 10. Why use Gemini if LLM hallucination is a major risk in mental health?
**Model Defense Answer:**
> "We do not allow Gemini to operate as an unconstrained, open-ended chatbot. Instead:
> 1. It is bound by structured JSON output schemas that restrict its output to therapeutic dialogues, stage transitions, and recommended coping IDs.
> 2. Strict system instructions enforce an 'Empathy-First' protocol.
> 3. A pre-LLM deterministic regex keyword filter intercepts crisis/self-harm language before LLM execution, immediately invoking hardcoded emergency protocols and helplines."

### 11. How does the local deterministic fallback mechanism work?
**Model Defense Answer:**
> "If an external API timeout (>1.5s), network disconnection, or LLM failure occurs, the backend catches the exception and immediately invokes a localized rule-based fallback engine. This engine selects pre-validated, culturally appropriate therapeutic responses in English, Sinhala, or Tamil matched to the user's current stress level, ensuring the user is never left without guidance."

### 12. Why is this system categorized as 'non-clinical'?
**Model Defense Answer:**
> "MindCare is designed as an emotional self-regulation and stress decompression companion, not a medical diagnostic device. It does not diagnose DSM-5 psychiatric conditions, prescribe medications, or replace certified healthcare professionals. All user screens display clear disclaimers, and acute distress is immediately redirected to official helplines (such as 1926 in Sri Lanka)."

### 13. Why is there no single unified multimodal accuracy metric?
**Model Defense Answer:**
> "FER-2013 contains only static facial images, while RAVDESS/TESS contains audio speech recordings. Because no public, culturally representative paired audio-visual dataset was available for Sri Lankan populations, the models had to be trained and evaluated on their respective domain benchmarks. Reporting an artificial 'combined accuracy' without a paired multimodal test dataset would be academically dishonest."

### 14. What are the primary dataset limitations of FER-2013?
**Model Defense Answer:**
> "FER-2013 was scraped from Google Images in 2013 and exhibits several known issues: low 48x48 grayscale resolution, significant class imbalance (high Happy/Neutral vs low Disgust), subjective annotator label noise (human agreement is estimated at only ~65%), and synthetic cartoon/drawing inclusions. Modern benchmarks such as AffectNet or RAF-DB provide higher resolution and cleaner annotations."

### 15. If given another six months, what would you improve in the system?
**Model Defense Answer:**
> "I would prioritize three enhancements:
> 1. Collect an ethical, IRB-approved paired audio-visual dataset of bilingual Sri Lankan speakers to train an end-to-end Cross-Attention Transformer.
> 2. Replace static MFCC mean-pooling with wav2vec 2.0 or a 1D-CNN-BiLSTM to preserve temporal pitch and prosodic intonation.
> 3. Conduct a controlled multi-user usability study in collaboration with clinical psychologists to measure real-world reduction in self-reported stress."
