"""MindCare - AI Therapy Bot Module.

CBT-informed, trilingual (English, Sinhala, & Tamil), multimodal emotion-aware digital
therapy assistant powered by Google Gemini 1.5.
"""

import json
import os
import re
import warnings
from typing import Any, Dict, Optional

# Suppress deprecation notice from google.generativeai package
warnings.filterwarnings("ignore", category=FutureWarning)

import google.generativeai as genai


SYSTEM_INSTRUCTION = """You are MindCare, an empathetic, warm, non-judgmental, CBT-informed mental wellbeing companion and digital therapy assistant.
Your mission is to provide emotional validation, reflective listening, cognitive reframing support, and somatic grounding interventions.

Core Guidelines:
1. EMPATHY & CBT PRINCIPLES:
   - Always validate the user's emotional experience first before offering perspectives or coping strategies.
   - Never judge, minimize, or dismiss the user's feelings.
   - Keep responses compassionate, warm, concise, and easy to digest during emotional distress.

2. TRILINGUAL SUPPORT (ENGLISH, SINHALA, & TAMIL):
   - If the user communicates in English, respond in English ('en').
   - If the user communicates in Sinhala Unicode script (e.g. 'මට දුකයි', 'ආතතියක් දැනෙනවා') or Singlish phonetics, respond in authentic, soothing, culturally resonant Sinhala ('si') with accurate spelling and grammar (අක්ෂර වින්‍යාසය).
   - If the user communicates in Tamil Unicode script (e.g. 'எனக்கு கவலையாக உள்ளது', 'மன அழுத்தம்') or Tanglish phonetics, respond in authentic, soothing, culturally appropriate Tamil ('ta') with accurate spelling and grammar.
   - Set the "language" field in JSON to "en", "si", or "ta".

3. SAFETY & CRISIS PROTOCOL:
   - If the user expresses self-harm, suicidal ideation (e.g. 'suicide', 'kill myself', 'want to die', 'දිවි නසා', 'මැරෙන්න', 'தற்கொலை', 'சாக வேண்டும்'), extreme panic, or severe crisis:
     * Immediately adopt a compassionate, de-escalating crisis-intervention tone in the user's language.
     * Reassure them they are not alone and that immediate confidential support is available.
     * Explicitly provide the Sri Lankan National Mental Health Helpline (1926 - 24/7 Toll-Free) and mention global crisis resources.
     * Set "suggested_action" to "crisis_hotline".

4. SOMATIC & THERAPEUTIC ACTIONS:
   - "suggested_action": "breathing" -> Recommend 4-4-4-4 Box Breathing when moderate stress, physical tension, racing thoughts, or general anxiety is present.
   - "suggested_action": "grounding" -> Recommend 5-4-3-2-1 sensory grounding when acute anxiety, dissociation, sensory overload, or panic is detected.
   - "suggested_action": "crisis_hotline" -> In safety/crisis situations.
   - "suggested_action": "none" -> In normal conversational turns, daily check-ins, or gratitude reflections.

5. STRICT OUTPUT FORMAT:
   You MUST return a strictly formatted JSON object with this exact schema:
   {
     "reply": "Empathetic conversational response text",
     "language": "en" | "si" | "ta",
     "suggested_action": "none" | "breathing" | "grounding" | "crisis_hotline"
   }
"""


