# FINAL_VIVA_SPEAKER_NOTES

**Project Title:** MindCare — Emotion Recognition & Mental Support System Using AI Voice Assistant  
**Candidate:** Haputhanthirige Thushara Lahiru Kavishal (Lahiru Kavishal)  
**Student ID:** st20360354 | **Registration No:** KG/BSCSD/16/41  
**Module:** CSE6035 Development Project (PRES1 Evaluation — 20% Module Weighting)  
**Degree:** BSc (Hons) Software Engineering  
**Supervisor:** Dr. T.S.A. Gunawardena  
**Institution:** Cardiff Metropolitan University / ICBT Campus  
**Presentation Deck:** `MindCare_CSE6035_Presentation.pptx` / `MindCare_CSE6035_Presentation.pdf` (15 Slides)  
**Total Target Timing:** 12 to 14 Minutes (+ 5–10 Minutes Panel VIVA Q&A)

---

## Slide 1 — Title Slide

### What to Say
"Good morning, respected examiners and members of the evaluation panel. My name is Lahiru Kavishal, and today I am presenting my final-year BSc (Hons) Software Engineering dissertation project titled **'MindCare: Emotion Recognition and Mental Support System Using AI Voice Assistant'** for module CSE6035.
Under the supervision of Dr. T.S.A. Gunawardena at ICBT Campus in partnership with Cardiff Metropolitan University, I have designed and developed an intelligent, privacy-conscious digital wellness companion. MindCare provides real-time multimodal affective estimation and culturally attuned, trilingual non-clinical support."

### Key Point
Establish formal candidate identity (`st20360354 / KG/BSCSD/16/41`) and define the project scope: an AI voice assistant with affective sensing and non-clinical wellness support.

### Transition
"To understand the critical motivation behind this research, let us examine the acute mental health crisis and systemic clinical deficit facing Sri Lanka today."

### Possible Examiner Question
*What inspired the focus on multimodal emotion recognition for mental wellness?*

### Suggested Answer
"Conventional mental health applications rely entirely on typed text input, which introduces severe cognitive friction during acute anxiety or panic. By integrating non-invasive facial and speech emotion recognition, MindCare captures spontaneous, non-verbal affective signals in real time without imposing an interaction burden on distressed individuals."

---

## Slide 2 — Introduction & Problem Statement

### What to Say
"Globally, the World Health Organization estimates that 1 in 4 individuals will experience a mental health condition, with over 76% of people in low- and middle-income countries receiving zero professional care.
In Sri Lanka, this crisis is intensified by a severe clinical workforce deficit: only 0.2 psychiatrists per 100,000 population, against an alarming national suicide mortality rate of 14.6 per 100,000. Cultural stigma further discourages people from seeking traditional in-person clinical consultations.
Current digital tools fail because they are almost exclusively English-centric, text-heavy, and non-affective. Typing out emotional trauma during acute distress introduces severe cognitive friction. MindCare bridges this barrier by combining low-barrier multimodal sensing with native Sinhala, Tamil, and English guided support."

### Key Point
Highlight the severe clinical deficit in Sri Lanka (0.2 psychiatrists / 100k vs WHO recommendations) and explain how typing friction alienates distressed users.

### Transition
"To position our engineering approach against existing academic literature, we conducted a systematic critical review across four core themes."

### Possible Examiner Question
*Why is Sri Lanka specifically vulnerable to digital mental health disparities?*

### Suggested Answer
"Beyond the clinical shortage, language barriers are pronounced. Over 90% of digital wellness applications operate exclusively in English, excluding Sinhala and Tamil speaking populations who suffer from systemic stigma and geographic isolation."

---

## Slide 3 — Literature Review & Research Gap

