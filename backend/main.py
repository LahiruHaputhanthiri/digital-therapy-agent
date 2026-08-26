"""MindCare Unified Multimodal Therapy API.

Single Source of Truth (SSOT) Backend Pipeline for Multimodal Emotion-Aware
Digital Therapeutics supporting Trilingual interaction (English, Sinhala, & Tamil)
with integrated WebM/Opus-to-WAV Speech-to-Text (STT) and Empathy-First CBT Agent.
"""

import base64
from datetime import datetime, timezone
import io
import json
import os
import re
import sys
import time
import traceback
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

# Multimedia, Audio, STT & Machine Learning Libraries
import av
import cv2
import joblib
import librosa
import numpy as np
import pydub
import soundfile as sf
import tensorflow as tf

# Ensure Windows terminal handles UTF-8 (e.g. Sinhala & Tamil unicode characters)
if sys.platform == "win32":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from dotenv import load_dotenv
import edge_tts
from gtts import gTTS
from fastapi import Body, FastAPI, HTTPException, Query, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, StreamingResponse
from pydantic import BaseModel, Field

from agent.therapy_bot import TherapyBot

# ─────────────────────────────────────────────────────────────────────────────
# 1. Environment & Model Discovery
# ─────────────────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR.parent / "models"
if not MODELS_DIR.exists():
    MODELS_DIR = BASE_DIR / "models"
if not MODELS_DIR.exists():
    MODELS_DIR = Path("models").resolve()

env_path = BASE_DIR / ".env"
load_dotenv(dotenv_path=env_path)

# Initialize AI Therapy Agent
therapy_bot = TherapyBot(api_key=os.getenv("GEMINI_API_KEY"))

# ─────────────────────────────────────────────────────────────────────────────
# 2. Canonical Emotion Vocabulary & Stress Mappings
# ─────────────────────────────────────────────────────────────────────────────
FACE_CLASSES: List[str] = ["Angry", "Disgust", "Fear", "Happy", "Neutral", "Sad", "Surprise"]
VOICE_CLASSES: List[str] = ["Angry", "Disgust", "Fear", "Happy", "Neutral", "Sad"]
HEALTH_CLASSES: List[str] = ["at-risk", "fit", "unhealthy"]

EMOTION_NORMALIZATION_MAP: Dict[str, str] = {
    "anger": "angry",
    "angry": "angry",
    "happiness": "happy",
    "happy": "happy",
    "joy": "happy",
    "sadness": "sad",
    "sad": "sad",
    "fearful": "fear",
    "fear": "fear",
    "fear_anxiety": "fear",
    "disgust": "disgust",
    "surprise": "surprise",
    "surprised": "surprise",
    "neutral": "neutral",
    "calm": "neutral",
}

# Non-clinical Stress Heuristic Weights (0.0 = calm, 1.0 = acute distress)
EMOTION_STRESS_MAP: Dict[str, float] = {
    "angry": 0.85,
    "fear": 0.90,
    "sad": 0.75,
    "disgust": 0.65,
    "surprise": 0.45,
    "uncertain": 0.50,
    "neutral": 0.30,
    "happy": 0.15,
}

# Default Modality Fusion Weights
FACE_WEIGHT: float = 0.50
VOICE_WEIGHT: float = 0.50

# ─────────────────────────────────────────────────────────────────────────────
# 3. Model & Scaler Loading (Executed Once at Startup)
# ─────────────────────────────────────────────────────────────────────────────
face_model = None
voice_model = None
voice_scaler = None
health_model = None

# Face Emotion Model
face_model_paths = [
    MODELS_DIR / "best_face_model_v2.h5",
    MODELS_DIR / "best_face_model.h5",
]
for f_path in face_model_paths:
    if f_path.exists():
        try:
            face_model = tf.keras.models.load_model(f_path)
            print(f"SUCCESS: Face emotion model loaded successfully from {f_path.name}.", flush=True)
            break
        except Exception as e:
            print(f"WARNING: Could not load face model {f_path.name}: {e}", flush=True)

# Voice Emotion Model & Scaler
voice_model_paths = [
    MODELS_DIR / "best_voice_model_v2.h5",
    MODELS_DIR / "best_voice_model.h5",
]
for v_path in voice_model_paths:
    if v_path.exists():
        try:
            voice_model = tf.keras.models.load_model(v_path)
            print(f"SUCCESS: Voice emotion model loaded successfully from {v_path.name}.", flush=True)
            break
        except Exception as e:
            print(f"WARNING: Could not load voice model {v_path.name}: {e}", flush=True)

voice_scaler_paths = [
    MODELS_DIR / "voice_scaler_v2.pkl",
    MODELS_DIR / "voice_scaler.pkl",
]
for s_path in voice_scaler_paths:
    if s_path.exists():
        try:
            voice_scaler = joblib.load(s_path)
            print(f"SUCCESS: Voice MFCC scaler loaded successfully from {s_path.name}.", flush=True)
            break
        except Exception as e:
            print(f"WARNING: Could not load voice scaler {s_path.name}: {e}", flush=True)

# Health & Biometric Model
health_model_paths = [
    MODELS_DIR / "best_health_model_v2.pkl",
    MODELS_DIR / "best_health_model.pkl",
]
for h_path in health_model_paths:
    if h_path.exists():
        try:
            health_model = joblib.load(h_path)
            print(f"SUCCESS: Health/stress model loaded successfully from {h_path.name}.", flush=True)
            break
        except Exception as e:
            print(f"WARNING: Could not load health model {h_path.name}: {e}", flush=True)


# ─────────────────────────────────────────────────────────────────────────────
# 4. Canonical Single-Responsibility Helpers
# ─────────────────────────────────────────────────────────────────────────────

def normalize_emotion(raw_emotion: Optional[str]) -> Optional[str]:
    """Canonical Function: Normalizes raw emotion strings into the canonical 7-class vocabulary."""
    if not raw_emotion:
        return None
    key = str(raw_emotion).strip().lower()
    if key in EMOTION_NORMALIZATION_MAP:
        return EMOTION_NORMALIZATION_MAP[key]
    print(f"[EMOTION WARNING] Unknown emotion label '{raw_emotion}' excluded from fusion.", flush=True)
    return None