class TherapyBot:
    """Trilingual, CBT-informed digital therapy assistant using Google Gemini 1.5."""

    def __init__(self, api_key: Optional[str] = None) -> None:
        """Initialize the therapy agent with Google Gemini API configuration.

        Args:
            api_key: Google Gemini API key. Defaults to GEMINI_API_KEY environment variable.
        """
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.model: Optional[genai.GenerativeModel] = None

        if self.api_key and self.api_key.strip():
            try:
                genai.configure(api_key=self.api_key.strip())
                self.model = genai.GenerativeModel(
                    model_name="gemini-1.5-flash",
                    system_instruction=SYSTEM_INSTRUCTION,
                    generation_config=genai.GenerationConfig(
                        response_mime_type="application/json",
                        temperature=0.7,
                    ),
                )
                print("[TherapyBot] Gemini 1.5 Flash initialized successfully with structured JSON output.")
            except Exception as e:
                print(f"[TherapyBot Warning] Failed to configure Gemini model: {e}")
                self.model = None
        else:
            print("[TherapyBot Notice] No GEMINI_API_KEY detected. Running in resilient local fallback mode.")

    @staticmethod
    def _detect_language(text: str, fallback_language: str = "en") -> str:
        """Detect language script (Sinhala, Tamil, or English)."""
        if re.search(r"[\u0D80-\u0DFF]", text):
            return "si"
        if re.search(r"[\u0B80-\u0BFF]", text):
            return "ta"
        if fallback_language in ("si", "ta"):
            return fallback_language
        return "en"

    async def generate_response(
        self,
        message: str,
        language: str = "en",
        multimodal_data: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Generate an empathetic therapeutic response based on multimodal context.

        Args:
            message: User input message string.
            language: Target language ('en', 'si', or 'ta').
            multimodal_data: Optional dictionary containing biometric/behavioral signals.

        Returns:
            Dictionary containing reply text, language, and suggested intervention action.
        """
        # Determine language preference
        effective_language = self._detect_language(message, fallback_language=language)

        # 1. Try LLM Generation via Google Gemini
        if self.model is not None:
            try:
                # Construct contextual prompt with multimodal telemetry
                prompt_parts = []
                if multimodal_data:
                    prompt_parts.append(f"Current Multimodal Telemetry Context: {json.dumps(multimodal_data)}")
                prompt_parts.append(f"Language: {effective_language}")
                prompt_parts.append(f"User Message: {message}")

                combined_prompt = "\n".join(prompt_parts)

                response = await self.model.generate_content_async(combined_prompt)

                if response and response.text:
                    parsed: Dict[str, Any] = json.loads(response.text.strip())
                    return {
                        "reply": parsed.get("reply", "I hear you, and I am here with you."),
                        "language": parsed.get("language", effective_language),
                        "suggested_action": parsed.get("suggested_action", "none"),
                    }
            except Exception as err:
                print(f"[TherapyBot Error] Gemini generation failed: {err}. Falling back to resilient local response.")

        # 2. Resilient Rule-Based Fallback (when API key is unset or network error occurs)
        return self._generate_fallback_response(message, effective_language, multimodal_data)

    def _generate_fallback_response(
        self,
        message: str,
        language: str,
        multimodal_data: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Provide a compassionate, rule-based fallback response in English, Sinhala, or Tamil."""
        lower = message.lower()
        is_si = language == "si"
        is_ta = language == "ta"

        # Crisis detection
        if any(w in lower for w in [
            "suicide", "kill myself", "end my life", "want to die", "self-harm",
            "දිවි නසා", "මැරෙන්න", "ජීවිතය නැති",
            "தற்கொலை", "சாக வேண்டும்", "உயிரை மாய்க்க", "காயம்"
        ]):
            if is_ta:
                reply = (
                    "உங்கள் பாதுகாப்பும் மனநலமும் எங்களுக்கு மிகவும் முக்கியமானது. தயவுசெய்து நினைவில் கொள்ளுங்கள், நீங்கள் தனியாக இல்லை. "
                    "உடனடி, இலவச மற்றும் ரகசிய உதவிக்கு இலங்கை தேசிய மனநல உதவி எண் (1926) அல்லது அவசர சேவைகளை தொடர்பு கொள்ளுங்கள்."
                )
            elif is_si:
                reply = (
                    "ඔබේ ආරක්ෂාව සහ මානසික සුවතාවය අපට ඉතාම වැදගත්. කරුණාකර මතක තබාගන්න, ඔබ තනිවී නැත. "
                    "ක්ෂණික, නොමිලේ සහ රහස්‍ය උපකාර සඳහා ශ්‍රී ලංකා ජාතික මානසික සුවතා දුරකථන අංකය (1926) හෝ හදිසි අංක අමතන්න."
                )
            else:
                reply = (
                    "Your safety and wellbeing are what matter most. Please remember that you don't have to navigate this alone. "
                    "Support is available right now. Please reach out to the National Mental Health Helpline (1926) or your local emergency services."
                )
            return {
                "reply": reply,
                "language": "ta" if is_ta else ("si" if is_si else "en"),
                "suggested_action": "crisis_hotline",
            }

        # Panic & Acute Anxiety -> Grounding
        if any(w in lower for w in [
            "panic", "terrified", "cannot breathe", "losing control", "grounding",
            "බයයි", "හුස්ම ගන්න අමාරුයි", "පාලනයක් නැහැ", "දැන්ම සන්සුන්",
            "பயமாயிருக்கு", "மூச்சுவிட முடியவில்லை", "பதட்டம்"
        ]):
            if is_ta:
                reply = (
                    "மனதில் அதிக பாரம் இருப்பது தெரிகிறது. நாம் இணைந்து மெதுவாக ஒரு ஆழமான மூச்சை எடுப்போம். "
                    "உங்களை நிகழ்கணத்திற்கு நிலைப்படுத்த எளிய 5-4-3-2-1 புலன் உணர்வு நிலைப்படுத்தும் பயிற்சியை செய்யலாமா?"
                )
            elif is_si:
                reply = (
                    "දේවල් දරාගැනීමට අපහසු තරම් බරක් දැනෙන බව පෙනේ. අපි එක්ව සෙමින් ගැඹුරු හුස්මක් ගනිමු. "
                    "ඔබ වර්තමාන මොහොතට නැංගුරම් ලෑම සඳහා කෙටි 5-4-3-2-1 ඉන්ද්‍රිය මුල්බැසීමේ අභ්‍යාසයක් කරමුද?"
                )
            else:
                reply = (
                    "Things feel very heavy and intense right now. Take a gentle breath. You are safe here. "
                    "Let's try the 5-4-3-2-1 sensory grounding exercise together to help bring you back to the present moment."
                )
            return {
                "reply": reply,
                "language": "ta" if is_ta else ("si" if is_si else "en"),
                "suggested_action": "grounding",
            }

        # Moderate Stress & Tension -> Box Breathing
        if any(w in lower for w in [
            "stress", "anxious", "overwhelm", "exhausted", "breath", "tension",
            "නොසන්සුන්", "ආතතිය", "පීඩනය", "වෙහෙසයි", "හුස්ම",
            "மன அழுத்தம்", "சோர்வு", "கவலை", "மூச்சு"
        ]):
            if is_ta:
                reply = (
                    "நீங்கள் பகிர்ந்ததில் சற்று மன அழுத்தம் தெரிகிறது. "
                    "உடலையும் மனதையும் அமைதிப்படுத்த எளிய 4-4-4-4 மூச்சுப்பயிற்சியை தொடங்கலாமா?"
                )
            elif is_si:
                reply = (
                    "ඔබ පැවසූ දෙයෙහි යම් ආතතියක් හෝ නොසන්සුන් බවක් දැනෙනවා. "
                    "සිත සහ ශරීරය සන්සුන් කරගැනීමට සරල 4-4-4-4 හුස්ම ගැනීමේ ව්‍යායාමයක් ආරම්භ කරමුද?"
                )
            else:
                reply = (
                    "I hear the tension you're carrying. Slowing down our breathing can gently help your nervous system regulate. "
                    "Would you like to try a short 4-4-4 Box Breathing exercise with me?"
                )
            return {
                "reply": reply,
                "language": "ta" if is_ta else ("si" if is_si else "en"),
                "suggested_action": "breathing",
            }

        # Default conversational response
        if is_ta:
            reply = (
                "உங்கள் எண்ணங்களை என்னுடன் பகிர்ந்ததற்கு நன்றி. நான் உங்களுக்கு செவிசாய்க்க இங்கு உள்ளேன். "
                "இன்று உங்கள் மனதில் உள்ள முக்கிய விடயம் என்ன?"
            )
        elif is_si:
            reply = (
                "ඔබේ සිතුවිලි මා සමඟ බෙදාගැනීම ගැන ස්තූතියි. මම ඔබට සවන් දීමට මෙහි සිටිමි. "
                "අද දවසේ ඔබේ සිතට දැනෙන ප්‍රධානතම දෙය කුමක්ද?"
            )
        else:
            reply = (
                "Thank you for sharing that with me. I'm here to listen and explore whatever is on your mind today. "
                "How are you feeling in this present moment?"
            )

        return {
            "reply": reply,
            "language": "ta" if is_ta else ("si" if is_si else "en"),
            "suggested_action": "none",
        }
