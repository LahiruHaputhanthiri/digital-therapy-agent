# MindCare: University Thesis Presentation (PRES1) & VIVA Defense Script

**Module:** CSE6035 Development Project  
**Assessment:** PRES1 (Presentation & Live Software Demonstration) — Weighting: 20%  
**Project Title:** MindCare — Emotion Recognition & Mental Support System Using AI Voice Assistant  
**Presenter / Candidate:** Haputhanthirige Thushara Lahiru Kavishal (Lahiru Kavishal)  
**Student ID:** st20360354 | **Registration No:** KG/BSCSD/16/41  
**Supervisor:** Dr. T.S.A. Gunawardena  
**Institution:** Cardiff Metropolitan University / ICBT Campus (BSc Hons Software Engineering)  
**Target Duration:** 12 to 14 Minutes (+ 5–10 Minutes VIVA Q&A)  
**Submission Deliverable:** `st20360354_CSE6035_PRES1_MindCare.pdf` / `MindCare_CSE6035_Presentation.pptx`

---

## Assessment Criteria Alignment Matrix

| Evaluation Category | Weighting | Key Requirements Addressed | Slide Coverage |
|---|---|---|---|
| **Artefact Demonstration** | 45% | Thorough, live demonstration with features directly linked to research objectives (WebRTC multimodal sensing, WebSocket streaming, late fusion, trilingual CBT, crisis interlock, admin telemetry). | Slides 10, 13, 14, 15, 16, 17 + Live Demo |
| **Depth of Knowledge** | 20% | Critical analysis of ML models (MobileNetV2, 1D-CNN, RF), loss of temporal dynamics in MFCC mean-pooling, transfer learning limitations on 48x48 FER, non-blocking async tensor architectures. | Slides 5, 6, 9, 11, 12, 13, 18, 19 |
| **Presentation Skills** | 15% | Professional visual design (Google Antigravity style), clean high-contrast typography, strict time pacing (10–15 min), assertive technical delivery. | All Slides (1–20) |
| **Contribution to Knowledge** | 15% | Trilingual (Sinhala/Tamil/English) digital therapeutics addressing South Asian mental health treatment gap (WHO data) and local workforce shortages (0.2 psychiatrists / 100k). | Slides 3, 4, 5, 6, 16, 19 |
| **Clarity and Flow** | 5% | Structured narrative following academic standard: Introduction → Lit Review → Problem/Aim → Methodology → Implementation → Findings/Limitations → Future Work. | Slide 1–20 Flow |

---

## Slide-by-Slide Timing & Spoken Script (20 Slides)

```
┌────────────────────────────────────────────────────────────────────────┐
│ TIMELINE BREAKDOWN (Target: 13:30 Minutes)                              │
│ • Slides 1–4 (Title, Intro, Background, Problem & Aim): 2:00 mins      │
│ • Slides 5–6 (Literature Review & Research Gap):        2:00 mins      │
│ • Slides 7–12 (Requirements, Tech Stack, Arch, ML):     3:00 mins      │
│ • LIVE ARTEFACT DEMONSTRATION:                          4:00 mins (CRITICAL)│
│ • Slides 13–17 (Fusion, CBT, Safety, Trilingual, RBAC): 1:30 mins      │
│ • Slides 18–20 (Testing, Limitations, Future & Close):  1:00 min       │
└────────────────────────────────────────────────────────────────────────┘
```

---

### Slide 1: Title Slide (0:00 – 0:30)
* **Visual:** Deep Teal / Navy gradient with title "MindCare: Emotion Recognition & Mental Support System Using AI Voice Assistant", candidate name, Student ID (`st20360354`), Reg No (`KG/BSCSD/16/41`), and supervisor Dr. T.S.A. Gunawardena.
* **Speaker Script:**
  > "Good morning, respected examiners and panel members. My name is Lahiru Kavishal, and today I am presenting my final-year BSc Software Engineering dissertation project titled **'MindCare: Emotion Recognition and Mental Support System Using AI Voice Assistant'** for module CSE6035.
  > Under the supervision of Dr. T.S.A. Gunawardena, I have engineered an intelligent, privacy-first digital therapeutics platform designed to provide real-time affective sensing and culturally attuned, trilingual cognitive-behavioural support."

---