def decode_audio_to_pcm_wav(audio_bytes: bytes, target_sr: int = 16000) -> Optional[bytes]:
    """Robust in-memory audio converter that decodes browser WebM (Opus), Ogg, MP3, WAV, AAC
    and outputs standard 16-bit Mono PCM WAV bytes.
    Returns None if decoding fails, guaranteeing no uncaught exceptions escape.
    """
    if not audio_bytes or len(audio_bytes) == 0:
        return None

    # Method 1: PyAV (Embedded FFmpeg libraries for in-memory WebM/Opus/Ogg demuxing)
    try:
        container = av.open(io.BytesIO(audio_bytes))
        audio_stream = next((s for s in container.streams if s.type == "audio"), None)
        if audio_stream is not None:
            resampler = av.AudioResampler(format="s16", layout="mono", rate=target_sr)
            pcm_chunks = []
            for frame in container.decode(audio_stream):
                resampled_frames = resampler.resample(frame)
                for rf in resampled_frames:
                    pcm_chunks.append(rf.to_ndarray())
            container.close()
            if pcm_chunks:
                full_pcm = np.concatenate(pcm_chunks, axis=1)
                samples = full_pcm[0]
                if len(samples) > 0:
                    wav_io = io.BytesIO()
                    sf.write(wav_io, samples, target_sr, format="WAV", subtype="PCM_16")
                    pcm_bytes = wav_io.getvalue()
                    print(f"[AUDIO DECODER] PyAV successfully decoded {len(pcm_chunks)} frames ({len(samples)} samples @ {target_sr}Hz) -> {len(pcm_bytes)} WAV bytes.", flush=True)
                    return pcm_bytes
    except Exception as av_err:
        print(f"[AUDIO] WebM decode error: {type(av_err).__name__}: {av_err}", flush=True)

    # Method 2: pydub AudioSegment
    try:
        from pydub import AudioSegment
        seg = AudioSegment.from_file(io.BytesIO(audio_bytes))
        seg = seg.set_frame_rate(target_sr).set_channels(1).set_sample_width(2)
        wav_io = io.BytesIO()
        seg.export(wav_io, format="wav")
        pcm_bytes = wav_io.getvalue()
        if len(pcm_bytes) > 44:
            print(f"[AUDIO DECODER] Pydub successfully converted audio -> {len(pcm_bytes)} WAV bytes.", flush=True)
            return pcm_bytes
    except Exception as pydub_err:
        print(f"[AUDIO] Pydub decode error: {type(pydub_err).__name__}: {pydub_err}", flush=True)

    # Method 3: soundfile / librosa fallback
    try:
        try:
            y, sr = sf.read(io.BytesIO(audio_bytes))
        except Exception:
            y, sr = librosa.load(io.BytesIO(audio_bytes), sr=target_sr)
        if len(y.shape) > 1:
            y = np.mean(y, axis=1)
        if sr != target_sr:
            y = librosa.resample(y, orig_sr=sr, target_sr=target_sr)
        if len(y) > 0:
            wav_io = io.BytesIO()
            sf.write(wav_io, y, target_sr, format="WAV", subtype="PCM_16")
            pcm_bytes = wav_io.getvalue()
            print(f"[AUDIO DECODER] Soundfile/Librosa successfully read audio -> {len(pcm_bytes)} WAV bytes.", flush=True)
            return pcm_bytes
    except Exception as sf_err:
        print(f"[AUDIO] Soundfile/Librosa decode error: {type(sf_err).__name__}: {sf_err}", flush=True)

    print(f"[AUDIO DECODER ERROR] All audio decoders failed for {len(audio_bytes)} byte payload.", flush=True)
    return None


