"""MindCare Multimodal Therapy API - Main Entry Point.

Asynchronous FastAPI backend foundation for real-time multimodal emotion-aware
digital therapy with bilingual (English & Sinhala) processing capabilities.
Integrates trained deep learning models for face and voice emotion recognition,
along with scikit-learn models for physiological/stress estimation and late-fusion scoring.
"""

import base64
from datetime import datetime
import io
import json
import os
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

# Multimedia & Machine Learning Libraries
import cv2
import joblib
import librosa
import numpy as np
import soundfile as sf
import tensorflow as tf

# Ensure Windows terminal handles UTF-8 (e.g. Sinhala unicode characters) without UnicodeEncodeError
if sys.platform == "win32":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from dotenv import load_dotenv
from fastapi import Body, FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from agent.therapy_bot import TherapyBot

# ─────────────────────────────────────────────────────────────────────────────
# 1. Environment & Configuration
# ─────────────────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR.parent / "models"

env_path = BASE_DIR / ".env"
load_dotenv(dotenv_path=env_path)

# Initialize AI Therapy Agent stub
therapy_bot = TherapyBot(api_key=os.getenv("GEMINI_API_KEY"))

# ─────────────────────────────────────────────────────────────────────────────
# 2. ML Model Classes & Stress Mapping Constants
# ─────────────────────────────────────────────────────────────────────────────
# FER-2013 7-class facial emotion labels
FACE_CLASSES: List[str] = ["Angry", "Disgust", "Fear", "Happy", "Neutral", "Sad", "Surprise"]

# Speech Emotion Recognition 6-class labels (CREMA-D / Indian Speech)
VOICE_CLASSES: List[str] = ["Angry", "Disgust", "Fear", "Happy", "Neutral", "Sad"]

# Health Condition 3-class target labels
HEALTH_CLASSES: List[str] = ["at-risk", "fit", "unhealthy"]

# Emotion Stress Contribution Weights (0.0 = completely calm, 1.0 = acute distress)
FACE_EMOTION_STRESS_WEIGHTS: Dict[str, float] = {
    "Angry": 0.90,
    "Disgust": 0.75,
    "Fear": 0.95,
    "Happy": 0.05,
    "Neutral": 0.30,
    "Sad": 0.80,
    "Surprise": 0.40,
}

VOICE_EMOTION_STRESS_WEIGHTS: Dict[str, float] = {
    "Angry": 0.90,
    "Disgust": 0.75,
    "Fear": 0.95,
    "Happy": 0.05,
    "Neutral": 0.30,
    "Sad": 0.80,
}

# Health condition stress contribution weights
HEALTH_STRESS_WEIGHTS: Dict[str, float] = {
    "at-risk": 0.70,
    "fit": 0.15,
    "unhealthy": 0.90,
}

# Configurable Default Modality Fusion Weights
FACE_WEIGHT: float = 0.40
VOICE_WEIGHT: float = 0.35
HEALTH_WEIGHT: float = 0.25

# ─────────────────────────────────────────────────────────────────────────────
# 3. Model Loading (Executed Once at Startup)
# ─────────────────────────────────────────────────────────────────────────────
face_model = None
voice_model = None
health_model = None

try:
    face_model = tf.keras.models.load_model(MODELS_DIR / "best_face_model.h5")
    print("SUCCESS: Face emotion model loaded successfully.", flush=True)
except Exception as e:
    print(f"ERROR: Failed to load face emotion model: {e}", flush=True)

try:
    voice_model = tf.keras.models.load_model(MODELS_DIR / "best_voice_model.h5")
    print("SUCCESS: Voice emotion model loaded successfully.", flush=True)
except Exception as e:
    print(f"ERROR: Failed to load voice emotion model: {e}", flush=True)

try:
    health_model = joblib.load(MODELS_DIR / "best_health_model.pkl")
    print("SUCCESS: Health/stress model loaded successfully.", flush=True)
except Exception as e:
    print(f"ERROR: Failed to load health/stress model: {e}", flush=True)


# ─────────────────────────────────────────────────────────────────────────────
# 4. Preprocessing Pipelines
# ─────────────────────────────────────────────────────────────────────────────