### What to Say
"Our critical review of the literature revealed four pivotal themes:
First, unimodal affective computing is inherently fragile: facial recognition is vulnerable to lighting and head posture as documented by Dinges et al., speech recognition degrades under ambient noise, and manual typing imposes high cognitive friction.
Second, multimodal late fusion offers the highest modularity and stability, allowing independent feature extractors to run asynchronously without crashing if a sensor drops out.
Third, unrestricted generative AI poses severe safety hazards—such as hallucinations and sycophancy—in psychological contexts, making constrained state-machine workflows essential.
Fourth, existing affective systems remain heavily English-centric.
Consequently, our identified research gap is the lack of a low-barrier system that integrates multimodal sensing, native trilingual localization, and constrained conversational safety within a unified, privacy-conscious platform."

### Key Point
Unimodal fragility justifies multimodal late fusion; safety hazards in mental health necessitate constrained state-machine workflows rather than unconstrained LLMs.

### Transition
"Addressing this explicit research gap directly defined our primary aim and six technical research objectives."

### Possible Examiner Question
*Why did you choose Late Fusion over Early Fusion based on your literature findings?*

### Suggested Answer
"Early fusion concatenates raw heterogeneous tensors before classification, requiring rigid temporal alignment and crashing if a sensor is disconnected. Late fusion aggregates independent posterior probability distributions, enabling modular asynchronous execution and graceful single-sensor degradation."

---

## Slide 4 — Aim and Research Objectives

### What to Say
"To address this gap, our primary project aim is:
*'Develop a trilingual, multimodal and privacy-conscious AI-based wellness companion capable of estimating emotional states and providing guided non-clinical support.'*
To achieve this aim, we formulated six measurable engineering objectives:
1. Real-time facial emotion recognition across 7 universal classes via CNN.
2. Acoustic speech emotion recognition over 40-dimensional MFCC audio features.
3. Asynchronous multimodal late fusion with polar conflict detection and stress mapping.
4. Stage-aware constrained CBT conversational guidance using a state machine and deterministic fallback rules.
5. Full trilingual accessibility across English, Sinhala, and Tamil.
6. Privacy-conscious processing with in-memory handling and client-side sensor consent controls."

### Key Point
The complete, verbatim aim is supported by six verifiable objectives directly validated in our testing suite.

### Transition
"Let us now examine the architectural methodology and engineering design implemented to fulfill these objectives."

### Possible Examiner Question
*How do you define 'non-clinical guided support' in this project?*

### Suggested Answer
"The system does not diagnose DSM-5 psychiatric conditions or prescribe medications. It provides emotional validation, reflective cognitive-behavioural framing, physiological de-escalation exercises, and direct helpline referrals."

---

## Slide 5 — Methodology & System Architecture

### What to Say
"Our project followed an adapted 12-week Agile-Scrum framework for continuous sprint delivery, combined with the CRISP-DM lifecycle for machine learning governance.
As illustrated in Figure 4 from Thesis Chapter 5, the platform is decoupled into four clean architectural tiers:
- Tier 1: A Next.js and React presentation client handling WebRTC sensor capture and dynamic trilingual canvas rendering.
- Tier 2: A Python FastAPI API Gateway running on Uvicorn ASGI, managing full-duplex WebSockets and JWT authentication.
- Tier 3: Our ML Inference tier containing our TensorFlow facial model, Librosa acoustic pipeline, late fusion engine, and Gemini Flash 3.7.
- Tier 4: Relational persistence in SQLite 3 via SQLAlchemy ORM with user-isolated schemas and cascading deletions."

### Key Point
Decoupled 4-tier architecture (Next.js &rarr; FastAPI &rarr; ML Inference &rarr; SQLite 3) ensuring complete separation of concerns and robust data isolation.

### Transition
"To understand how data flows asynchronously between these tiers during live user interaction, let us look at the sequence workflow."

### Possible Examiner Question
*Why did you select FastAPI instead of Node.js Express for the backend?*

### Suggested Answer
"FastAPI is natively built on Python's ASGI event loop (`uvloop`), allowing our ML inference models (TensorFlow and Librosa) to execute in-process. This eliminated costly inter-process communication overhead while providing native asynchronous WebSocket streaming."