async def transcribe_audio(
    audio_data: Any,
    language: str = "en",
    mime_type: Optional[str] = None,
) -> Tuple[str, str]:
    """Dedicated STT Function: Uses Gemini Multimodal Audio understanding to transcribe spoken audio.
    Returns (transcription_text, transcription_status).
    transcription_status is one of: 'success' | 'unclear' | 'failed' | 'not_requested'.
    Guaranteed NEVER to raise an exception or crash the request.
    """
    if not audio_data:
        return "", "not_requested"

    # 1. Base64 payload extraction & MIME type detection
    detected_mime: Optional[str] = mime_type
    audio_bytes: Optional[bytes] = None

    try:
        if isinstance(audio_data, str):
            audio_str = audio_data.strip()
            if not audio_str:
                return "", "not_requested"
            if audio_str.startswith("data:"):
                header, base64_payload = audio_str.split(",", 1)
                if ":" in header and ";" in header:
                    extracted = header.split(":", 1)[1].split(";", 1)[0].strip()
                    if extracted:
                        detected_mime = extracted
                audio_bytes = base64.b64decode(base64_payload.strip())
            else:
                audio_bytes = base64.b64decode(audio_str)
        elif isinstance(audio_data, (bytes, bytearray)):
            audio_bytes = bytes(audio_data)
        else:
            print(f"[STT Warning] Unsupported audio type for transcription: {type(audio_data)}", flush=True)
            return "", "failed"
    except Exception as b64_err:
        print(f"[STT Error] Malformed Base64 audio payload: {type(b64_err).__name__}: {b64_err}", flush=True)
        return "", "failed"

    if not audio_bytes or len(audio_bytes) == 0:
        print("[STT Warning] Empty audio payload received.", flush=True)
        return "", "failed"

    # 2. In-Memory PCM WAV Normalization & Energy Check for Silence
    try:
        pcm_wav_bytes = decode_audio_to_pcm_wav(audio_bytes, target_sr=16000)
        if pcm_wav_bytes:
            y, _ = sf.read(io.BytesIO(pcm_wav_bytes))
            if len(y) > 0:
                if y.ndim > 1:
                    y = np.mean(y, axis=1)
                rms = float(np.sqrt(np.mean(y**2)))
                max_amp = float(np.max(np.abs(y)))
                if rms < 0.003 and max_amp < 0.008:
                    print(f"[STT] Audio energy below threshold (rms={rms:.5f}, max_amp={max_amp:.5f}) -> Silence detected -> EMPTY_AUDIO", flush=True)
                    return "", "unclear"
    except Exception as check_err:
        print(f"[STT Warning] Silence energy check skipped: {check_err}", flush=True)

    # 3. Determine Audio MIME Type
    if not detected_mime:
        if audio_bytes.startswith(b"RIFF") and b"WAVE" in audio_bytes[:16]:
            detected_mime = "audio/wav"
        elif audio_bytes.startswith(b"\x1aE\xdf\xa3"):
            detected_mime = "audio/webm"
        elif audio_bytes.startswith(b"OggS"):
            detected_mime = "audio/ogg"
        elif audio_bytes.startswith(b"ID3") or audio_bytes.startswith(b"\xff\xfb") or audio_bytes.startswith(b"\xff\xf3"):
            detected_mime = "audio/mp3"
        else:
            detected_mime = "audio/webm"

    # 4. Target Language Mapping
    lang_map = {
        "en": "English",
        "english": "English",
        "si": "Sinhala",
        "sinhala": "Sinhala",
        "ta": "Tamil",
        "tamil": "Tamil",
    }
    target_language = lang_map.get(str(language).strip().lower(), "English")
    print(f"[STT] Starting Gemini Multimodal transcription | target_language={target_language} | mime_type={detected_mime} | bytes={len(audio_bytes)}", flush=True)

    # 5. Check Gemini STT Model Availability
    stt_gen_model = getattr(therapy_bot, "stt_model", None) or getattr(therapy_bot, "model", None)
    if stt_gen_model is None:
        print("[STT Error] No Gemini model available for transcription.", flush=True)
        return "", "failed"

    # 6. Multimodal Audio Prompt
    prompt = (
        "You are a highly accurate transcription AI.\n\n"
        "Listen carefully to this audio and transcribe ONLY the speech.\n\n"
        f"The expected language is: {target_language}.\n\n"
        "Return ONLY the transcribed speech.\n\n"
        "Do not translate it.\n"
        "Do not add explanations.\n"
        "Do not add markdown.\n"
        "Do not answer the speaker.\n"
        "Do not summarize the audio.\n\n"
        "If the audio is completely silent, contains only background noise,\n"
        "or contains no sufficiently clear human speech, return exactly:\n\n"
        "EMPTY_AUDIO"
    )

    stt_start_time = time.perf_counter()
    try:
        audio_part = {
            "mime_type": detected_mime,
            "data": audio_bytes,
        }

        res = await stt_gen_model.generate_content_async([audio_part, prompt])
        stt_elapsed = time.perf_counter() - stt_start_time

        if not res or not res.text:
            print(f"[STT] Gemini returned empty response in {stt_elapsed:.2f}s", flush=True)
            return "", "unclear"

        raw_text = res.text.strip()
        # Clean any markdown code blocks or quotes
        clean_text = re.sub(r"^```[a-zA-Z]*\s*|\s*```$", "", raw_text).strip()
        clean_text = re.sub(r'^["\']|["\']$', "", clean_text).strip()

        if not clean_text or clean_text.upper() == "EMPTY_AUDIO":
            print(f"[STT] Gemini detected silence/non-speech (EMPTY_AUDIO) in {stt_elapsed:.2f}s", flush=True)
            return "", "unclear"

        print(f"[STT] Gemini STT success ({stt_elapsed:.2f}s) | language={target_language} | characters={len(clean_text)}", flush=True)
        preview = clean_text[:50] + "..." if len(clean_text) > 50 else clean_text
        print(f'[STT] Spoken text transcribed: "{preview}"', flush=True)
        return clean_text, "success"

    except Exception as gemini_stt_err:
        stt_elapsed = time.perf_counter() - stt_start_time
        print(f"[STT Error] Gemini audio transcription failed ({stt_elapsed:.2f}s): {type(gemini_stt_err).__name__}: {gemini_stt_err}", flush=True)
        return "", "failed"


def predict_face_emotion(image_data: Any) -> Dict[str, Any]:
    """Canonical Function: Predicts facial emotion with model-matching preprocessing (RGB 96x96 vs Grayscale 48x48)."""
    if face_model is None:
        raise ValueError("Face emotion model is not loaded.")

    if isinstance(image_data, str):
        if image_data.startswith("data:"):
            image_data = image_data.split(",", 1)[1]
        image_bytes = base64.b64decode(image_data)
    elif isinstance(image_data, (bytes, bytearray)):
        image_bytes = bytes(image_data)
    else:
        raise ValueError(f"Unsupported image_data type: {type(image_data)}")

    image_array = np.frombuffer(image_bytes, dtype=np.uint8)

    in_shape = face_model.input_shape
    is_rgb = len(in_shape) == 4 and in_shape[-1] == 3
    target_h = in_shape[1] if len(in_shape) >= 3 and in_shape[1] is not None else 48
    target_w = in_shape[2] if len(in_shape) >= 3 and in_shape[2] is not None else 48

    if is_rgb:
        image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
        if image is None:
            raise ValueError("Unable to decode RGB image with OpenCV.")
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        image_resized = cv2.resize(image_rgb, (target_w, target_h), interpolation=cv2.INTER_AREA)
        image_normalized = tf.keras.applications.mobilenet_v2.preprocess_input(image_resized.astype(np.float32))
        image_tensor = np.expand_dims(image_normalized, axis=0)
    else:
        image = cv2.imdecode(image_array, cv2.IMREAD_GRAYSCALE)
        if image is None:
            raise ValueError("Unable to decode grayscale image with OpenCV.")
        image_resized = cv2.resize(image, (target_w, target_h), interpolation=cv2.INTER_AREA)
        image_normalized = image_resized.astype(np.float32) / 255.0
        image_tensor = np.expand_dims(image_normalized, axis=(0, -1))

    face_probs = face_model.predict(image_tensor, verbose=0)[0]
    top_idx = int(np.argmax(face_probs))
    raw_emotion = FACE_CLASSES[top_idx] if top_idx < len(FACE_CLASSES) else "Neutral"
    norm_emotion = normalize_emotion(raw_emotion) or "neutral"
    confidence = float(face_probs[top_idx])

    probs_dict = {
        normalize_emotion(FACE_CLASSES[i]) or FACE_CLASSES[i].lower(): round(float(face_probs[i]), 4)
        for i in range(min(len(FACE_CLASSES), len(face_probs)))
    }

    print(f"[FACE] Emotion: {norm_emotion.capitalize()} | Confidence: {confidence:.2f}", flush=True)

    return {
        "emotion": norm_emotion,
        "confidence": round(confidence, 4),
        "probabilities": probs_dict,
    }