### Slide 2 & 3: Introduction & Background Motivation (0:30 – 1:15)
* **Visual:** WHO statistics, Sri Lanka suicide rates (14.6/100k), clinical workforce deficit (0.2 psychiatrists/100k), live landing page UI.
* **Speaker Script:**
  > "Globally, the World Health Organization reports that 1 in 4 individuals will experience a mental health condition. In low- and middle-income countries, over 76% receive no treatment.
  > In Sri Lanka, this is compounded by a critical workforce deficit: just 0.2 psychiatrists per 100,000 population, paired with intense cultural stigma that suppresses help-seeking.
  > Digital therapeutics offer an accessible bridge; however, current systems are predominantly English-only and rely solely on typed text, creating severe barriers for our local demographic."

---

### Slide 4: Problem Statement and Aim (1:15 – 2:00)
* **Visual:** Problem callout box, Project Aim, 4 core research objectives (OBJ 1–4).
* **Speaker Script:**
  > "Our problem statement addresses the absence of real-time affective awareness and linguistic accessibility in existing mental health technologies.
  > Our aim is to build a full-stack, real-time multimodal platform fusing facial expressions and vocal cues to deliver empathetic, trilingual CBT interventions.
  > We defined four core research objectives:
  > 1. Real-time facial emotion recognition across 7 universal classes.
  > 2. Acoustic speech emotion recognition over 40 MFCC features.
  > 3. An asynchronous late-fusion engine with polar conflict detection.
  > 4. Trilingual (English, Sinhala, Tamil) CBT dialogue generation with automated crisis safety interlocks."

---

### Slide 5: Literature Review & Comparative Analysis (2:00 – 2:45)
* **Visual:** Table 2 comparative matrix (Zhang et al. 2022, Patel et al. 2026, Khubrani 2026 vs. Proposed MindCare) and unimodal evaluation cards.
* **Speaker Script:**
  > "Our critical review of the literature revealed key trade-offs in existing systems (Chapter 2, Table 2):
  > - **Zhang et al. (2022)** achieved 85.1% accuracy by fusing ECG, voice, and face, but requires invasive wearable ECG hardware that introduces high user friction.
  > - **Patel et al. (2026)** demonstrated a structured risk-graph LLM for safety, but relies strictly on manual textual emotion inputs.
  > - **Khubrani (2026)** achieved 91.4% tri-modal accuracy across face, voice, and typing, but suffers from heavy computational overhead and remains strictly English-centric.
  > - Furthermore, unimodal systems are fragile: facial recognition fails in dim lighting, speech recognition degrades in noisy environments, and text typing imposes cognitive friction during acute panic."

---

### Slide 6: Research Gap & Theoretical Foundations (2:45 – 3:30)
* **Visual:** Identified Research Gaps (Section 2.7) and Design Implications (Section 2.8).
* **Speaker Script:**
  > "From this analysis, we synthesized three fundamental research gaps:
  > 1. **Linguistic Exclusion:** Over 90% of emotion-aware tools neglect South Asian languages (Sinhala/Tamil).
  > 2. **Hardware Friction:** Advanced systems require costly external sensors or excessive compute.
  > 3. **LLM Safety Risks:** Open-ended conversational agents risk hallucinations and premature medical advice without clinical guardrails (Rezaei et al., 2026).
  > Consequently, our architectural design implications mandate:
  > - An **Asynchronous Late Fusion** pipeline for non-blocking browser execution with graceful single-sensor fallback.
  > - A **Deterministic Stage Engine** that enforces an Empathy-First rule across 4 discrete stages.
  > - **Localized Low-Barrier Delivery** using standard browser WebRTC and native neural TTS."

---

### Slide 7, 8, 9, 10: Methodology, Tech Stack & Architecture (3:30 – 5:00)
* **Visual:** Agile + CRISP-DM methodology, 4-tier tech stack cards, 3-tier system architecture diagram.
* **Speaker Script:**
  > "Synthesizing requirements from our questionnaire (N=124) and clinical interviews, we executed an Agile sprint methodology alongside CRISP-DM for machine learning governance.
  > The technology stack decouples:
  > - **Frontend:** Next.js 16 and React 19 with Tailwind CSS v4, Framer Motion, and WebRTC.
  > - **API Gateway:** Python FastAPI with Uvicorn, handling async WebSockets and JWT/RBAC security.
  > - **ML Engine:** TensorFlow/Keras for FER, Librosa (40 MFCCs) for SER, and Scikit-learn.
  > - **Intelligence:** Google Gemini Flash 3.7 with structured JSON schemas, backed by Microsoft Edge Neural TTS for native Sri Lankan accents.
  > Video frames and audio chunks stream over WebSockets. Crucially, OpenCV face detection and tensor predictions are offloaded using `asyncio.to_thread` to maintain a non-blocking 60 FPS UI."

---