---

## Slide 6 — End-to-End System Workflow & Sequence

### What to Say
"Figure 10 from Thesis Chapter 5 details our end-to-end asynchronous sequence execution.
When a user interacts with the system:
1. The client captures webcam frames and audio buffers via WebRTC under explicit user consent.
2. A full-duplex WebSocket stream delivers base64 payloads to FastAPI with sub-50ms network latency.
3. The backend offloads heavy facial and voice inference to worker threads using `asyncio.to_thread`, keeping the main event loop non-blocking.
4. The late fusion engine computes weighted class probabilities and resolves any emotional polarity conflicts.
5. Finally, Gemini Flash 3.7 generates a stage-constrained CBT response, and audio is synthesized via TTS back to the client."

### Key Point
`asyncio.to_thread` isolates CPU-intensive tensor matrix multiplications, preserving a smooth 60 FPS client UI without WebSocket stalls.

### Transition
"Let us now inspect the empirical machine learning implementation and evaluation results."

### Possible Examiner Question
*How do WebSockets improve real-time performance over REST polling?*

### Suggested Answer
"HTTP polling incurs heavy request-header overhead and latency jitter. WebSockets maintain a single persistent full-duplex TCP connection, enabling continuous bi-directional streaming of base64 audio/video chunks and instantaneous broadcast of telemetry updates."

---

## Slide 7 — ML Implementation & Empirical Results

### What to Say
"For machine learning implementation, we evaluated facial and vocal emotion models on held-out benchmark partitions.
For Facial Emotion Recognition on the FER-2013 dataset (N=7,178 test samples):
Our custom baseline 2D-CNN achieved **61.90% accuracy**, whereas fine-tuned MobileNetV2 achieved **40.53% accuracy**. Consequently, the baseline CNN was deployed in production.
Our empirical analysis revealed that MobileNetV2 suffered from a domain gap: transfer learning features pretrained on ImageNet (224x224 RGB natural objects) did not transfer well to low-resolution (48x48) grayscale facial crops with high label noise.
For Speech Emotion Recognition on RAVDESS and TESS datasets:
Our baseline DNN achieved **53.60% accuracy** over 40 mean-pooled MFCC features across 6 classes.
As shown in the confusion matrices, Happy (62.8%) and Surprise (67.5%) exhibit the highest recognition stability."

### Key Point
Explicitly report empirical accuracies: Baseline 2D-CNN (**61.90%**), MobileNetV2 (**40.53%**), Speech DNN (**53.60%**). Document the domain gap finding transparently.

### Transition
"Once these independent visual and acoustic probabilities are computed, how does the system fuse them into a unified stress assessment?"

### Possible Examiner Question
*Why did MobileNetV2 underperform compared to the simpler custom 2D-CNN?*

### Suggested Answer
"FER-2013 images are 48x48 grayscale with significant intra-class variance and label noise (~65% human agreement). Upscaling to 96x96 introduces interpolation blur, while MobileNetV2's deeper feature representations overfitted to ImageNet spatial textures rather than localized facial action units."

---

## Slide 8 — Multimodal Fusion & Stress Estimation

### What to Say
"MindCare implements a 50/50 weighted late fusion strategy across normalized facial and speech probability distributions.
A critical innovation is our **Polar Conflict Detection**: when opposing valences are detected simultaneously—such as a smiling face paired with a crying voice—the system flags the state as *'Uncertain'* rather than computing an inaccurate average.
If one sensor is disabled, the engine provides graceful single-modality degradation.
The fused emotion is mapped to our Somatic Stress Index using clinical weightings: Fear (0.90), Anger (0.85), and Sadness (0.75) represent high stress, while Joy (0.15) and Neutral (0.30) indicate low stress.
Figure 4 and Figure 5 show our live telemetry drawer displaying real-time gauge updates and 7-class probability distributions."

