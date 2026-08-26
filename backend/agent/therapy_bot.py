"""MindCare - AI Therapy Bot Module.

CBT-informed, trilingual (English, Sinhala, & Tamil), multimodal emotion-aware digital
therapy assistant powered by Google Gemini 1.5. Emphasizes warm empathy-first validation,
psychological safety, non-clinical wellness support, and user agency.
"""

from enum import Enum
import json
import os
import re
import warnings
from typing import Any, Dict, Optional

# Suppress deprecation notice from google.generativeai package
warnings.filterwarnings("ignore", category=FutureWarning)

import google.generativeai as genai


class ConversationStage(str, Enum):
    """Conversational progression stages for empathetic, non-scripted therapy interaction."""
    EARLY_LISTENING = "EARLY_LISTENING"   # Prioritize validation, warmth, listening; NO premature exercises
    EXPLORATION = "EXPLORATION"           # Gentle inquiry into thoughts, feelings, context
    SUPPORT = "SUPPORT"                   # Offering supportive choices (talk more vs try something small)
    COPING = "COPING"                     # Optional, gentle somatic/cognitive exercises (user-requested/ready)
    CRISIS = "CRISIS"                     # Immediate compassionate 1926 escalation for self-harm/crisis


SYSTEM_INSTRUCTION = """You are MindCare, an empathetic, warm, attentive, non-judgmental, CBT-informed mental wellbeing companion and digital therapy assistant.
Your mission is to provide emotional validation, reflective listening, cognitive reframing, and gentle somatic grounding when appropriate.

=============================================================================
CORE CONVERSATIONAL GUIDELINES:
=============================================================================

1. EMPATHY-FIRST & EARLY LISTENING (CRITICAL):
   - When a user expresses high stress, fatigue, exhaustion, burnout, feeling overwhelmed, heaviness, frustration, or sadness:
     * NEVER immediately prescribe exercises (do NOT say "Take a deep breath", "Try deep breathing", "Close your eyes", "Do this relaxation technique now").
     * ALWAYS prioritize:
       1. Emotional validation ("That sounds like it's been a really heavy day", "It makes total sense you're feeling exhausted after carrying so much").
       2. Presence & Warmth ("You don't have to figure everything out right now", "I'm right here with you").
       3. Open invitation to share ("If you'd like, tell me what's been weighing on you most").
   - Make the user feel "Someone is truly listening to me" before "A system is assigning me an exercise".

2. USER AGENCY & NATURAL TRANSITION TO COPING:
   - Do NOT force exercises onto the user.
   - Suggest breathing or grounding ONLY when:
     * The user explicitly requests help/exercises (e.g. "Can you give me a breathing exercise?", "How can I calm down?", "What can I do?").
     * OR the user has had space to express themselves and indicates readiness to try a soothing practice.
   - Always frame exercises as an optional invitation:
     * "If you'd like, we could try a gentle 4-second box breathing exercise together. Or we can keep talking through what happened — whatever feels best for you."

3. NON-CLINICAL SAFETY & MULTIMODAL CONTEXT:
   - You are a non-clinical wellness companion. NEVER diagnose mental disorders, prescribe medications, or claim clinical authority.
   - Treat detected facial/vocal emotions and stress scores as subtle contextual clues only.
   - NEVER tell the user "The AI detected that you are sad" or "Your facial expression shows high stress".
   - If modalities conflict (e.g. happy face + sad voice), adopt a cautious, gentle, supportive tone without making definitive claims.
   - If the user expresses self-harm or suicidal intent (e.g. 'suicide', 'kill myself', 'want to die', 'දිවි නසා', 'මැරෙන්න', 'தற்கොலை', 'சாக வேண்டும்'):
     * Adopt a de-escalating, deeply compassionate crisis intervention tone.
     * Reassure them they are not alone.
     * Explicitly provide the Sri Lankan National Mental Health Helpline (1926 - 24/7 Toll-Free) and local resources.
     * Set "suggested_action" to "crisis_hotline".

4. CONVERSATIONAL STAGES & ACTIONS:
   - "suggested_action": "none" -> In EARLY_LISTENING, EXPLORATION, SUPPORT stages, and daily conversations.
   - "suggested_action": "breathing" -> Recommend 4-4-4-4 Box Breathing only when in COPING stage or when user explicitly asks for breathwork.
   - "suggested_action": "grounding" -> Recommend 5-4-3-2-1 Sensory Grounding when acute dissociation, panic, or user requests grounding.
   - "suggested_action": "crisis_hotline" -> In safety/crisis situations.

5. TRILINGUAL SUPPORT (ENGLISH, SINHALA, & TAMIL):
   - English ('en'): Warm, natural, compassionate, 2-4 sentences for early turns.
   - Sinhala ('si'): Authentic, empathetic, culturally resonant Sinhala with accurate spelling and soothing tone (අක්ෂර වින්‍යාසය).
   - Tamil ('ta'): Authentic, empathetic, culturally resonant Tamil with accurate spelling and soothing tone.
   - Set the "language" field in JSON to "en", "si", or "ta".

6. STRICT JSON OUTPUT FORMAT:
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
        self.stt_model: Optional[genai.GenerativeModel] = None

        if self.api_key and self.api_key.strip():
            try:
                genai.configure(api_key=self.api_key.strip())
                candidate_models = ["gemini-3.6-flash", "gemini-flash-latest", "gemini-1.5-flash"]
                configured_model_name = None

                for candidate in candidate_models:
                    try:
                        test_m = genai.GenerativeModel(
                            model_name=candidate,
                            system_instruction=SYSTEM_INSTRUCTION,
                            generation_config=genai.GenerationConfig(
                                response_mime_type="application/json",
                                temperature=0.7,
                            ),
                        )
                        self.model = test_m
                        configured_model_name = candidate
                        break
                    except Exception:
                        continue

                if self.model and configured_model_name:
                    # Dedicated verbatim speech-to-text transcriber without JSON constraint
                    self.stt_model = genai.GenerativeModel(
                        model_name=configured_model_name,
                        system_instruction=(
                            "You are an accurate, verbatim trilingual speech-to-text transcriber for Sinhala, Tamil, and English. "
                            "Listen carefully to the audio. Transcribe the spoken words verbatim in the speaker's language using the proper native script "
                            "(Sinhala Unicode for Sinhala, Tamil Unicode for Tamil, Latin alphabet for English). "
                            "Output ONLY the transcribed words with natural phrasing. Do NOT add translations, notes, explanations, timestamps, quotes, or markdown. "
                            "If the audio contains only silence or background static without human speech, return empty text."
                        ),
                        generation_config=genai.GenerationConfig(
                            temperature=0.0,
                        ),
                    )
                    print(f"[TherapyBot] {configured_model_name} initialized successfully (Therapy & Multimodal STT).")
                else:
                    raise RuntimeError("No compatible Gemini model candidate succeeded.")
            except Exception as e:
                print(f"[TherapyBot Warning] Failed to configure Gemini model: {e}")
                self.model = None
                self.stt_model = None
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

    @staticmethod
    def _determine_conversation_stage(message: str, multimodal_data: Optional[Dict[str, Any]] = None) -> ConversationStage:
        """Determines the appropriate conversational stage based on user intent and telemetry."""
        lower = message.lower().strip()

        # 1. Crisis / Safety intent check
        if any(w in lower for w in [
            "suicide", "kill myself", "end my life", "want to die", "self-harm",
            "දිවි නසා", "මැරෙන්න", "ජීවිතය නැති",
            "தற்கொலை", "சாக வேண்டும்", "உயிரை மாய்க்க", "காயம்"
        ]):
            return ConversationStage.CRISIS

        # 2. Explicit request for coping exercises or calming help
        if any(phrase in lower for phrase in [
            "breathing exercise", "give me a breathing", "can you give me a breathing",
            "teach me a breathing", "help me calm down", "what can i do to feel calmer",
            "what can i do to calm", "give me an exercise", "relaxation exercise",
            "grounding exercise", "how to calm down", "how can i relax",
            "හුස්ම ගැනීමේ අභ්‍යාසයක්", "හුස්ම ගන්න විදිය", "සන්සුන් වෙන්න මොකද කරන්න ඕනේ",
            "මාව සන්සුන් කරන්න", "අභ්‍යාසයක් දෙන්න",
            "மூச்சுப்பயிற்சி", "அமைதியாக என்ன செய்ய வேண்டும்", "பயிற்சி தாருங்கள்",
            "என்னை அமைதிப்படுத்துங்கள்", "மூச்சு பயிற்சி"
        ]):
            return ConversationStage.COPING

        # 3. High stress / fatigue / overwhelm / burnout -> EARLY_LISTENING (empathy-first, no exercises)
        if any(w in lower for w in [
            "exhausted", "tired", "stressed", "stress", "overwhelmed", "overwhelm",
            "can't do this anymore", "cant do this anymore", "burnout", "burnt out",
            "difficult day", "heavy day", "rough day", "drained", "frustrated",
            "too much", "heavy", "so much pressure",
            "වෙහෙසයි", "මහන්සියි", "ආතතිය", "පීඩනය", "දරාගන්න බැහැ", "අමාරු දවසක්", "බරක්", "නොසන්සුන්",
            "சோர்வு", "மன அழுத்தம்", "தாங்க முடியவில்லை", "கடினமான நாள்", "பாரம்", "கவலை"
        ]):
            return ConversationStage.EARLY_LISTENING

        # 4. Default / General conversation
        return ConversationStage.EXPLORATION

    async def generate_response(
        self,
        message: str,
        language: str = "en",
        multimodal_data: Optional[Dict[str, Any]] = None,
        chat_history: Optional[list] = None,
    ) -> Dict[str, Any]:
        """Generate an empathetic therapeutic response based on multimodal context and conversational stage.

        Args:
            message: User input message string.
            language: Target language ('en', 'si', or 'ta').
            multimodal_data: Optional dictionary containing biometric/behavioral signals.
            chat_history: Optional list of previous conversation turns for context memory.

        Returns:
            Dictionary containing reply text, language, and suggested intervention action.
        """
        effective_language = self._detect_language(message, fallback_language=language)
        stage = self._determine_conversation_stage(message, multimodal_data)

        print(f"[THERAPY] Conversation stage: {stage.value}", flush=True)
        if stage == ConversationStage.EARLY_LISTENING:
            print("[THERAPY] High-stress turn handling: empathy-first validation", flush=True)

        # 1. Try LLM Generation via Google Gemini
        if self.model is not None:
            try:
                prompt_parts = []
                if multimodal_data:
                    prompt_parts.append(f"Current Multimodal Telemetry Context: {json.dumps(multimodal_data)}")
                
                # Append conversational memory if available
                if chat_history and len(chat_history) > 0:
                    history_lines = []
                    for turn in chat_history[-6:]:
                        sender = str(turn.get("sender") or turn.get("role") or "user").capitalize()
                        content = str(turn.get("content") or turn.get("text") or turn.get("message") or "").strip()
                        if content:
                            history_lines.append(f"{sender}: {content}")
                    if history_lines:
                        prompt_parts.append("Recent Conversation History (Avoid repeating phrases from previous assistant replies):\n" + "\n".join(history_lines))

                prompt_parts.append(f"Conversation Stage: {stage.value}")
                prompt_parts.append(f"Target Language: {effective_language}")
                if message and message.strip():
                    prompt_parts.append(f"User Spoken/Typed Message: {message.strip()}")
                else:
                    prompt_parts.append("User Message: [Voice audio received but spoken words were acoustically unclear. Acknowledge their presence warmly, gently let them know the audio was a bit unclear, and invite them to speak again or write a few words.]")

                prompt_parts.append("Instruction: Provide an empathetic, non-repetitive, context-aware response in the requested language matching the stage.")

                combined_prompt = "\n".join(prompt_parts)

                response = await self.model.generate_content_async(combined_prompt)

                if response and response.text:
                    parsed: Dict[str, Any] = json.loads(response.text.strip())
                    return {
                        "reply": parsed.get("reply", "I hear you, and I am here with you."),
                        "language": parsed.get("language", effective_language),
                        "suggested_action": parsed.get("suggested_action", "none" if stage != ConversationStage.COPING else "breathing"),
                        "stage": stage.value,
                    }
            except Exception as err:
                print(f"[TherapyBot Error] Gemini generation failed: {err}. Falling back to resilient local response.")

        # 2. Resilient Rule-Based Fallback (when API key is unset or offline)
        fallback_res = self._generate_fallback_response(message, effective_language, stage, multimodal_data, chat_history)
        fallback_res["stage"] = stage.value
        return fallback_res

    def _generate_fallback_response(
        self,
        message: str,
        language: str,
        stage: ConversationStage,
        multimodal_data: Optional[Dict[str, Any]] = None,
        chat_history: Optional[list] = None,
    ) -> Dict[str, Any]:
        """Provide a compassionate, stage-aware, rule-based fallback response in English, Sinhala, or Tamil."""
        is_si = language == "si"
        is_ta = language == "ta"
        turn_count = len(chat_history) if chat_history else 0

        # 1. CRISIS STAGE: Immediate de-escalation & 1926 Helpline
        if stage == ConversationStage.CRISIS:
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

        # 2. COPING STAGE: User explicitly requested an exercise or calming help
        if stage == ConversationStage.COPING:
            si_coping = [
                "නිසැකවම, අපි එක්ව සරල අභ්‍යාසයක් කරමු. ඔබ කැමති නම්, සෙමින් 4-4-4-4 හුස්ම ගැනීමේ ව්‍යායාමයකින් පටන් ගනිමු. උරහිස් සැහැල්ලු කර ගැඹුරු හුස්මක් ඉහළට ගන්න.",
                "අපි එකට සන්සුන් වෙන්න පුංචි පියවරක් තබමු. තත්පර 4ක් හුස්ම ඉහළට ගෙන, මදක් රඳවාගෙන, සෙමින් පහතට මුදාහරින්න.",
            ]
            ta_coping = [
                "நிச்சயமாக, நாம் இணைந்து ஒரு எளிய பயிற்சியை மேற்கொள்வோம். நீங்கள் தயாராக இருந்தால், நாம் மெதுவாக 4-4-4-4 மூச்சுப்பயிற்சியை தொடங்கலாம்.",
                "நாம் அமைதியடைய ஒரு எளிய முயற்சியை செய்வோம். தோள்களை தளர்த்தி மெதுவாக ஆழமான மூச்சை உள்ளிழுத்து வெளிவிடுங்கள்.",
            ]
            en_coping = [
                "Of course. Let's try something small and gentle together. If you're comfortable, we can do a short 4-4-4 Box Breathing exercise.",
                "Let's take a calm pause together. Gently breathe in for 4 seconds, hold gently, and slowly release the tension.",
            ]
            reply = ta_coping[turn_count % len(ta_coping)] if is_ta else (si_coping[turn_count % len(si_coping)] if is_si else en_coping[turn_count % len(en_coping)])
            return {
                "reply": reply,
                "language": "ta" if is_ta else ("si" if is_si else "en"),
                "suggested_action": "breathing",
            }

        # 3. EARLY LISTENING STAGE: High stress, fatigue, exhaustion, overwhelm
        if stage == ConversationStage.EARLY_LISTENING:
            si_early = [
                "අද දවස ඔබට ඇත්තෙන්ම දැඩි වෙහෙසකර සහ බරක් දැනුණු දවසක් බව පෙනෙනවා. මේ මොහොතේම සියල්ල විසඳන්න හෝ තනිවම ඒ බර උසුලන්න අවශ්‍ය නැහැ. මම ඔබට සවන් දීමට මෙහි සිටිමි — ඔබේ සිතට දැනෙන දේ ගැන තව ටිකක් කතා කිරීමට ඔබ කැමතිද?",
                "ඔබට බොහෝ දේ එකවර දරාගන්න සිදු වී ඇති බව මට තේරෙනවා. හිතේ තියෙන බර ටිකක් සැහැල්ලු කරගන්න මම ඔබට සවන් දෙන්නම්. ඔබට දැනෙන දේ නිදහසේ කියන්න.",
                "ඒ විඩාව සහ පීඩනය ඇත්තෙන්ම හිතට අපහසු බව මම පිළිගන්නවා. ඔබ තනිවම මේවා දරාගත යුතු නැහැ. ඔබේ සිතේ තියෙන ඕනෑම දෙයක් මා සමඟ බෙදාගන්න පුළුවන්.",
            ]
            ta_early = [
                "இன்று உங்களுக்கு மிகவும் கடினமாகவும் சோர்வாகவும் இருந்திருக்கிறது என்பதை உணர முடிகிறது. இந்த தருணத்தில் அனைத்தையும் உடனே சரிசெய்ய வேண்டும் என்ற கட்டாயமில்லை. நான் உங்களுக்கு செவிசாய்க்க இங்கு இருக்கிறேன்.",
                "நீங்கள் அதிக அழுத்தத்தை உணர்கிறீர்கள் என்பது புரிகிறது. உங்கள் மனப்பாரத்தை குறைக்க நான் எப்போதும் கேட்க தயாராக உள்ளேன்.",
                "இந்த சோர்வு இயல்பானது தான். நீங்கள் தனியாக இல்லை, உங்கள் எண்ணங்களை என்னுடன் சுதந்திரமாக பகிர்ந்து கொள்ளுங்கள்.",
            ]
            en_early = [
                "That sounds like it's been a really heavy day, and it makes complete sense that you're feeling exhausted. You don't have to figure everything out right now. I'm right here to listen.",
                "I hear how much pressure and weight you've been carrying. Take all the time you need — I'm right here with you if you'd like to talk through it.",
                "It is completely valid to feel overwhelmed after everything you've been handling. I'm here to support you without any pressure. Tell me what's on your mind.",
            ]
            reply = ta_early[turn_count % len(ta_early)] if is_ta else (si_early[turn_count % len(si_early)] if is_si else en_early[turn_count % len(en_early)])
            return {
                "reply": reply,
                "language": "ta" if is_ta else ("si" if is_si else "en"),
                "suggested_action": "none",
            }

        # 4. EXPLORATION / GENERAL CONVERSATION STAGE
        si_explore = [
            "ඔබේ සිතුවිලි මා සමඟ බෙදාගැනීම ගැන ස්තූතියි. මම ඔබට සවන් දීමට මෙහි සිටිමි. අද දවසේ ඔබේ සිතට දැනෙන ප්‍රධානතම දෙය කුමක්ද?",
            "ඔබ පවසන දේ මට හොඳින් වැටහෙනවා. මේ ගැන තවදුරටත් කතා කිරීමට හෝ වෙනත් දෙයක් බෙදාගැනීමට ඔබ කැමතිද?",
            "මම ඔබ සමඟ රැඳී සිටිමි. ඔබේ සිතේ ඇති ඕනෑම අදහසක් හෝ හැඟීමක් මා සමඟ විවෘතව සාකච්ඡා කරන්න.",
        ]
        ta_explore = [
            "உங்கள் எண்ணங்களை என்னுடன் பகிர்ந்ததற்கு நன்றி. நான் உங்களுக்கு செவிசாய்க்க இங்கு உள்ளேன். இன்று உங்கள் மனதில் உள்ள முக்கிய விடயம் என்ன?",
            "நீங்கள் சொல்வதை நான் கவனமாக கேட்கிறேன். இதைப்பற்றி மேலும் பேச விரும்புகிறீர்களா?",
            "நான் உங்களுடன் இருக்கிறேன். உங்கள் மனதில் தோன்றும் எதையும் என்னுடன் தாராளமாக பேசுங்கள்.",
        ]
        en_explore = [
            "Thank you for sharing that with me. I'm here to listen and explore whatever is on your mind today. How are you feeling in this present moment?",
            "I hear what you're saying. If you'd like to delve a bit deeper into that, I'm here to explore it with you.",
            "I'm right here with you. What feels like the most important thing you'd like to share or unpack right now?",
        ]
        reply = ta_explore[turn_count % len(ta_explore)] if is_ta else (si_explore[turn_count % len(si_explore)] if is_si else en_explore[turn_count % len(en_explore)])

        return {
            "reply": reply,
            "language": "ta" if is_ta else ("si" if is_si else "en"),
            "suggested_action": "none",
        }