def preprocess_face(image_data: Any) -> np.ndarray:
    """Preprocesses camera frame into (1, 48, 48, 1) normalized tensor for FER CNN.

    Args:
        image_data: Base64 data URL string, raw Base64 string, or raw bytes.

    Returns:
        NumPy float32 array with shape (1, 48, 48, 1) scaled to [0, 1].

    Raises:
        ValueError: If image decoding fails.
    """
    if isinstance(image_data, str):
        if image_data.startswith("data:"):
            image_data = image_data.split(",", 1)[1]
        image_bytes = base64.b64decode(image_data)
    elif isinstance(image_data, (bytes, bytearray)):
        image_bytes = bytes(image_data)
    else:
        raise ValueError(f"Unsupported image_data type: {type(image_data)}")

    image_array = np.frombuffer(image_bytes, dtype=np.uint8)
    image = cv2.imdecode(image_array, cv2.IMREAD_GRAYSCALE)

    if image is None:
        raise ValueError("Unable to decode face image with OpenCV.")

    image_resized = cv2.resize(image, (48, 48), interpolation=cv2.INTER_AREA)
    image_normalized = image_resized.astype(np.float32) / 255.0
    image_tensor = np.expand_dims(image_normalized, axis=(0, -1))
    return image_tensor


def preprocess_audio(audio_data: Any) -> np.ndarray:
    """Preprocesses microphone audio into (1, 40) temporal-mean MFCC feature vector.

    Args:
        audio_data: Base64 data URL string, raw Base64 string, or raw audio bytes.

    Returns:
        NumPy float32 array with shape (1, 40).

    Raises:
        ValueError: If audio decoding or MFCC extraction fails.
    """
    if isinstance(audio_data, str):
        if audio_data.startswith("data:"):
            audio_data = audio_data.split(",", 1)[1]
        audio_bytes = base64.b64decode(audio_data)
    elif isinstance(audio_data, (bytes, bytearray)):
        audio_bytes = bytes(audio_data)
    else:
        raise ValueError(f"Unsupported audio_data type: {type(audio_data)}")

    # Load audio waveform via soundfile or librosa
    try:
        y, sr = sf.read(io.BytesIO(audio_bytes))
    except Exception:
        # Fallback to librosa.load
        y, sr = librosa.load(io.BytesIO(audio_bytes), sr=22050)

    # Convert stereo to mono if multi-channel
    if len(y.shape) > 1:
        y = np.mean(y, axis=1)

    # Resample to 22050 Hz if needed
    if sr != 22050:
        y = librosa.resample(y, orig_sr=sr, target_sr=22050)

    # Ensure audio length has at least minimal energy
    if len(y) == 0:
        raise ValueError("Decoded audio waveform is empty.")

    # Extract 40 MFCCs
    mfccs = librosa.feature.mfcc(y=y, sr=22050, n_mfcc=40)
    # Calculate temporal mean across frames -> (40,)
    mfccs_mean = np.mean(mfccs.T, axis=0).astype(np.float32)
    voice_tensor = np.expand_dims(mfccs_mean, axis=0)
    return voice_tensor


def preprocess_health(health_data: Optional[Dict[str, Any]]) -> np.ndarray:
    """Preprocesses biometric and physiological indicators into (1, 13) feature vector.

    Expected 13 feature columns:
    ['sleep_duration', 'heart_rate', 'bmi', 'calorie_expenditure', 'step_count',
     'exercise_duration', 'water_intake', 'diet_type', 'stress_level',
     'sleep_quality', 'physical_activity_level', 'smoking_alcohol', 'gender']

    Args:
        health_data: Optional dictionary with user biometric metrics.

    Returns:
        NumPy float64 array with shape (1, 13).
    """
    data = health_data or {}
    vector = [
        float(data.get("sleep_duration", 7.0)),
        float(data.get("heart_rate", data.get("heartRate", 74.0))),
        float(data.get("bmi", 22.5)),
        float(data.get("calorie_expenditure", 2100.0)),
        float(data.get("step_count", data.get("steps", 7500.0))),
        float(data.get("exercise_duration", 30.0)),
        float(data.get("water_intake", 2.2)),
        float(data.get("diet_type", 1.0)),
        float(data.get("stress_level", 1.0)),
        float(data.get("sleep_quality", 2.0)),
        float(data.get("physical_activity_level", 2.0)),
        float(data.get("smoking_alcohol", 0.0)),
        float(data.get("gender", 1.0)),
    ]
    return np.array([vector], dtype=np.float64)