### Key Point
Mathematical fusion formula `fused_prob[e] = 0.50 * P_face[e] + 0.50 * P_voice[e]`, polar conflict handling (Happy + Sad &rarr; Uncertain), and 3-tier stress thresholds.

### Transition
"Let us now examine how this affective telemetry feeds into our constrained conversational therapy engine, trilingual localization, and privacy controls."

### Possible Examiner Question
*What happens if the user disables the camera? Does the fusion engine crash?*

### Suggested Answer
"No. The engine detects the missing visual stream and automatically falls back to single-modality speech emotion estimation. If both sensors are disabled, it defaults to neutral text-based interaction with 0.70 baseline confidence."

---

## Slide 9 — Therapy, Multilingual Support & Privacy

### What to Say
"Our therapeutic and privacy architecture rests on three core pillars:
First, our **Constrained CBT Therapy Engine**: Google Gemini Flash 3.7 operates under strict JSON output schemas and an Empathy-First rule—meaning it validates user distress before suggesting any exercises. It transitions across five discrete stages: Crisis, Coping, Early Listening, Exploration, and De-escalation, backed by a deterministic local rule fallback if the LLM exceeds 1.5 seconds.
Second, **Trilingual Cultural Localization**: the UI and therapeutic vocabulary support native English, Sinhala, and Tamil scripts. Browser-native TTS is utilized, with regional Sinhala and Tamil voice availability depending on the host operating system.
Third, **Privacy-Conscious Architecture**: camera frames and audio buffers undergo temporary in-memory processing and are immediately garbage-collected with zero server video recording. Users can enable local privacy blurring, and all stored chat records are isolated by user ID with GDPR cascade deletion."

### Key Point
Empathy-first CBT state machine, local deterministic fallback engine, explicit host-dependent TTS limitation, and zero server-side raw media storage.

### Transition
"To ensure the complete reliability, security, and integrity of these components, we executed rigorous automated testing."

### Possible Examiner Question
*How do you prevent the LLM from giving dangerous advice in self-harm scenarios?*

### Suggested Answer
"We implement a pre-LLM deterministic regex keyword filter in English, Sinhala, and Tamil. If crisis keywords are detected, the system overrides LLM generation, enters the `CRISIS` stage immediately, and renders verified helpline resources including Sri Lanka's 1926 National Helpline."

---

## Slide 10 — Testing & Empirical Validation

### What to Say
"To verify platform integrity and security, we executed an automated end-to-end integration and security test suite.
As shown in Figure 8, all **13 out of 13 automated test assertions passed with a 100% success rate**.
The test suite validated:
- JWT authentication and 24-hour token lifecycles.
- 3-Tier Role-Based Access Control, confirming that standard users are strictly blocked with HTTP 403 on unauthorized escalation endpoints.
- SQLite schema integrity and cascading entity deletions.
- Strict user-scoped chat log isolation preventing cross-tenant data leakage.
- WebSocket connection stability with automated heartbeat monitoring.
- ML health checks verifying that all tensor weights and scalers load into memory without corruption.
Importantly, we maintain a clear distinction between system integration tests and our ML model evaluations on held-out test partitions."

### Key Point
**13 / 13 AUTOMATED TESTS PASSED** (100% pass rate). Clear academic distinction between software integration testing and ML statistical validation.

### Transition
"We will now proceed to the live practical software demonstration of the MindCare platform."

### Possible Examiner Question
*How did you test role-based access control?*

### Suggested Answer
"We issued signed JWT tokens for three distinct roles: `AliceUser` (user), `BobAdmin` (admin), and `RootSuperAdmin` (super admin). Automated requests then attempted unauthorized administrative actions using the standard user token, asserting that the FastAPI security middleware returned HTTP 403 Forbidden."

---

## Slide 11 — LIVE ARTEFACT DEMONSTRATION (5:00 Minutes Practical Script)

### Practical Demonstration Script
"I will now switch to the live application running in our local environment to demonstrate the end-to-end user journey across 10 sequential operational steps:

**[00:00 - 00:30] Step 1: Backend Infrastructure & Service Health**  
'Here we observe our FastAPI backend running on port 8000. Notice the startup logs confirming that our TensorFlow Facial 2D-CNN, Librosa acoustic scaler, and SQLite database have initialized successfully.'

**[00:30 - 01:00] Step 2: Application Access & Trilingual Landing Interface**  
'Navigating to `http://localhost:3000`, we see the landing interface. I will now switch the language selector to Sinhala (සිංහල) and Tamil (தமிழ்), demonstrating instant re-rendering of localized scripts. We log in using our test user `AliceUser`.'

**[01:00 - 01:30] Step 3: WebRTC Media Acquisition & Privacy Masking**  
'Upon entering the therapy workspace, we grant camera and microphone permissions. Notice the privacy control toggle in the lower right: clicking it applies client-side real-time Gaussian blurring to the local video stream, ensuring visual privacy.'

**[01:30 - 02:15] Steps 4 & 5: Facial & Vocal Emotion Sensing**  
'As I speak into the microphone: *\"I feel overwhelmed by my dissertation deadlines and I have not slept well,\"* the audio chunk is captured via WebRTC and transmitted over WebSockets. Simultaneously, OpenCV detects my facial bounding box.'

**[02:15 - 03:00] Step 6: Multimodal Late Fusion & Live Telemetry**  
'Opening the telemetry drawer, we observe the Somatic Stress Gauge updating live to 42% Moderate Stress. The 7-class probability telemetry shows high Sadness and Neutral activations, demonstrating 50/50 probability fusion and polar conflict monitoring.'

**[03:00 - 03:45] Steps 7 & 8: Guided Empathy-First CBT Dialogue & TTS**  
'Notice the AI response: *\"I hear how much pressure and weight you have been carrying...\"* The system adheres to the Empathy-First rule, validating my distress before offering interventions. We hear the synthesized voice response.'

**[03:45 - 04:30] Step 9: Interactive De-escalation & Crisis Interlock**  
'I will now trigger Box Breathing: a calming 4-4-4-4 animated breathing circle opens with audio cues. To demonstrate safety, typing *\"I want to end my life\"* immediately overrides the conversational engine and renders the Sri Lanka 1926 National Helpline modal.'

**[04:30 - 05:00] Step 10: Administrative Governance & RBAC**  
'Finally, logging out and accessing the portal as `BobAdmin` reveals our administrative governance dashboard, displaying user directories, chat volume statistics, and ML pipeline health metrics.'"

### Key Point
Demonstrate complete live system integration: WebRTC &rarr; WebSocket &rarr; ML Inference &rarr; Gemini &rarr; Box Breathing &rarr; Crisis Safety &rarr; Admin RBAC.

### Transition
"Returning to our presentation slides, let us critically examine the empirical limitations identified during this research."

---

## Slide 12 — Critical System Limitations

### What to Say
"In accordance with academic rigor, we critically acknowledge four primary system limitations:
First, the **Visual Domain Gap**: FER-2013 contains 48x48 low-resolution grayscale crops with high intra-class label noise (~65% human agreement ceiling). This domain mismatch caused fine-tuned MobileNetV2 to underperform (40.53%) compared to our custom baseline CNN (61.90%).
Second, **Platform Dependency**: regional browser-native neural TTS for Sinhala and Tamil depends on host operating system voice packs, requiring cloud API fallbacks on unsupported browsers.
Third, **Environmental Sensitivity**: speech emotion recognition is susceptible to ambient acoustic noise and microphone hardware, while facial recognition degrades under poor lighting or head rotation.
Fourth, **Evaluation Constraint**: FER and SER models were evaluated on separate public datasets; no unified multimodal benchmark dataset exists, and the platform has not yet undergone longitudinal clinical trials."

### Key Point
Transparent academic honesty: document FER-2013 resolution limits, acoustic noise sensitivity, OS-dependent TTS, and the non-clinical boundary.