### Slide 11 & 12: ML Model Evaluations — FER & SER (5:00 – 6:00)
* **Visual:** MobileNetV2 architecture, 1D-CNN pipeline, normalized confusion matrices.
* **Speaker Script:**
  > "For Facial Emotion Recognition, our MobileNetV2 transfer learning model was trained on 35,887 images from the FER-2013 dataset across 7 classes, evaluating at 40.53% validation accuracy, while our custom baseline CNN achieved 61.90%, which is retained in production.
  > For Speech Emotion Recognition, our 1D-CNN processes 40 mean-pooled MFCCs sampled at 22,050 Hz across RAVDESS and TESS datasets, achieving 50.84% accuracy (53.60% baseline DNN).
  > The confusion matrices confirm robust classification on Happy (62.8%) and Surprise (67.5%), with anticipated overlap in nuanced negative valences like Sad and Fear."

---

### LIVE ARTEFACT DEMONSTRATION (6:00 – 10:00) — 45% Module Weighting

* **Demonstration Step-by-Step Checklist:**
  1. **Landing & Localization (30s):**
     - Open `http://localhost:3000`. Switch between English, Sinhala (සිංහල), and Tamil (தமிழ்).
     - *Script:* "Observe how all UI typography and therapeutic terms immediately re-render in authentic native scripts."
  2. **Authentication & RBAC (30s):**
     - Log in with `AliceUser`. Show JWT issuance and role verification.
  3. **Multimodal Sensing & Telemetry (60s):**
     - Activate camera and microphone. Demonstrate the local privacy blur toggle.
     - Record voice message: *"I am feeling overwhelmed with my project submission."*
     - Show the live Stress Gauge and 7-class Emotion Distribution updating live to 42% Moderate Stress.
  4. **Empathy-First CBT Dialogue (45s):**
     - Observe the AI response: Gemini validates emotions first instead of rushing into exercises.
     - Play neural voice TTS (`si-LK-ThiliniNeural` / `en-US-AriaNeural`).
  5. **Safety & Crisis De-escalation (45s):**
     - Launch Box Breathing (4-4-4-4 circle animation) and 5-4-3-2-1 Grounding.
     - Trigger Crisis Safety Modal showcasing the 24/7 Toll-Free Sri Lanka 1926 Helpline.
  6. **Admin Dashboard & Telemetry (30s):**
     - Sign in as `BobAdmin` / `RootSuperAdmin`. Show user accounts directory, chat log metrics, and AI model health.

---

### Slide 13, 14, 15, 16, 17: Deep Architecture Highlights (10:00 – 11:30)
* **Visual:** Late Fusion formula, Stage Engine cards, Interventions trio, Trilingual screenshots, Security & RBAC.
* **Speaker Script:**
  > "Our late fusion engine applies equal 0.5 weighting across face and voice probabilities, while our polar conflict detector flags contradictory signals (e.g., smiling face + crying voice) as 'uncertain' to avoid erroneous therapeutic feedback.
  > The deterministic stage engine transitions between Crisis, Coping, Listening, and Exploration.
  > On data privacy, MindCare implements strict sensor consent dialogs, per-modality toggles, zero server video storage, and GDPR-compliant cascading account deletion."

---

### Slide 18 & 19: Testing, Limitations & Future Work (11:30 – 12:45)
* **Visual:** 13/13 Passed integration test terminal execution, Limitations bullets, Future enhancements grid.
* **Speaker Script:**
  > "Our automated integration test suite verified 13 out of 13 assertions with a 100% pass rate covering schema initialization, JWT token lifecycles, RBAC authorization, and user chat log isolation.
  > In the spirit of academic rigor, we acknowledge key limitations: FER-2013 label noise limits facial accuracy (~65% human agreement ceiling), and MFCC mean-pooling discards temporal acoustic transitions.
  > Future work will integrate Vision Transformers (ViT) and wav2vec 2.0, incorporate wearable physiological telemetry (HRV/EDA), and conduct IRB-approved clinical trials with certified mental health professionals."

---

### Slide 20: Conclusion, References & Defense (12:45 – 13:15)
* **Visual:** Formal closing, candidate credentials (`st20360354`), supervisor Dr. T.S.A. Gunawardena, key academic references (Zhang et al. 2022, Patel et al. 2026, Khubrani 2026, Goodfellow et al. 2013, WHO 2022).
* **Speaker Script:**
  > "In conclusion, MindCare demonstrates that multimodal affective computing and controlled generative AI can be harmonized to deliver culturally accessible, safe, and empathetic digital therapeutics for underserved communities.
  > Thank you. I am now delighted to take questions from the panel."