def predict_voice_emotion(audio_data: Any) -> Optional[Dict[str, Any]]:
    """Canonical Function: Extracts 40 MFCCs, scales, and predicts vocal emotion from browser WebM/Opus or WAV audio."""
    if voice_model is None:
        print("[VOICE Notice] Voice emotion model is not loaded.", flush=True)
        return None

    try:
        if isinstance(audio_data, str):
            if audio_data.startswith("data:"):
                audio_data = audio_data.split(",", 1)[1]
            audio_bytes = base64.b64decode(audio_data)
        elif isinstance(audio_data, (bytes, bytearray)):
            audio_bytes = bytes(audio_data)
        elif isinstance(audio_data, list):
            mfccs_mean = np.array(audio_data, dtype=np.float32)
            if voice_scaler is not None and len(mfccs_mean) == 40:
                mfccs_scaled = voice_scaler.transform([mfccs_mean])[0]
            else:
                mfccs_scaled = mfccs_mean

            in_shape = voice_model.input_shape
            if len(in_shape) == 3:
                voice_tensor = np.expand_dims(mfccs_scaled, axis=(0, -1))
            else:
                voice_tensor = np.expand_dims(mfccs_scaled, axis=0)

            voice_probs = voice_model.predict(voice_tensor, verbose=0)[0]
            top_idx = int(np.argmax(voice_probs))
            raw_emotion = VOICE_CLASSES[top_idx] if top_idx < len(VOICE_CLASSES) else "Neutral"
            norm_emotion = normalize_emotion(raw_emotion) or "neutral"
            confidence = float(voice_probs[top_idx])

            probs_dict = {
                normalize_emotion(VOICE_CLASSES[i]) or VOICE_CLASSES[i].lower(): round(float(voice_probs[i]), 4)
                for i in range(min(len(VOICE_CLASSES), len(voice_probs)))
            }
            print(f"[VOICE] Emotion: {norm_emotion.capitalize()} | Confidence: {confidence:.2f}", flush=True)
            return {
                "emotion": norm_emotion,
                "confidence": round(confidence, 4),
                "probabilities": probs_dict,
            }
        else:
            print(f"[VOICE Warning] Unsupported audio_data type: {type(audio_data)}", flush=True)
            return None

        # Convert incoming audio (WebM, Opus, Ogg, MP3, WAV) into 22.05kHz PCM WAV
        pcm_wav_bytes = decode_audio_to_pcm_wav(audio_bytes, target_sr=22050)
        if not pcm_wav_bytes:
            print("[VOICE Warning] Unable to decode audio payload for voice emotion prediction.", flush=True)
            return None

        y, sr = sf.read(io.BytesIO(pcm_wav_bytes))
        if len(y.shape) > 1:
            y = np.mean(y, axis=1)

        if len(y) == 0:
            print("[VOICE Warning] Decoded audio waveform is empty.", flush=True)
            return None

        mfccs = librosa.feature.mfcc(y=y, sr=22050, n_mfcc=40)
        mfccs_mean = np.mean(mfccs.T, axis=0).astype(np.float32)

        if voice_scaler is not None:
            mfccs_scaled = voice_scaler.transform([mfccs_mean])[0]
        else:
            mfccs_scaled = mfccs_mean

        in_shape = voice_model.input_shape
        if len(in_shape) == 3:
            voice_tensor = np.expand_dims(mfccs_scaled, axis=(0, -1))
        else:
            voice_tensor = np.expand_dims(mfccs_scaled, axis=0)

        voice_probs = voice_model.predict(voice_tensor, verbose=0)[0]
        top_idx = int(np.argmax(voice_probs))
        raw_emotion = VOICE_CLASSES[top_idx] if top_idx < len(VOICE_CLASSES) else "Neutral"
        norm_emotion = normalize_emotion(raw_emotion) or "neutral"
        confidence = float(voice_probs[top_idx])

        probs_dict = {
            normalize_emotion(VOICE_CLASSES[i]) or VOICE_CLASSES[i].lower(): round(float(voice_probs[i]), 4)
            for i in range(min(len(VOICE_CLASSES), len(voice_probs)))
        }

        print(f"[VOICE] Emotion: {norm_emotion.capitalize()} | Confidence: {confidence:.2f}", flush=True)

        return {
            "emotion": norm_emotion,
            "confidence": round(confidence, 4),
            "probabilities": probs_dict,
        }
    except Exception as v_err:
        print(f"[VOICE Error] Voice emotion prediction failed: {type(v_err).__name__}: {v_err}", flush=True)
        return None