# ─────────────────────────────────────────────────────────────────────────────
# 5. Multimodal Inference & Late Fusion Engine
# ─────────────────────────────────────────────────────────────────────────────

def run_multimodal_inference(
    image_data: Optional[Any] = None,
    audio_data: Optional[Any] = None,
    health_data: Optional[Dict[str, Any]] = None,
    keystroke_data: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Executes real-time predictions across active models and computes dynamic late fusion.

    Returns:
        Comprehensive inference results with stress score, tier, and emotion distributions.
    """
    face_result: Optional[Dict[str, Any]] = None
    voice_result: Optional[Dict[str, Any]] = None
    health_result: Optional[Dict[str, Any]] = None

    face_stress_score: Optional[float] = None
    voice_stress_score: Optional[float] = None
    health_stress_score: Optional[float] = None

    available_modalities: List[str] = []

    # 1. Face Model Prediction
    if image_data and face_model is not None:
        try:
            face_tensor = preprocess_face(image_data)
            face_probs = face_model.predict(face_tensor, verbose=0)[0]
            top_face_idx = int(np.argmax(face_probs))
            top_face_emotion = FACE_CLASSES[top_face_idx]
            top_face_conf = float(face_probs[top_face_idx])

            # Calculate emotion-weighted stress score (0.0 to 1.0)
            face_stress_score = float(
                sum(float(face_probs[i]) * FACE_EMOTION_STRESS_WEIGHTS[FACE_CLASSES[i]] for i in range(len(FACE_CLASSES)))
            )

            face_result = {
                "emotion": top_face_emotion,
                "confidence": round(top_face_conf, 4),
                "probabilities": {FACE_CLASSES[i]: round(float(face_probs[i]), 4) for i in range(len(FACE_CLASSES))},
                "stress_score": round(face_stress_score, 4),
            }
            available_modalities.append("face")
        except Exception as e:
            print(f"[Inference Warning] Face processing failed: {e}", flush=True)

    # 2. Voice Model Prediction
    if audio_data and voice_model is not None:
        try:
            voice_tensor = preprocess_audio(audio_data)
            voice_probs = voice_model.predict(voice_tensor, verbose=0)[0]
            top_voice_idx = int(np.argmax(voice_probs))
            top_voice_emotion = VOICE_CLASSES[top_voice_idx]
            top_voice_conf = float(voice_probs[top_voice_idx])

            # Calculate emotion-weighted voice stress score (0.0 to 1.0)
            voice_stress_score = float(
                sum(float(voice_probs[i]) * VOICE_EMOTION_STRESS_WEIGHTS[VOICE_CLASSES[i]] for i in range(len(VOICE_CLASSES)))
            )

            voice_result = {
                "emotion": top_voice_emotion,
                "confidence": round(top_voice_conf, 4),
                "probabilities": {VOICE_CLASSES[i]: round(float(voice_probs[i]), 4) for i in range(len(VOICE_CLASSES))},
                "stress_score": round(voice_stress_score, 4),
            }
            available_modalities.append("voice")
        except Exception as e:
            print(f"[Inference Warning] Voice processing failed: {e}", flush=True)

    # 3. Health Model Prediction
    if health_data and health_model is not None:
        try:
            health_tensor = preprocess_health(health_data)
            health_probs = health_model.predict_proba(health_tensor)[0]
            top_health_idx = int(np.argmax(health_probs))
            predicted_condition = HEALTH_CLASSES[top_health_idx]

            # Calculate weighted health stress score (0.0 to 1.0)
            health_stress_score = float(
                sum(float(health_probs[i]) * HEALTH_STRESS_WEIGHTS[HEALTH_CLASSES[i]] for i in range(len(HEALTH_CLASSES)))
            )

            health_result = {
                "condition": predicted_condition,
                "confidence": round(float(health_probs[top_health_idx]), 4),
                "probabilities": {HEALTH_CLASSES[i]: round(float(health_probs[i]), 4) for i in range(len(HEALTH_CLASSES))},
                "stress_score": round(health_stress_score, 4),
            }
            available_modalities.append("health")
        except Exception as e:
            print(f"[Inference Warning] Health processing failed: {e}", flush=True)

    # 4. Keystroke dynamics influence (when biometric hardware is absent)
    keystroke_stress_bonus = 0.0
    if keystroke_data:
        backspace_count = keystroke_data.get("backspaceCount", 0)
        flight_time = keystroke_data.get("flightTimeMs", 0)
        if backspace_count > 5 or flight_time > 220:
            keystroke_stress_bonus = 0.08
        available_modalities.append("keystroke")

    # 5. Dynamic Late Fusion Calculation
    weighted_sum = 0.0
    total_weight = 0.0
    confidences: List[float] = []

    if face_stress_score is not None:
        weighted_sum += face_stress_score * FACE_WEIGHT
        total_weight += FACE_WEIGHT
        if face_result:
            confidences.append(face_result["confidence"])

    if voice_stress_score is not None:
        weighted_sum += voice_stress_score * VOICE_WEIGHT
        total_weight += VOICE_WEIGHT
        if voice_result:
            confidences.append(voice_result["confidence"])

    if health_stress_score is not None:
        weighted_sum += health_stress_score * HEALTH_WEIGHT
        total_weight += HEALTH_WEIGHT
        if health_result:
            confidences.append(health_result["confidence"])

    if total_weight > 0:
        base_fused_score = weighted_sum / total_weight
        final_stress_score = float(np.clip(base_fused_score + keystroke_stress_bonus, 0.0, 1.0))
        overall_confidence = float(np.mean(confidences)) if confidences else 0.85
    else:
        # Fallback baseline when no raw biometric streams are provided
        final_stress_score = float(np.clip(0.35 + keystroke_stress_bonus, 0.0, 1.0))
        overall_confidence = 0.82

    # Stress Tier mapping
    if final_stress_score < 0.33:
        stress_level_str = "LOW"
    elif final_stress_score < 0.66:
        stress_level_str = "MEDIUM"
    else:
        stress_level_str = "HIGH"

    # Normalize 7-Class Emotion Probability Distribution for Frontend UI Bars (0 - 100%)
    if face_result:
        raw_dist = {k.lower(): face_result["probabilities"].get(k, 0.0) for k in FACE_CLASSES}
    elif voice_result:
        raw_dist = {k.lower(): voice_result["probabilities"].get(k, 0.0) for k in VOICE_CLASSES}
        raw_dist["surprise"] = 0.05
    else:
        raw_dist = {"neutral": 0.50, "joy": 0.20, "sadness": 0.12, "fear": 0.10, "angry": 0.05, "surprise": 0.03}

    total_dist = sum(raw_dist.values()) or 1.0
    norm_dist = {k: round((v / total_dist) * 100, 1) for k, v in raw_dist.items()}

    # 6. Detailed Terminal Prediction Logging (CRITICAL)
    print("\n" + "=" * 50, flush=True)
    print("MULTIMODAL INFERENCE", flush=True)
    print("=" * 50, flush=True)
    if face_result:
        print(f"[FACE] Emotion: {face_result['emotion']}, Confidence: {face_result['confidence']:.4f}", flush=True)
    else:
        print("[FACE] Sensor stream: Inactive / Not provided", flush=True)

    if voice_result:
        print(f"[VOICE] Emotion: {voice_result['emotion']}, Confidence: {voice_result['confidence']:.4f}", flush=True)
    else:
        print("[VOICE] Sensor stream: Inactive / Not provided", flush=True)

    if health_result:
        print(f"[HEALTH] Stress Prediction: {health_result['stress_score']:.4f} (Class: {health_result['condition']})", flush=True)
    else:
        print("[HEALTH] Sensor stream: Inactive / Baseline", flush=True)

    print(f"\n[FUSION] Active Modalities: {available_modalities}", flush=True)
    if face_stress_score is not None:
        print(f"[FUSION] Face Stress Score: {face_stress_score:.4f}", flush=True)
    if voice_stress_score is not None:
        print(f"[FUSION] Voice Stress Score: {voice_stress_score:.4f}", flush=True)
    if health_stress_score is not None:
        print(f"[FUSION] Health Stress Score: {health_stress_score:.4f}", flush=True)

    print(f"[FUSION] Final Stress Score: {final_stress_score:.4f} ({final_stress_score * 100:.1f}%)", flush=True)
    print(f"[FUSION] Final Stress Level: {stress_level_str}", flush=True)
    print("=" * 50 + "\n", flush=True)

    return {
        "status": "success",
        "stressScore": round(final_stress_score * 100, 1),
        "stressScoreNormalized": round(final_stress_score, 4),
        "stressLevel": stress_level_str.lower(),
        "confidence": round(overall_confidence, 2),
        "availableModalities": available_modalities,
        "emotions": {
            "face": face_result,
            "voice": voice_result,
            "distribution": norm_dist,
        },
        "health": health_result,
        "stress": {
            "level": stress_level_str.lower() if stress_level_str != "MEDIUM" else "moderate",
            "score": round(final_stress_score * 100, 1),
            "confidence": round(overall_confidence, 2),
            "trend": "stable",
            "lastUpdated": datetime.utcnow().isoformat() + "Z",
            "disclaimer": f"Estimated from active signals: {', '.join(available_modalities) or 'Text'}. Academic wellness evaluation — not a clinical diagnosis.",
        },
    }


# ─────────────────────────────────────────────────────────────────────────────
# 6. FastAPI App Initialization & CORS
# ─────────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="MindCare Multimodal Therapy API",
    description="Multimodal emotion-aware digital therapy assistant backend supporting English & Sinhala.",
    version="0.2.0",
)

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────────────────────────────────────
# 7. HTTP Health & Status Endpoints
# ─────────────────────────────────────────────────────────────────────────────
class HealthStatusResponse(BaseModel):
    status: str
    service: str
    version: str
    message: str


@app.get("/", response_model=HealthStatusResponse, tags=["Status"])
async def root_health_check() -> Dict[str, str]:
    """Root health and service status endpoint."""
    return {
        "status": "online",
        "service": "MindCare Multimodal Therapy API",
        "version": "0.2.0",
        "message": "Backend is running successfully.",
    }


@app.get("/api/v1/health", tags=["Status"])
async def api_health_check() -> Dict[str, Any]:
    """API v1 Health check endpoint reporting model status."""
    return {
        "status": "online",
        "version": "0.2.0",
        "multimodalSupported": True,
        "models": {
            "face": face_model is not None,
            "voice": voice_model is not None,
            "health": health_model is not None,
        },
    }


# ─────────────────────────────────────────────────────────────────────────────
# 8. Real Multimodal Inference REST Endpoints
# ─────────────────────────────────────────────────────────────────────────────

@app.post("/api/v1/processMultimodalTurn", tags=["Inference"])
async def process_multimodal_turn_endpoint(
    payload: Optional[Dict[str, Any]] = Body(default=None)
) -> Dict[str, Any]:
    """Processes multimodal turn with real face, voice, and health model predictions."""
    data = payload or {}

    # Extract potential image data
    image_data = data.get("image") or data.get("image_base64") or data.get("face_image")
    if not image_data and "videoFeatures" in data and isinstance(data["videoFeatures"], dict):
        image_data = data["videoFeatures"].get("image")

    # Extract potential audio data
    audio_data = data.get("audio") or data.get("audio_base64") or data.get("voice_audio")
    if not audio_data and "audioFeatures" in data and isinstance(data["audioFeatures"], dict):
        audio_data = data["audioFeatures"].get("audio")

    # Extract health & keystroke data
    health_data = data.get("health") or data.get("healthFeatures")
    keystroke_data = data.get("keystrokeFeatures") or data.get("keystroke")

    # Run inference & late fusion
    inference_result = run_multimodal_inference(
        image_data=image_data,
        audio_data=audio_data,
        health_data=health_data,
        keystroke_data=keystroke_data,
    )

    # Generate conversational therapeutic response
    user_message = data.get("text") or data.get("message") or ""
    language = data.get("language", "en")

    bot_reply = "I hear you, and I am here with you."
    suggested_action = "none"
    if user_message:
        bot_res = await therapy_bot.generate_response(
            message=user_message,
            language=language,
            multimodal_data=inference_result,
        )
        bot_reply = bot_res.get("reply", bot_reply)
        suggested_action = bot_res.get("suggested_action", "none")
        language = bot_res.get("language", language)

    inference_result["reply"] = bot_reply
    inference_result["suggested_action"] = suggested_action
    inference_result["suggestedAction"] = suggested_action
    inference_result["language"] = language

    return inference_result


@app.post("/api/v1/therapy/chat", tags=["Inference"])
async def therapy_chat_endpoint(
    payload: Optional[Dict[str, Any]] = Body(default=None)
) -> Dict[str, Any]:
    """Frontend ApiService alias endpoint for /api/v1/processMultimodalTurn."""
    return await process_multimodal_turn_endpoint(payload)


# ─────────────────────────────────────────────────────────────────────────────
# 9. Asynchronous WebSocket Therapy Endpoint
# ─────────────────────────────────────────────────────────────────────────────

@app.websocket("/ws/therapy")
async def websocket_stream_endpoint(websocket: WebSocket) -> None:
    """Asynchronous WebSocket streaming endpoint for real-time multimodal interaction.

    Accepts conversational messages and multimodal telemetry packets (text, voice,
    keystroke metrics, facial signals), returning structured emotional responses.
    """
    await websocket.accept()
    client_host = websocket.client.host if websocket.client else "unknown"
    print(f"[WebSocket Connected] Client connected from: {client_host}", flush=True)

    try:
        while True:
            # 1. Receive incoming raw message
            raw_text = await websocket.receive_text()

            # 2. Attempt JSON parsing with error isolation
            try:
                payload: Dict[str, Any] = json.loads(raw_text)
            except (json.JSONDecodeError, ValueError) as json_err:
                print(f"[WebSocket Warning] Invalid JSON payload received: {raw_text!r} | Error: {json_err}", flush=True)
                await websocket.send_json({
                    "type": "error",
                    "message": "Invalid JSON payload.",
                })
                continue

            # Heartbeat ping handling
            if payload.get("type") == "PING":
                await websocket.send_json({"type": "PONG"})
                continue

            # 3. Support client message envelopes (from frontend websocket.ts)
            data_envelope = payload.get("payload", payload)
            user_message = data_envelope.get("text") or data_envelope.get("message") or ""
            language = data_envelope.get("language", "en")

            # Extract hardware telemetry if present
            image_data = data_envelope.get("image") or (data_envelope.get("videoFeatures", {}).get("image") if isinstance(data_envelope.get("videoFeatures"), dict) else None)
            audio_data = data_envelope.get("audio") or (data_envelope.get("audioFeatures", {}).get("audio") if isinstance(data_envelope.get("audioFeatures"), dict) else None)
            health_data = data_envelope.get("health")
            keystroke_data = data_envelope.get("keystrokeFeatures")

            # 4. Run real ML inference & late fusion
            inference_result = run_multimodal_inference(
                image_data=image_data,
                audio_data=audio_data,
                health_data=health_data,
                keystroke_data=keystroke_data,
            )

            # 5. Process conversational turn through TherapyBot
            bot_result = await therapy_bot.generate_response(
                message=user_message,
                language=language,
                multimodal_data=inference_result,
            )

            reply_text = bot_result.get("reply", "I hear you, and I am here with you.")
            action = bot_result.get("suggested_action", "none")
            resp_lang = bot_result.get("language", language)

            # 6. Return structured therapeutic response to frontend
            response_payload = {
                "type": "AI_REPLY",
                "messageId": f"msg-{int(datetime.utcnow().timestamp() * 1000)}",
                "message": reply_text,
                "replyText": reply_text,
                "language": resp_lang,
                "suggested_action": action,
                "suggestedAction": action,
                "stressSnapshot": {
                    "score": inference_result["stressScore"],
                    "level": inference_result["stressLevel"] if inference_result["stressLevel"] != "medium" else "moderate",
                },
                "detectedEmotions": inference_result["emotions"]["distribution"],
            }
            await websocket.send_json(response_payload)

    except WebSocketDisconnect:
        print(f"[WebSocket Disconnected] WebSocket client disconnected: {client_host}", flush=True)
    except Exception as exc:
        print(f"[WebSocket Error] Unexpected error in WebSocket loop: {exc}", flush=True)