### Transition
"These empirical findings directly inform our future research and strategic development roadmap."

### Possible Examiner Question
*Why is there no single multimodal accuracy percentage reported for the whole system?*

### Suggested Answer
"Because facial and speech models were trained and evaluated on independent benchmark datasets (FER-2013 for vision; RAVDESS/TESS for speech). Stating an arbitrary combined accuracy without an empirical paired multi-sensor test benchmark would be academically unscientific."

---

## Slide 13 — Future Work & Strategic Roadmap

### What to Say
"To address these limitations, we have established a four-phase strategic roadmap:
In **Phase 1 (Data & Temporal Models)**, we will train on synchronized paired audio-visual corpora such as CREMA-D and deploy Vision Transformers (ViT) for facial features alongside wav2vec 2.0 and LSTM for temporal acoustic dynamics.
In **Phase 2 (Advanced Fusion)**, we will replace static 50/50 late fusion with attention-based dynamic fusion that weights modalities based on real-time acoustic signal-to-noise ratio and face visibility.
In **Phase 3 (Physiological Sensing)**, we plan to integrate Bluetooth smart wearables to capture Heart Rate Variability (HRV) and Electrodermal Activity (EDA) for objective physiological stress validation.
In **Phase 4 (Clinical Validation)**, we will conduct an IRB-approved longitudinal clinical trial with certified psychiatrists to validate therapeutic efficacy in Sri Lankan healthcare settings."

### Key Point
Concrete 4-phase technical roadmap (Transformers, Cross-Attention, Wearables, Clinical Trials) transitioning MindCare into an evidence-based digital therapeutic platform.

### Transition
"Now, let us summarize the key project outcomes, findings, and final takeaway of this research."

### Possible Examiner Question
*How would attention-based fusion improve upon your current 50/50 late fusion?*

### Suggested Answer
"Attention mechanisms calculate dynamic softmax weights based on feature certainty—for instance, if the user turns away from the camera, facial attention automatically drops to 0.1 while acoustic attention scales to 0.9."

---

## Slide 14 — Conclusion

### What to Say
"Overall, this project successfully developed a trilingual, multimodal and privacy-conscious wellness companion. The system combines facial and speech emotion recognition with multimodal fusion and constrained conversational support. It also provides English, Sinhala and Tamil accessibility while applying privacy-conscious media processing. The core system functionality was validated through 13 out of 13 automated tests. The empirical evaluation also highlighted important limitations in individual model performance, environmental robustness and multimodal benchmark evaluation. Therefore, the project demonstrates a practical foundation for an accessible and safety-conscious AI-assisted wellness support system, while providing clear directions for future research and improvement."

### Key Point
Synthesize the primary contribution: MindCare provides a viable, trilingual, safety-constrained multimodal foundation while candidly acknowledging empirical benchmarks and future directions.

### Transition
"Let us now review our key references and open the floor for questions and discussion."

### Possible Examiner Question
*What is the main conclusion you draw from this research?*

### Suggested Answer
"The project concludes that real-time multimodal emotion estimation combined with constrained conversational workflows can provide a reliable, low-barrier emotional wellness companion, while maintaining safety, privacy, and linguistic accessibility in low-resource environments."

---

## Slide 15 — References & Q&A / Defense Closing

### What to Say
"In conclusion, MindCare demonstrates that real-time multimodal affective sensing, constrained generative AI, and cultural localization can be harmonized to deliver an accessible, safe, and privacy-conscious wellness companion for underserved communities.
I would like to express my sincere gratitude to my supervisor, Dr. T.S.A. Gunawardena, the evaluation panel, and Cardiff Metropolitan University.
Thank you for your time. I am now pleased to invite your questions and comments."

### Key Point
Reiterate candidate credentials (`st20360354 / KG/BSCSD/16/41`), cite primary Harvard literature references, and open the VIVA examination session with confidence.

### Possible Examiner Question
*What is the single greatest contribution of your software engineering project?*