def fuse_emotions(
    face_data: Optional[Dict[str, Any]],
    voice_data: Optional[Dict[str, Any]],
    face_weight: float = FACE_WEIGHT,
    voice_weight: float = VOICE_WEIGHT,
) -> Tuple[str, float, Dict[str, float]]:
    """Canonical Function: Late fusion of facial and vocal emotion distributions with polar conflict detection."""
    canonical_emotions = ["angry", "happy", "sad", "fear", "disgust", "surprise", "neutral"]

    face_probs = face_data.get("probabilities", {}) if face_data else None
    voice_probs = voice_data.get("probabilities", {}) if voice_data else None

    # Case 1: Both modalities available
    if face_data and voice_data:
        face_emo = face_data.get("emotion", "neutral")
        face_conf = float(face_data.get("confidence", 0.0))
        voice_emo = voice_data.get("emotion", "neutral")
        voice_conf = float(voice_data.get("confidence", 0.0))

        fused_dist: Dict[str, float] = {}
        for emo in canonical_emotions:
            f_val = face_probs.get(emo, 0.0) if face_probs else (face_conf if emo == face_emo else 0.0)
            v_val = voice_probs.get(emo, 0.0) if voice_probs else (voice_conf if emo == voice_emo else 0.0)
            fused_dist[emo] = round(face_weight * f_val + voice_weight * v_val, 4)

        # Conflict Detection (e.g. Happy vs Sad/Fear/Angry)
        is_polar_conflict = (
            (face_emo == "happy" and voice_emo in ["sad", "fear", "angry"]) or
            (voice_emo == "happy" and face_emo in ["sad", "fear", "angry"]) or
            (face_emo != voice_emo and face_conf >= 0.70 and voice_conf >= 0.70)
        )

        top_emo = max(fused_dist, key=fused_dist.get)
        top_conf = fused_dist[top_emo]

        if is_polar_conflict and (top_conf < 0.60 or (face_emo != voice_emo and abs(face_conf - voice_conf) < 0.15)):
            fused_emotion = "uncertain"
            fused_confidence = round(float(np.mean([face_conf, voice_conf])), 2)
            print(f"[FUSION]\nFace: {face_emo.capitalize()} ({face_conf:.2f})\nVoice: {voice_emo.capitalize()} ({voice_conf:.2f})\nResult: Uncertain", flush=True)
        else:
            fused_emotion = top_emo
            fused_confidence = round(top_conf, 2)
            print(f"[FUSION] Emotion: {fused_emotion.capitalize()} | Confidence: {fused_confidence:.2f}", flush=True)

        return fused_emotion, fused_confidence, fused_dist

    # Case 2: Face only
    elif face_data:
        face_emo = face_data.get("emotion", "neutral")
        face_conf = float(face_data.get("confidence", 0.80))
        print(f"[FUSION] Emotion: {face_emo.capitalize()} | Confidence: {face_conf:.2f}", flush=True)
        return face_emo, round(face_conf, 2), face_probs or {face_emo: face_conf}

    # Case 3: Voice only
    elif voice_data:
        voice_emo = voice_data.get("emotion", "neutral")
        voice_conf = float(voice_data.get("confidence", 0.80))
        print(f"[FUSION] Emotion: {voice_emo.capitalize()} | Confidence: {voice_conf:.2f}", flush=True)
        return voice_emo, round(voice_conf, 2), voice_probs or {voice_emo: voice_conf}

    # Case 4: Text only
    else:
        print("[FUSION] Text-only request", flush=True)
        return "neutral", 0.70, {"neutral": 0.70}


def calculate_stress_score(
    detected_emotion: str,
    emotion_confidence: float = 0.80,
    client_stress_level: Optional[float] = None,
    fused_dist: Optional[Dict[str, float]] = None,
) -> Tuple[float, str]:
    """Canonical Function: Calculates non-clinical stress score (0.0 - 1.0) and label ('low', 'moderate', 'high')."""
    if client_stress_level is not None:
        raw_score = float(client_stress_level)
    elif fused_dist and len(fused_dist) > 1:
        raw_score = sum(fused_dist.get(emo, 0.0) * EMOTION_STRESS_MAP.get(emo, 0.30) for emo in EMOTION_STRESS_MAP)
    else:
        base_stress = EMOTION_STRESS_MAP.get(detected_emotion, 0.35)
        raw_score = base_stress * emotion_confidence + (1.0 - emotion_confidence) * 0.35

    stress_score = round(float(np.clip(raw_score, 0.0, 1.0)), 2)

    if stress_score < 0.35:
        stress_label = "low"
    elif stress_score < 0.70:
        stress_label = "moderate"
    else:
        stress_label = "high"

    print(f"[STRESS] Score: {stress_score:.2f} | Level: {stress_label.capitalize()}", flush=True)
    return stress_score, stress_label


