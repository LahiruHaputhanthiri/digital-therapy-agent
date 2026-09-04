# MindCare: Emotion Recognition & Mental Support System Using AI Voice Assistant 🧠💬

[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-16.3-black.svg?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.x-FF6F00.svg?logo=tensorflow&logoColor=white)](https://tensorflow.org)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57.svg?logo=sqlite&logoColor=white)](https://sqlite.org)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-D71F00.svg?logo=sqlalchemy&logoColor=white)](https://www.sqlalchemy.org)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-3.7%20Flash-4285F4.svg?logo=google&logoColor=white)](https://ai.google.dev)
[![License](https://img.shields.io/badge/Academic%20Project-Final%20Submission-blue.svg)](#)

> **Final Academic Project**  
> **Degree:** BSc (Hons) Software Engineering  
> **Institution:** Cardiff School of Technologies, Cardiff Metropolitan University / ICBT Campus  
> **Student:** H. T. Lahiru Kavishal (st20360354 / KG/BSCSD/16/41)

---

## 📌 Executive Summary

**MindCare** is a real-time, trilingual, multimodal emotion-aware digital therapeutic platform. The system bridges the accessibility gap in mental health support by performing simultaneous visual and acoustic emotion detection, synthesizing affective states through a **50/50 late probability fusion engine**, and guiding users through an evidence-based **5-stage Cognitive Behavioral Therapy (CBT)** conversational workflow powered by Google Gemini LLM.

Designed specifically with localized inclusivity in mind, MindCare natively supports **English**, **Sinhala (සිංහල)**, and **Tamil (தமிழ்)** with real-time speech transcription (STT) and neural speech synthesis (TTS).

---

## 🏛️ System Architecture

```mermaid
graph TD
    subgraph Client ["Frontend (Next.js 16 / React 19)"]
        UI[Glassmorphic UI / Dashboard]
        Cam[Camera Feed Capture]
        Mic[WebM/Opus Audio Recorder]
        Key[Keystroke Dynamics Tracker]
        CBT_UI[Interactive Interventions (Breathing / Grounding)]
    end

    subgraph Backend ["Backend (FastAPI / Uvicorn)"]
        API[FastAPI REST API & WebSocket Server]
        Auth[JWT 3-Tier RBAC: User / Admin / Super Admin]
        
        subgraph ML ["Multimodal Inference Engine"]
            FER["Face Emotion Model (CNN - best_face_model_v2.h5)"]
            SER["Voice Emotion Model (DNN - best_voice_model_v2.h5)"]
            Scaler["Voice MFCC Scaler (voice_scaler_v2.pkl)"]
            Fusion["Late Fusion Engine (50% Face + 50% Voice)"]
            Stress["Stress Computation (Heuristics + Health Model)"]
        end

        subgraph Therapy ["AI Therapeutic Agent"]
            LLM["Gemini 3.7 Flash LLM"]
            Workflow["Constrained 5-Stage CBT Workflow"]
            TTS["Trilingual Neural TTS (Edge-TTS / gTTS)"]
        end

        subgraph DB ["Data Persistence"]
            SQLite["SQLite 3 (therapy_agent.db)"]
            ORM["SQLAlchemy Declarative Models"]
        end
    end

    Cam -->|Base64 JPEG Frames| API
    Mic -->|Audio Chunks| API
    Key -->|Typing Telemetry| API
    API --> FER & SER
    FER & SER --> Fusion --> Stress
    Stress --> Workflow --> LLM --> TTS --> API
    API -->|Realtime WebSocket Telemetry & Audio| Client
    API --> ORM --> SQLite
```

---

## 🌟 Key Technical Innovations

1. **Multimodal Late Probability Fusion (50/50)**:
   - **Visual Stream**: Custom Convolutional Neural Network (CNN) trained on FER-2013 and validated against FairFace (`models/best_face_model_v2.h5`), processing 48×48 grayscale facial inputs across 7 emotion classes.
   - **Acoustic Stream**: Deep Neural Network (DNN) analyzing 40 Mel-Frequency Cepstral Coefficients (MFCCs) (`models/best_voice_model_v2.h5` + `models/voice_scaler_v2.pkl`) across 6 emotion classes.
   - **Fusion**: Calibrated visual-acoustic probability fusion (`FACE_WEIGHT = 0.50`, `VOICE_WEIGHT = 0.50`) yielding robust classification even under ambient noise or low-light conditions.

2. **Constrained 5-Stage CBT Conversational Agent**:
   - Built on **Google Gemini 3.7 Flash** with strict clinical behavioral boundaries.
   - Enforces a 5-stage therapeutic path:
     - **Stage 1**: Empathetic Validation & Exploration
     - **Stage 2**: Cognitive Distortion Identification (Catastrophizing, Black-and-white thinking)
     - **Stage 3**: Cognitive Restructuring & Reframing
     - **Stage 4**: Guided Somatic Interventions (4-7-8 Breathing, 5-4-3-2-1 Grounding)
     - **Stage 5**: Action Planning, Crisis Safeguarding & Escalation Protocols

3. **Trilingual Localization & Speech Pipeline**:
   - First-class support for **English**, **Sinhala**, and **Tamil**.
   - Handles WebM/Opus audio decoding via `av` / `pydub`, converting to 16 kHz mono WAV for speech emotion extraction and transcription.
   - Real-time trilingual voice delivery utilizing Microsoft Edge Neural Voices (`en-US-JennyNeural`, `si-LK-ThiliniNeural`, `ta-IN-PallaviNeural`) and fallback `gTTS`.

4. **3-Tier Role-Based Access Control (RBAC) & Local Persistence**:
   - **Standard User**: Private encrypted sessions, emotion timeline, stress history.
   - **Admin**: Clinical oversight, telemetry review, user audit.
   - **Super Admin**: System governance, role provisioning, security telemetry.
   - Powered by **SQLite 3** and **SQLAlchemy** with automatic table generation and isolated schemas (`users`, `chat_logs`).

---

## 📁 Repository Structure

```
digital-therapy-agent/
├── academic_evidence/             # 40 screenshots, test logs, and validation evidence
│   └── screenshots/               # Stage-by-stage visual evaluation records
├── backend/                       # Python FastAPI Backend
│   ├── agent/
│   │   ├── __init__.py
│   │   └── therapy_bot.py         # Constrained 5-Stage CBT Agent with Gemini LLM
│   ├── auth.py                    # JWT, Argon2/Bcrypt, 3-Tier RBAC, Google OAuth
│   ├── database.py                # SQLAlchemy engine and session factory
│   ├── main.py                    # Unified REST & WebSocket FastAPI application
│   ├── models.py                  # SQLAlchemy ORM models (User, ChatLog)
│   ├── requirements.txt           # Python dependency specification
│   ├── test_auth_db.py            # Comprehensive 13-case automated test suite
│   ├── .env.example               # Backend environment template
│   └── .gitignore
├── emotion-stress-frontend/       # Next.js 16 / React 19 Frontend
│   ├── public/                    # Static assets & icons
│   ├── src/
│   │   ├── app/                   # App Router (globals.css, layout.tsx, page.tsx)
│   │   ├── components/            # Modular React components
│   │   │   ├── admin/             # RBAC Admin Dashboard
│   │   │   ├── auth/              # Authentication & Social Login Modals
│   │   │   ├── chat/              # Real-time WebSocket Chat & Message Bubbles
│   │   │   ├── dashboard/         # Emotion Bars, Stress Gauge, Session History
│   │   │   ├── emotion/           # Emotion Orb animations
│   │   │   ├── interventions/     # Breathing Circle & 5-4-3-2-1 Grounding
│   │   │   ├── layout/            # DashboardShell, Header, Settings Drawer
│   │   │   ├── sensors/           # CameraFeed, AudioRecorder, PrivacyControls
│   │   │   └── ui/                # Glassmorphic UI design tokens
│   │   ├── hooks/                 # Custom React hooks (useWebSocket, useKeystrokeTracker)
│   │   ├── locales/               # Trilingual localization (en, si, ta)
│   │   ├── services/              # API and WebSocket client services
│   │   ├── store/                 # Zustand state stores (useStressStore, useAuthStore)
│   │   └── types/                 # Strict TypeScript interfaces
│   ├── package.json               # Frontend dependencies & scripts
│   ├── tsconfig.json              # TypeScript strict configuration
│   └── .env.example               # Frontend environment template
├── models/                        # Trained ML Model Weights & Evaluation Metrics
│   ├── best_face_model.h5         # Face Emotion CNN v1 (14.6 MB)
│   ├── best_face_model_v2.h5      # Face Emotion CNN v2 (25.6 MB - primary)
│   ├── best_voice_model.h5        # Voice Emotion DNN v1 (0.7 MB)
│   ├── best_voice_model_v2.h5     # Voice Emotion DNN v2 (1.9 MB - primary)
│   ├── best_health_model.pkl      # Lifestyle/Stress Model v1 (16.3 MB)
│   ├── best_health_model_v2.pkl   # Lifestyle/Stress Model v2 (5.6 MB - primary)
│   ├── voice_scaler_v2.pkl        # MFCC standard scaler
│   ├── voice_classes_v2.json      # Speech emotion class index mapping
│   ├── face_confusion_matrix.png  # FER-2013 confusion matrix
│   ├── voice_confusion_matrix.png # Speech emotion confusion matrix
│   ├── health_confusion_matrix.png# Lifestyle stress confusion matrix
│   └── *_classification_report.txt
├── presentation/                  # Academic Defense Slides & Viva Materials
│   ├── slides/                    # Interactive HTML presentation deck (15 slides)
│   ├── slide_images/              # High-resolution slide renders
│   ├── MindCare_CSE6035_Presentation.pptx # PowerPoint defense presentation
│   ├── MindCare_CSE6035_Presentation.pdf  # PDF version of presentation
│   ├── PRESENTATION_DEFENSE_SCRIPT.md     # Timed viva presentation script
│   ├── FINAL_VIVA_SPEAKER_NOTES.md        # Comprehensive viva speaker notes
│   └── FINAL_VIVA_SPEAKER_NOTES.docx
├── fine_tune_face.py              # CNN model training & fine-tuning script
├── fine_tune_voice.py             # DNN acoustic training & MFCC extraction script
├── fine_tune_health.py            # Health/lifestyle tabular training script
├── .env.example                   # Master project configuration template
├── .gitignore                     # Root Git exclusion rules
└── README.md                      # Complete system documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites

- **Python 3.10+** (64-bit recommended)
- **Node.js 18+** / npm 9+
- **Git**
- Google Gemini API Key ([Google AI Studio](https://aistudio.google.com/))

---

### 2. Backend Setup (FastAPI)

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
copy .env.example .env
# Edit .env and supply your GEMINI_API_KEY and secure JWT secrets
```

#### Start Backend Server:
```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
- API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
- Interactive Redoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

> **Database Note:** SQLite tables are initialized automatically on bootstrap via SQLAlchemy (`Base.metadata.create_all`). No external database setup is required.

---

### 3. Frontend Setup (Next.js 16)

```bash
# Navigate to frontend directory
cd emotion-stress-frontend

# Install dependencies
npm install

# Configure environment variables
copy .env.example .env.local

# Run development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🧪 Automated Testing & Verification

The project includes an integrated automated test suite verifying 3-Tier RBAC, JWT tokens, user isolation, and database telemetry persistence:

```bash
# Run backend test suite
cd backend
python test_auth_db.py
```

### Verified Test Matrix (100% Passing):
| Test Case | Description | Verification Target | Result |
|---|---|---|---|
| `[1]` | Database Initialization | SQLAlchemy table generation (`users`, `chat_logs`) | **PASSED** |
| `[2]` | Standard User Registration | Registration with role `'user'` | **PASSED** |
| `[3]` | Super Admin Bootstrap | Secret-authorized root admin creation | **PASSED** |
| `[4]` | Admin Registration | Secret-authorized clinical admin creation | **PASSED** |
| `[5]` | Privilege Escalation Guard | Unauthorized role promotion blocked (HTTP 403) | **PASSED** |
| `[6]` | JWT Token Generation | Issue HS256 tokens for User, Admin, Super Admin | **PASSED** |
| `[7]` | Identity Introspection (`/auth/me`) | Correct claims resolved across all 3 tiers | **PASSED** |
| `[8]` | Admin RBAC Guard | User blocked (403), Admins permitted (200) | **PASSED** |
| `[9]` | Super Admin RBAC Guard | Only Super Admin can provision admins | **PASSED** |
| `[10]`| System Analytics Guard | Role aggregation metrics restricted to Super Admin | **PASSED** |
| `[11]`| Chat Telemetry ORM Log | Session turns mapped to user entity via ORM | **PASSED** |
| `[12]`| Chat Turn Persistence API | `POST /api/v1/chat/save` persists turn with score | **PASSED** |
| `[13]`| Data Isolation Verification | `GET /api/v1/chat/history` enforces strict isolation | **PASSED** |

### Frontend Build Verification:
```bash
cd emotion-stress-frontend
npx tsc --noEmit    # 0 TypeScript compilation errors
npm run build       # Next.js Turbopack production build succeeded
```

---

## 📊 Machine Learning Evaluation Summary

| Modality | Architecture | Training Dataset | Benchmark Accuracy | Weight in Fusion |
|---|---|---|---|---|
| **Facial Emotion** | Deep CNN (4 Conv + BatchNorm + Dropout) | FER-2013 + FairFace validation | **68.2%** (Top-2: 86.4%) | **50%** |
| **Speech Emotion** | Dense DNN (40 MFCCs + Delta + Delta-Delta) | CREMA-D + IESC | **74.1%** | **50%** |
| **Health / Lifestyle** | Random Forest / Gradient Boosting | Lifestyle & Stress Assessment Data | **81.5%** | Context heuristic |

*Confusion matrices and full classification reports are located in the [`models/`](models/) directory.*

---

## 🔒 Security & Privacy Architecture

- **Zero-Storage Camera Guarantee**: Video frames sent via WebSockets are processed ephemerally in RAM and immediately discarded; raw video is never persisted to disk.
- **Audio Privacy**: WebM audio is converted to temporary buffers in memory for feature extraction and STT, never stored long-term.
- **Credential Protection**: Passwords hashed using bcrypt/argon2 with salt.
- **RBAC Enforcement**: FastAPI dependencies guarantee endpoints are strictly segmented by role.
- **Clinical Safeguards**: The CBT Bot is programmed with immediate crisis escalation triggers; when self-harm keywords are detected, the system immediately surfaces local helpline resources (e.g., 1926 Sri Lanka Mental Health Helpline, Sumithrayo, 988 US Suicide & Crisis Lifeline).

---

## 📜 Academic Integrity & Citation

This project was developed by **H. T. Lahiru Kavishal** as a final dissertation submission for the **BSc (Hons) Software Engineering** degree at **Cardiff Metropolitan University**.

For inquiries, demonstrations, or academic review, please refer to the presentation materials in [`presentation/`](presentation/) and defense script in [`presentation/PRESENTATION_DEFENSE_SCRIPT.md`](presentation/PRESENTATION_DEFENSE_SCRIPT.md).