### Suggested Answer
"The successful architectural synthesis of real-time multimodal affective sensing, trilingual localization, and constrained conversational safety within a production-ready, privacy-conscious platform tailored for low-resource mental health support."

---

# COMPREHENSIVE VIVA EXAMINATION MASTER GUIDE (15 TOPICS)

### 1. Why did the baseline 2D-CNN outperform fine-tuned MobileNetV2?
**Model Defense Answer:**
"MobileNetV2 was pre-trained on ImageNet, which consists of high-resolution 224x224 RGB photographs of diverse real-world objects. In contrast, FER-2013 contains low-resolution (48x48) grayscale facial crops with substantial intra-class label noise (~65% human agreement). Upscaling 48x48 images to 96x96 introduced interpolation artifacts, and MobileNetV2's deeper feature hierarchy overfitted to ImageNet spatial statistics. Our custom baseline 2D-CNN, with compact localized convolutional kernels and direct dropout regularization, proved much better adapted to low-resolution facial action units, achieving 61.90% vs 40.53% for MobileNetV2."

### 2. Why was Late Fusion selected over Early or Intermediate Fusion?
**Model Defense Answer:**
"Early fusion concatenates raw features prior to classification. However, video frames (2D spatial pixel matrices) and audio signals (1D acoustic waveforms) operate at completely different sampling rates and dimensionalities. Early fusion requires complex temporal synchronization and collapses if one sensor disconnects. Late fusion computes independent posterior probability distributions, enabling modular asynchronous execution, graceful single-sensor degradation, and explicit polar conflict detection."

### 3. How does the 50/50 weighted fusion mathematically operate?
**Model Defense Answer:**
"Both the facial CNN and speech DNN output normalized softmax probability distributions across the 7 canonical emotion classes. The late fusion engine computes:
`fused_prob[emotion] = 0.50 * P_face[emotion] + 0.50 * P_voice[emotion]`
The emotion class with the highest fused probability is selected as the dominant state. If only one modality is active, the active modality's probability distribution is passed through at 1.0 weight."

### 4. What happens when face and voice disagree (e.g., smiling face but crying voice)?
**Model Defense Answer:**
"Our engine implements explicit **Polar Conflict Detection**. If the facial model detects a positive valence (Happy with probability > 0.40) while the speech model detects a high-distress negative valence (Sadness or Fear with probability > 0.40), the system suppresses a misleading mathematical average and assigns an *'Uncertain'* emotional label with a moderate 0.50 stress weighting. This prevents the CBT conversational agent from offering inappropriate responses."

### 5. Why did you choose Python FastAPI for the backend instead of Node.js or Flask?
**Model Defense Answer:**
"FastAPI is built natively on Starlette and `uvloop`, providing asynchronous non-blocking ASGI WebSocket concurrency. Because our ML inference models (TensorFlow and Librosa) run natively in Python, using FastAPI eliminated the need for inter-process communication between a separate Node.js server and Python ML scripts. Furthermore, FastAPI's Pydantic schemas enforce strict data validation on all incoming telemetry payloads."

### 6. Why are WebSockets used instead of standard REST API polling?
**Model Defense Answer:**
"Multimodal streaming requires continuous bi-directional communication. HTTP polling incurs heavy request-header overhead and latency jitter. WebSockets establish a single persistent full-duplex TCP connection, enabling real-time streaming of base64 audio/video chunks and instantaneous broadcast of `AI_REPLY`, `METRICS_UPDATE`, and `SAFETY_ALERT` events with sub-50ms network latency."

### 7. Why is SQLite 3 used with SQLAlchemy instead of MongoDB or PostgreSQL?
**Model Defense Answer:**
"For this standalone prototype and single-instance deployment, SQLite 3 provides zero-configuration, serverless, file-based relational persistence with zero external infrastructure overhead. SQLAlchemy ORM provides clean model abstractions, type safety, relationship mapping, and cascading foreign-key deletions. The architecture is database-agnostic, meaning switching to PostgreSQL for production requires changing only the database connection string in `.env`."