def build_therapy_prompt(
    user_message: str,
    detected_emotion: str,
    stress_score: float,
    stress_label: str,
    language: str,
    modalities: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Canonical Function: Builds structured contextual telemetry context for CBT response generation."""
    return {
        "detected_emotion": detected_emotion,
        "stress_level": stress_score,
        "stress_label": stress_label,
        "language": language,
        "modalities": modalities or {},
    }


# ─────────────────────────────────────────────────────────────────────────────
# 5. The Canonical Multimodal Therapy Pipeline (Single Source of Truth)
# ─────────────────────────────────────────────────────────────────────────────

async def process_multimodal_therapy(request_data: Dict[str, Any]) -> Dict[str, Any]:
    """Single Canonical Multimodal Processing Pipeline for MindCare.

    All REST endpoints and WebSocket stream handlers delegate to this function.
    """
    print("\n" + "=" * 50, flush=True)
    print("[THERAPY] New multimodal request", flush=True)

    # 1. Extract inputs
    raw_typed_message = str(request_data.get("message") or request_data.get("text") or "").strip()
    language = str(
        request_data.get("language")
        or (request_data.get("payload", {}).get("language") if isinstance(request_data.get("payload"), dict) else None)
        or "en"
    ).strip().lower()

    chat_history = request_data.get("history") or request_data.get("chat_history") or request_data.get("chatHistory") or (
        request_data.get("payload", {}).get("history") if isinstance(request_data.get("payload"), dict) else None
    ) or []

    if re.search(r"[\u0D80-\u0DFF]", raw_typed_message):
        language = "si"
    elif re.search(r"[\u0B80-\u0BFF]", raw_typed_message):
        language = "ta"

    print(f"[THERAPY] Active language mode: {language}", flush=True)

    face_image = request_data.get("face_image") or request_data.get("image") or (
        request_data.get("videoFeatures", {}).get("image") if isinstance(request_data.get("videoFeatures"), dict) else None
    )
    face_emotion_input = request_data.get("face_emotion") or request_data.get("faceEmotion")
    face_conf_input = request_data.get("face_confidence") or request_data.get("faceConfidence")

    voice_audio = request_data.get("voice_audio") or request_data.get("audio") or (
        request_data.get("audioFeatures", {}).get("audio") if isinstance(request_data.get("audioFeatures"), dict) else None
    )
    voice_features = request_data.get("voice_features")
    voice_emotion_input = request_data.get("voice_emotion") or request_data.get("voiceEmotion")
    voice_conf_input = request_data.get("voice_confidence") or request_data.get("voiceConfidence")

    client_stress = request_data.get("stress_level") or request_data.get("stressScore")

    # 2. Speech-to-Text Transcription (STT) Stage BEFORE CBT prompt generation
    transcribed_text: str = ""
    transcription_status: str = "not_requested"
    if voice_audio:
        try:
            transcribed_text, transcription_status = await transcribe_audio(voice_audio, language=language)
            if transcribed_text:
                if re.search(r"[\u0D80-\u0DFF]", transcribed_text):
                    language = "si"
                elif re.search(r"[\u0B80-\u0BFF]", transcribed_text):
                    language = "ta"
        except Exception as stt_err:
            print(f"[STT Error] Failed to transcribe voice audio: {type(stt_err).__name__}: {stt_err}", flush=True)
            transcribed_text = ""
            transcription_status = "failed"

    # Message Assignment Policy
    user_message = raw_typed_message
    if not user_message and transcribed_text:
        user_message = transcribed_text.strip()
        print("[PIPELINE] message_source = voice_transcription", flush=True)
    elif user_message:
        print("[PIPELINE] message_source = typed_message", flush=True)

    # 3. Face Emotion Processing
    face_info: Optional[Dict[str, Any]] = None
    if face_image:
        try:
            face_info = predict_face_emotion(face_image)
        except Exception as e:
            print(f"[FACE Error] Face prediction failed: {e}", flush=True)
    elif face_emotion_input:
        norm_face = normalize_emotion(face_emotion_input)
        if norm_face:
            conf = float(face_conf_input) if face_conf_input is not None else 0.85
            face_info = {
                "emotion": norm_face,
                "confidence": conf,
                "probabilities": {norm_face: conf},
            }
            print(f"[FACE] Emotion: {norm_face.capitalize()} | Confidence: {conf:.2f}", flush=True)

    # 4. Voice Emotion Processing
    voice_info: Optional[Dict[str, Any]] = None
    if voice_audio or voice_features:
        try:
            voice_info = predict_voice_emotion(voice_audio or voice_features)
        except Exception as e:
            print(f"[VOICE Error] Voice prediction failed: {e}", flush=True)
    elif voice_emotion_input:
        norm_voice = normalize_emotion(voice_emotion_input)
        if norm_voice:
            conf = float(voice_conf_input) if voice_conf_input is not None else 0.80
            voice_info = {
                "emotion": norm_voice,
                "confidence": conf,
                "probabilities": {norm_voice: conf},
            }
            print(f"[VOICE] Emotion: {norm_voice.capitalize()} | Confidence: {conf:.2f}", flush=True)

    # 5. Late Fusion with Conflict Handling
    detected_emotion, emotion_confidence, fused_dist = fuse_emotions(face_info, voice_info)

    # 6. Stress Calculation (Non-clinical engineering heuristic)
    stress_score, stress_label = calculate_stress_score(
        detected_emotion=detected_emotion,
        emotion_confidence=emotion_confidence,
        client_stress_level=client_stress,
        fused_dist=fused_dist,
    )

    # 7. Check for Empty Message & Provide Graceful Response (Never send empty voice/silence to Gemini)
    if not user_message:
        if voice_audio:
            if language == "si":
                ai_text = "මට ඔබේ හඬ පණිවිඩයේ කිසිදු පැහැදිලි කථනයක් හඳුනා ගැනීමට නොහැකි විය. කරුණාකර නැවත කතා කරන්න."
            elif language == "ta":
                ai_text = "உங்கள் குரல் பதிவில் தெளிவான பேச்சு எதுவும் கண்டறியப்படவில்லை. தயவுசெய்து மீண்டும் பேச முயற்சிக்கவும்."
            else:
                ai_text = "I couldn't detect any clear speech in that recording. Please try speaking again."
        else:
            if language == "si":
                ai_text = "මම ඔබට සවන් දීමට මෙහි සිටිමි. ඔබේ සිතේ ඇති දේ මා සමඟ බෙදාගන්න."
            elif language == "ta":
                ai_text = "நான் உங்களுக்கு செවිசாய்க்க இங்கு இருக்கிறேன். உங்கள் மனதில் உள்ளதை என்னுடன் பகிருங்கள்."
            else:
                ai_text = "I am here to listen. Please feel free to share what is on your mind."

        suggested_action = "none"
        resp_language = language
    else:
        # 8. Build Therapy Context & Generate Guided CBT Response
        print("[AI] Generating guided response with context...", flush=True)
        telemetry_context = build_therapy_prompt(
            user_message=user_message,
            detected_emotion=detected_emotion,
            stress_score=stress_score,
            stress_label=stress_label,
            language=language,
            modalities={
                "face": face_info.get("emotion") if face_info else None,
                "voice": voice_info.get("emotion") if voice_info else None,
            },
        )

        try:
            bot_res = await therapy_bot.generate_response(
                message=user_message,
                language=language,
                multimodal_data=telemetry_context,
                chat_history=chat_history,
            )
            ai_text = bot_res.get("reply", "I hear you, and I am here to support you in this moment.")
            suggested_action = bot_res.get("suggested_action", "none")
            resp_language = bot_res.get("language", language)
        except Exception as gemini_err:
            print(f"[AI Warning] Generation failed: {gemini_err}. Using fallback.", flush=True)
            ai_text = "I hear what you are experiencing. Let's take a gentle breath together."
            suggested_action = "none"
            resp_language = language

    print("[AI] Response generated successfully", flush=True)
    print("=" * 50 + "\n", flush=True)

    # 9. Modalities Summary Structure
    modalities_summary: Dict[str, Any] = {
        "face": None,
        "voice": None,
    }
    if face_info:
        modalities_summary["face"] = {
            "emotion": face_info["emotion"],
            "confidence": round(float(face_info["confidence"]), 2),
        }
    if voice_info:
        modalities_summary["voice"] = {
            "emotion": voice_info["emotion"],
            "confidence": round(float(voice_info["confidence"]), 2),
        }

    # Normalized 0-100% emotion distribution for UI bars
    norm_dist = {k: round(v * 100, 1) for k, v in fused_dist.items()} if fused_dist else {"neutral": 70.0}

    # Unified Response (ISO-8601 UTC timestamp)
    return {
        "status": "success",
        "message": user_message,
        "transcription": transcribed_text,
        "transcription_status": transcription_status,
        "transcriptionStatus": transcription_status,
        "detected_emotion": detected_emotion,
        "emotion_confidence": round(float(emotion_confidence), 2),
        "stress_level": stress_score,
        "stress_label": stress_label,
        "ai_response": ai_text,
        "reply": ai_text,  # Legacy alias
        "suggested_action": suggested_action,
        "language": resp_language,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "modalities": modalities_summary,
        "emotions": {
            "face": face_info,
            "voice": voice_info,
            "distribution": norm_dist,
        },
        "stress": {
            "score": round(stress_score * 100, 1),
            "level": stress_label,
            "confidence": round(float(emotion_confidence), 2),
            "trend": "stable",
            "lastUpdated": datetime.now(timezone.utc).isoformat(),
            "disclaimer": "Academic wellness indicator — not a clinical diagnosis.",
        },
    }


# ─────────────────────────────────────────────────────────────────────────────
# 6. FastAPI App & CORS Setup
# ─────────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="MindCare Multimodal Therapy API",
    description="Unified Multimodal Emotion-Aware Digital Therapy Assistant Backend.",
    version="0.5.1",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────────────────────────────────────
# 7. Request & Response Schemas
# ─────────────────────────────────────────────────────────────────────────────

class HealthStatusResponse(BaseModel):
    status: str
    service: str
    version: str
    message: str


class MultimodalChatRequest(BaseModel):
    """Canonical Pydantic Request Schema for POST /api/v1/therapy/multimodal-chat."""
    message: Optional[str] = Field(default=None, description="Primary user conversational text.")
    face_emotion: Optional[str] = Field(default=None, description="Client-detected face emotion label.")
    face_confidence: Optional[float] = Field(default=None, description="Face emotion confidence score (0.0 - 1.0).")
    face_image: Optional[str] = Field(default=None, description="Base64 or DataURL image for server-side FER prediction.")
    voice_emotion: Optional[str] = Field(default=None, description="Client-detected voice emotion label.")
    voice_confidence: Optional[float] = Field(default=None, description="Voice emotion confidence score (0.0 - 1.0).")
    voice_features: Optional[List[float]] = Field(default=None, description="40-MFCC feature vector.")
    voice_audio: Optional[str] = Field(default=None, description="Base64 or DataURL audio (WebM, Opus, WAV) for server-side SER & STT.")
    stress_level: Optional[float] = Field(default=None, description="Client stress index (0.0 - 1.0).")
    language: Optional[str] = Field(default="en", description="Target language ('en', 'si', or 'ta').")
    session_id: Optional[str] = Field(default=None, description="Session tracking identifier.")


class ModalityDetail(BaseModel):
    emotion: str
    confidence: float


class ModalitiesSummary(BaseModel):
    face: Optional[ModalityDetail] = None
    voice: Optional[ModalityDetail] = None


class MultimodalChatResponse(BaseModel):
    """Canonical Structured Response Schema for POST /api/v1/therapy/multimodal-chat."""
    status: str
    message: Optional[str] = None
    transcription: Optional[str] = ""
    transcription_status: Optional[str] = "not_requested"
    transcriptionStatus: Optional[str] = "not_requested"
    detected_emotion: str
    emotion_confidence: float
    stress_level: float
    stress_label: str
    ai_response: str
    language: Optional[str] = "en"
    suggested_action: Optional[str] = "none"
    timestamp: str
    modalities: ModalitiesSummary


# ─────────────────────────────────────────────────────────────────────────────
# 8. Canonical REST Endpoint (POST /api/v1/therapy/multimodal-chat)
# ─────────────────────────────────────────────────────────────────────────────

@app.post(
    "/api/v1/therapy/multimodal-chat",
    response_model=MultimodalChatResponse,
    summary="Multimodal Emotion-Aware Therapy Chat",
    tags=["Therapy"]
)
async def canonical_multimodal_chat_endpoint(
    request: MultimodalChatRequest = Body(...)
) -> Dict[str, Any]:
    """Canonical production REST endpoint delegating to the unified multimodal therapy pipeline."""
    return await process_multimodal_therapy(request.model_dump())


# ─────────────────────────────────────────────────────────────────────────────
# 9. Legacy Compatibility Adapters (Deprecated but 100% Functional)
# ─────────────────────────────────────────────────────────────────────────────

@app.post(
    "/api/v1/therapy/chat",
    summary="Legacy Therapy Chat Adapter (Deprecated)",
    tags=["Legacy Adapters"],
    deprecated=True
)
async def legacy_therapy_chat_adapter(
    payload: Optional[Dict[str, Any]] = Body(default=None)
) -> Dict[str, Any]:
    """Compatibility Adapter: Translates legacy /therapy/chat requests to process_multimodal_therapy()."""
    return await process_multimodal_therapy(payload or {})


@app.post(
    "/api/v1/processMultimodalTurn",
    summary="Legacy Multimodal Turn Adapter (Deprecated)",
    tags=["Legacy Adapters"],
    deprecated=True
)
async def legacy_process_multimodal_turn_adapter(
    payload: Optional[Dict[str, Any]] = Body(default=None)
) -> Dict[str, Any]:
    """Compatibility Adapter: Translates legacy /processMultimodalTurn requests to process_multimodal_therapy()."""
    return await process_multimodal_therapy(payload or {})


# ─────────────────────────────────────────────────────────────────────────────
# 10. Canonical WebSocket Streaming Endpoint (/ws/therapy & /ws/stream alias)
# ─────────────────────────────────────────────────────────────────────────────

@app.websocket("/ws/therapy")
async def canonical_websocket_stream_endpoint(websocket: WebSocket) -> None:
    """Canonical WebSocket endpoint delegating incoming packets to process_multimodal_therapy()."""
    await websocket.accept()
    client_host = websocket.client.host if websocket.client else "unknown"
    print(f"[WebSocket Connected] Client connected from: {client_host}", flush=True)

    try:
        while True:
            raw_text = await websocket.receive_text()

            try:
                payload: Dict[str, Any] = json.loads(raw_text)
            except (json.JSONDecodeError, ValueError) as json_err:
                print(f"[WebSocket Warning] Invalid JSON: {json_err}", flush=True)
                await websocket.send_json({"type": "error", "message": "Invalid JSON payload."})
                continue

            if payload.get("type") == "PING":
                await websocket.send_json({"type": "PONG"})
                continue

            data_envelope = payload.get("payload", payload)

            # Ensure language is propagated if present at top-level
            if "language" not in data_envelope and "language" in payload:
                data_envelope["language"] = payload["language"]

            try:
                # Delegate directly to the canonical pipeline
                unified_result = await process_multimodal_therapy(data_envelope)

                response_payload = {
                    "type": "AI_REPLY",
                    "messageId": f"msg-{int(datetime.now(timezone.utc).timestamp() * 1000)}",
                    "message": unified_result["ai_response"],
                    "replyText": unified_result["ai_response"],
                    "transcription": unified_result.get("transcription", ""),
                    "transcription_status": unified_result.get("transcription_status", "not_requested"),
                    "transcriptionStatus": unified_result.get("transcription_status", "not_requested"),
                    "language": unified_result["language"],
                    "suggested_action": unified_result["suggested_action"],
                    "suggestedAction": unified_result["suggested_action"],
                    "detected_emotion": unified_result["detected_emotion"],
                    "emotion_confidence": unified_result["emotion_confidence"],
                    "stress_level": unified_result["stress_level"],
                    "stress_label": unified_result["stress_label"],
                    "stressSnapshot": {
                        "score": unified_result["stress"]["score"],
                        "level": unified_result["stress"]["level"],
                    },
                    "detectedEmotions": unified_result["emotions"]["distribution"],
                    "modalities": unified_result["modalities"],
                    "timestamp": unified_result["timestamp"],
                }
                await websocket.send_json(response_payload)
            except Exception as pipe_err:
                print(f"[WebSocket Error] Error processing multimodal turn: {pipe_err}", flush=True)
                traceback.print_exc()
                await websocket.send_json({
                    "type": "AI_REPLY",
                    "messageId": f"msg-err-{int(datetime.now(timezone.utc).timestamp() * 1000)}",
                    "message": "I'm right here with you. Could you share that with me again?",
                    "replyText": "I'm right here with you. Could you share that with me again?",
                    "transcription": "",
                    "transcription_status": "failed",
                    "transcriptionStatus": "failed",
                    "language": "en",
                    "suggested_action": "none",
                    "detected_emotion": "neutral",
                    "emotion_confidence": 0.70,
                    "stress_level": 0.35,
                    "stress_label": "low",
                    "stressSnapshot": {"score": 35.0, "level": "low"},
                    "detectedEmotions": {"neutral": 70.0},
                    "modalities": {"face": None, "voice": None},
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                })

    except WebSocketDisconnect:
        print(f"[WebSocket Disconnected] Client disconnected: {client_host}", flush=True)
    except Exception as exc:
        print(f"[WebSocket Error] Fatal exception in WebSocket connection loop: {exc}", flush=True)
        traceback.print_exc()


@app.websocket("/ws/stream")
async def websocket_stream_alias_endpoint(websocket: WebSocket) -> None:
    """Alias for /ws/therapy to guarantee backward-compatibility."""
    await canonical_websocket_stream_endpoint(websocket)


# ─────────────────────────────────────────────────────────────────────────────
# 11. Health Check Endpoints
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/", response_model=HealthStatusResponse, tags=["Status"])
async def root_health_check() -> Dict[str, str]:
    """Root health and service status endpoint."""
    return {
        "status": "online",
        "service": "MindCare Multimodal Therapy API",
        "version": "0.5.1",
        "message": "Unified Multimodal Backend is running successfully with PyAV WebM decoding.",
    }


@app.get("/api/v1/health", tags=["Status"])
async def api_health_check() -> Dict[str, Any]:
    """API v1 Health check endpoint reporting model status."""
    return {
        "status": "online",
        "version": "0.5.1",
        "multimodalSupported": True,
        "sttSupported": True,
        "webmSupported": True,
        "models": {
            "face": face_model is not None,
            "voice": voice_model is not None,
            "health": health_model is not None,
        },
    }


# ─────────────────────────────────────────────────────────────────────────────
# 12. Text-to-Speech (TTS) Neural Voice Endpoint (edge-tts)
# ─────────────────────────────────────────────────────────────────────────────

EDGE_TTS_VOICE_MAP: Dict[str, str] = {
    "si": "si-LK-ThiliniNeural",
    "ta": "ta-LK-SaranyaNeural",
    "en": "en-US-AriaNeural",
}


@app.get(
    "/api/v1/tts",
    summary="Text-to-Speech Neural Audio Stream",
    tags=["TTS"]
)
async def text_to_speech_endpoint(
    text: str = Query(..., description="Text content to synthesize into speech."),
    lang: str = Query("si", description="Language code ('si', 'ta', or 'en')."),
) -> Response:
    """Server-side TTS endpoint powered by Microsoft Neural Voices via edge-tts."""
    if not text or not text.strip():
        raise HTTPException(status_code=400, detail="Text parameter cannot be empty.")

    cleaned_text = text.strip()
    target_lang = lang.lower().strip()
    if target_lang.startswith("si"):
        voice = EDGE_TTS_VOICE_MAP["si"]
    elif target_lang.startswith("ta"):
        voice = EDGE_TTS_VOICE_MAP["ta"]
    else:
        voice = EDGE_TTS_VOICE_MAP["en"]

    try:
        communicate = edge_tts.Communicate(cleaned_text, voice)
        audio_data = bytearray()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_data.extend(chunk["data"])

        if not audio_data:
            raise ValueError("No audio data returned from Edge TTS stream.")

        return Response(
            content=bytes(audio_data),
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "inline; filename=tts.mp3",
                "Cache-Control": "public, max-age=3600",
            },
        )
    except Exception as tts_err:
        print(f"[TTS Error] Edge TTS synthesis failed: {tts_err}", flush=True)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"TTS synthesis error: {str(tts_err)}")