### 8. How is privacy guaranteed during webcam and microphone processing?
**Model Defense Answer:**
"MindCare follows a privacy-by-design architecture:
1. Explicit browser sensor consent is required before any media stream initializes.
2. The client interface includes an optional Gaussian blur filter for the local video preview.
3. Video frames and audio buffers are processed ephemerally in server RAM and immediately discarded; zero raw video or audio files are ever written to disk or permanent databases.
4. All stored chat logs are strictly isolated by User ID with complete cascade deletion upon account termination."

### 9. What are the limitations of browser-native Text-to-Speech (TTS)?
**Model Defense Answer:**
"Browser-native SpeechSynthesis depends on the underlying operating system and browser vendor's installed voice packs. While English (`en-US`) is universally supported, native Sinhala (`si-LK`) and Tamil (`ta-LK`) voices are missing on certain legacy OS installations. To ensure accessibility, MindCare incorporates server-side Edge Neural TTS fallbacks (*si-LK-ThiliniNeural*, *ta-LK-SaranyaNeural*) that stream base64 MP3 audio when local voices are unavailable."

### 10. Why use Gemini if LLM hallucination is a major risk in mental health?
**Model Defense Answer:**
"We do not allow Gemini to operate as an unconstrained, open-ended chatbot. Instead:
1. It is bound by structured JSON output schemas that restrict its output to therapeutic dialogues, stage transitions, and recommended coping IDs.
2. Strict system instructions enforce an 'Empathy-First' protocol.
3. A pre-LLM deterministic regex keyword filter intercepts crisis/self-harm language before LLM execution, immediately invoking hardcoded emergency protocols and helplines."

### 11. How does the local deterministic fallback mechanism work?
**Model Defense Answer:**
"If an external API timeout (>1.5s), network disconnection, or LLM failure occurs, the backend catches the exception and immediately invokes a localized rule-based fallback engine. This engine selects pre-validated, culturally appropriate therapeutic responses in English, Sinhala, or Tamil matched to the user's current stress level, ensuring the user is never left without guidance."

### 12. Why is this system categorized as 'non-clinical'?
**Model Defense Answer:**
"MindCare is designed as an emotional self-regulation and stress decompression companion, not a medical diagnostic device. It does not diagnose DSM-5 psychiatric conditions, prescribe medications, or replace certified healthcare professionals. All user screens display clear disclaimers, and acute distress is immediately redirected to official helplines (such as 1926 in Sri Lanka)."

### 13. Why is there no single unified multimodal accuracy metric?
**Model Defense Answer:**
"FER-2013 contains only static facial images, while RAVDESS/TESS contains audio speech recordings. Because no public, culturally representative paired audio-visual dataset was available for Sri Lankan populations, the models had to be trained and evaluated on their respective domain benchmarks. Reporting an artificial 'combined accuracy' without a paired multimodal test dataset would be academically dishonest."

### 14. What are the primary dataset limitations of FER-2013?
**Model Defense Answer:**
"FER-2013 was scraped from Google Images in 2013 and exhibits several known issues: low 48x48 grayscale resolution, significant class imbalance (high Happy/Neutral vs low Disgust), subjective annotator label noise (human agreement is estimated at only ~65%), and synthetic cartoon/drawing inclusions. Modern benchmarks such as AffectNet or RAF-DB provide higher resolution and cleaner annotations."

### 15. If given another six months, what would you improve in the system?
**Model Defense Answer:**
"I would prioritize three enhancements:
1. Collect an ethical, IRB-approved paired audio-visual dataset of bilingual Sri Lankan speakers to train an end-to-end Cross-Attention Transformer.
2. Replace static MFCC mean-pooling with wav2vec 2.0 or a 1D-CNN-BiLSTM to preserve temporal pitch and prosodic intonation.
3. Conduct a controlled multi-user usability study in collaboration with clinical psychologists to measure real-world reduction in self-reported stress."
