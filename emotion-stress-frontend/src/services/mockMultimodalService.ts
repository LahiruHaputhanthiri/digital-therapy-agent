import {
  EmotionProbability,
  MultimodalPayload,
  SafetyRiskAssessment,
  StressEstimate,
} from '@/types';
import { getStressLevelFromScore } from '@/lib/constants';
import { useStressStore } from '@/store/useStressStore';

export interface MockInferenceResult {
  reply: string;
  stress: StressEstimate;
  emotions: EmotionProbability;
  safety: SafetyRiskAssessment;
  isSimulatedDemo: true;
}

/**
 * Dedicated Mock / Development Multimodal Service with Trilingual Empathy Engine
 * Provides research prototype simulation in English, Sinhala, and Tamil.
 */
export const MockMultimodalService = {
  /**
   * Process a multimodal turn in simulated demo mode
   */
  async processTurn(payload: MultimodalPayload): Promise<MockInferenceResult> {
    // Simulate network and ML inference latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    const language = useStressStore.getState().language;
    const isSinhala =
      language === 'si' ||
      /[\u0D80-\u0DFF]/.test(payload.text || '');
    const isTamil =
      language === 'ta' ||
      /[\u0B80-\u0BFF]/.test(payload.text || '');

    const text = (payload.text || '').toLowerCase();
    let baseScore = 32;
    let fear_anxiety = 12;
    let sadness = 12;
    let joy = 24;
    let anger = 6;
    let neutral = 46;

    // Safety Risk Assessment (Separated from Stress)
    let isSafetyTriggered = false;
    let safetyRiskLevel: SafetyRiskAssessment['riskLevel'] = 'normal';
    let safetyReason: string | undefined;

    // 1. Critical safety risk keyword checks (English, Sinhala, Tamil)
    if (
      text.includes('suicide') ||
      text.includes('kill myself') ||
      text.includes('end my life') ||
      text.includes('want to die') ||
      text.includes('self-harm') ||
      text.includes('දිවි නසා') ||
      text.includes('මැරෙන්න') ||
      text.includes('ජීවිතය නැති') ||
      text.includes('අවසන් කරන්න') ||
      text.includes('තුවාල') ||
      text.includes('தற்கொலை') ||
      text.includes('சாக வேண்டும்') ||
      text.includes('உயிரை மாய்க்க') ||
      text.includes('காயம்')
    ) {
      isSafetyTriggered = true;
      safetyRiskLevel = 'high_safety_risk';
      safetyReason = isTamil
        ? 'அவசர பாதுகாப்பு கவலை கண்டறியப்பட்டது. உடனடி மற்றும் ரகசிய உதவி எண்கள் (1926) தயார்.'
        : isSinhala
        ? 'හදිසි ආරක්ෂණ අවධානයක් හඳුනාගැනිණි. ක්ෂණික සහ රහස්‍ය උපකාරක සේවා සහ දුරකථන අංක සූදානම්.'
        : 'Potential safety concern detected. Offering immediate confidential support and crisis resources.';
      baseScore = 85;
      fear_anxiety = 40;
      sadness = 45;
    } else if (
      text.includes('panic') ||
      text.includes('terrified') ||
      text.includes('cannot breathe') ||
      text.includes('losing control') ||
      text.includes('බයයි') ||
      text.includes('හුස්ම ගන්න අමාරුයි') ||
      text.includes('පාලනයක් නැහැ') ||
      text.includes('දැන්ම සන්සුන්') ||
      text.includes('பயமாயிருக்கு') ||
      text.includes('மூச்சுவிட முடியவில்லை') ||
      text.includes('பதட்டம்')
    ) {
      isSafetyTriggered = true;
      safetyRiskLevel = 'potential_concern';
      safetyReason = isTamil
        ? 'அதிக பதட்டம் கவனிக்கப்பட்டது. மெதுவான மூச்சுப்பயிற்சி மற்றும் உணர்வு நிலைப்படுத்துதல் பரிந்துரைக்கப்படுகிறது.'
        : isSinhala
        ? 'දැඩි නොසන්සුන් බවක් නිරීක්ෂණය විය. සෙමින් හුස්ම ගැනීම සහ ඉන්ද්‍රිය මුල්බැසීමේ අභ්‍යාසය නිර්දේශ කෙරේ.'
        : 'Elevated distress and panic signals observed. Recommending grounding and slow breathing.';
      baseScore = 74;
      fear_anxiety = 38;
      neutral = 15;
    } else if (
      text.includes('anxious') ||
      text.includes('stress') ||
      text.includes('overwhelm') ||
      text.includes('exhausted') ||
      text.includes('නොසන්සුන්') ||
      text.includes('ආතතිය') ||
      text.includes('පීඩනය') ||
      text.includes('වෙහෙසයි') ||
      text.includes('බරයි') ||
      text.includes('மன அழுத்தம்') ||
      text.includes('சோர்வு') ||
      text.includes('கவலை')
    ) {
      baseScore += 24;
      fear_anxiety += 22;
      sadness += 10;
      joy = Math.max(5, joy - 12);
      neutral = Math.max(15, neutral - 15);
    } else if (
      text.includes('happy') ||
      text.includes('calm') ||
      text.includes('peaceful') ||
      text.includes('relaxed') ||
      text.includes('thank') ||
      text.includes('සතුටුයි') ||
      text.includes('සන්සුන්') ||
      text.includes('සැහැල්ලුයි') ||
      text.includes('ස්තූතියි') ||
      text.includes('කෘතඥ') ||
      text.includes('மகிழ்ச்சி') ||
      text.includes('அமைதி') ||
      text.includes('நன்றி')
    ) {
      baseScore = Math.max(15, baseScore - 18);
      joy += 32;
      sadness = Math.max(4, sadness - 8);
      fear_anxiety = Math.max(4, fear_anxiety - 8);
      neutral += 10;
    }

    // 2. Keystroke Dynamics Influences (Behavioral metrics)
    if (payload.modalities.keystroke && payload.keystrokeFeatures) {
      const { backspaceCount, flightTimeMs, pauseCount } = payload.keystrokeFeatures;
      if ((backspaceCount || 0) > 4 || (flightTimeMs || 0) > 200 || (pauseCount || 0) > 2) {
        baseScore += 7;
        fear_anxiety += 5;
      }
    }

    // 3. Audio & Voice Influences
    if (payload.modalities.audio && payload.audioFeatures) {
      if ((payload.audioFeatures.volumeDb || 0) > 70) {
        baseScore += 5;
        anger += 6;
      }
    }

    // Normalization & Level Mapping
    baseScore = Math.max(10, Math.min(95, Math.round(baseScore)));
    const totalWeight = neutral + joy + sadness + fear_anxiety + anger;
    const normNeutral = Math.round((neutral / totalWeight) * 100);
    const normJoy = Math.round((joy / totalWeight) * 100);
    const normSadness = Math.round((sadness / totalWeight) * 100);
    const normFear = Math.round((fear_anxiety / totalWeight) * 100);
    const normAnger = Math.max(0, 100 - (normNeutral + normJoy + normSadness + normFear));

    const calculatedLevel = getStressLevelFromScore(baseScore);

    const activeSignalList = Object.entries(payload.modalities)
      .filter(([_, active]) => active)
      .map(([name]) => name.charAt(0).toUpperCase() + name.slice(1))
      .join(', ');

    // Check for explicit coping/breathing request
    const lowerText = text.toLowerCase();
    const isExplicitCoping =
      lowerText.includes('breathing') ||
      lowerText.includes('breath') ||
      lowerText.includes('calm down') ||
      lowerText.includes('exercise') ||
      lowerText.includes('හුස්ම') ||
      lowerText.includes('සන්සුන්') ||
      lowerText.includes('மூச்சு') ||
      lowerText.includes('பயிற்சி');

    // Generate Contextual Reply (Trilingual)
    let reply = '';
    if (isTamil) {
      if (isSafetyTriggered && safetyRiskLevel === 'high_safety_risk') {
        reply =
          'உங்கள் பாதுகாப்பும் மனநலமும் எங்களுக்கு மிகவும் முக்கியமானது. தயவுசெய்து நினைவில் கொள்ளுங்கள், நீங்கள் தனியாக இல்லை. உடனடியாக உதவக்கூடிய ரகசிய உதவி எண்கள் (1926) திரையில் காட்டப்பட்டுள்ளன.';
      } else if (isExplicitCoping) {
        reply =
          'நிச்சயமாக, நாம் இணைந்து ஒரு எளிய பயிற்சியை மேற்கொள்வோம். நீங்கள் தயாராக இருந்தால், நாம் மெதுவாக 4-4-4-4 மூச்சுப்பயிற்சியை தொடங்கலாம். உங்கள் தோள்களை தளர்த்தி மெதுவாக ஆழமான மூச்சை எடுங்கள்.';
      } else if (calculatedLevel === 'high' || calculatedLevel === 'moderate') {
        reply =
          'இன்று உங்களுக்கு மிகவும் கடினமாகவும் மனதளவில் சோர்வாகவும் இருந்திருக்கிறது என்பதை உணர முடிகிறது. இந்த தருணத்தில் அனைத்தையும் உடனே சரிசெய்ய வேண்டும் என்ற கட்டாயமில்லை. நான் உங்களுக்கு செவிசாய்க்க இங்கு இருக்கிறேன் — உங்கள் மனதில் உள்ளதை என்னுடன் பகிர்ந்துகொள்ள விரும்புகிறீர்களா?';
      } else {
        reply =
          'உங்கள் எண்ணங்களை என்னுடன் பகிர்ந்ததற்கு நன்றி. நான் உங்களுக்கு செவிசாய்க்க இங்கு உள்ளேன். இன்று உங்கள் மனதில் உள்ள முக்கிய விடயம் என்ன?';
      }
    } else if (isSinhala) {
      if (isSafetyTriggered && safetyRiskLevel === 'high_safety_risk') {
        reply =
          'ඔබේ ආරක්ෂාව සහ මානසික සුවතාවය අපට ඉතාම වැදගත්. කරුණාකර මතක තබාගන්න, ඔබ තනිවී නැත. ඔබට මේ මොහොතේම සහය විය හැකි රහස්‍ය උපකාරක දුරකථන අංක සහ සේවාවන් තිරයේ දක්වා ඇත.';
      } else if (isExplicitCoping) {
        reply =
          'නිසැකවම, අපි එක්ව සරල අභ්‍යාසයක් කරමු. ඔබ කැමති නම්, සෙමින් 4-4-4-4 හුස්ම ගැනීමේ ව්‍යායාමයකින් පටන් ගනිමු. උරහිස් සැහැල්ලු කර ගැඹුරු හුස්මක් ඉහළට ගන්න.';
      } else if (calculatedLevel === 'high' || calculatedLevel === 'moderate') {
        reply =
          'අද දවස ඔබට ඇත්තෙන්ම දැඩි වෙහෙසකර සහ බරක් දැනුණු දවසක් බව පෙනෙනවා. මේ මොහොතේම සියල්ල විසඳන්න හෝ තනිවම ඒ බර උසුලන්න අවශ්‍ය නැහැ. මම ඔබට සවන් දීමට මෙහි සිටිමි — ඔබේ සිතට දැනෙන දේ ගැන තව ටිකක් කතා කිරීමට ඔබ කැමතිද?';
      } else {
        reply =
          'ඔබේ සිතුවිලි මා සමඟ බෙදාගැනීම ගැන ස්තූතියි. මම ඔබට සවන් දීමට මෙහි සිටිමි. අද දවසේ ඔබේ සිතට දැනෙන ප්‍රධානතම දෙය කුමක්ද?';
      }
    } else {
      if (isSafetyTriggered && safetyRiskLevel === 'high_safety_risk') {
        reply =
          "Your safety and wellbeing are what matter most. Please remember that you don't have to navigate this alone. I've brought up confidential support hotlines and contacts on your screen.";
      } else if (isExplicitCoping) {
        reply =
          "Of course. Let's try something small and gentle together. If you're comfortable, we can do a short 4-4-4 Box Breathing exercise: breathing in slowly, holding gently, and releasing all that tension.";
      } else if (calculatedLevel === 'high' || calculatedLevel === 'moderate') {
        reply =
          "That sounds like it's been a really heavy day, and it makes complete sense that you're feeling exhausted. You don't have to figure everything out or carry it all right now. I'm right here to listen — if you'd like, tell me a little about what's been weighing on you.";
      } else {
        reply =
          "Thank you for sharing that with me. I'm here to listen and explore whatever is on your mind today. How are you feeling in this present moment?";
      }
    }

    return {
      reply,
      stress: {
        score: baseScore,
        level: calculatedLevel,
        confidence: 0.86,
        trend: baseScore > 50 ? 'increasing' : 'stable',
        lastUpdated: new Date().toISOString(),
        disclaimer: isTamil
          ? `[டெமோ பயன்முறை] செயல்படும் சமிக்ஞைகளிலிருந்து கணக்கிடப்பட்டது: ${activeSignalList}. மருத்துவ நோயறிதல் அல்ல.`
          : isSinhala
          ? `[නිරූපණ මාදිලිය] සක්‍රිය සංඥා මගින් තක්සේරු කරන ලදී: ${activeSignalList}. සායනික රෝග විනිශ්චයක් නොවේ.`
          : `[Demo Mode] Estimated from active signals: ${activeSignalList}. Not a clinical diagnosis.`,
      },
      emotions: {
        neutral: normNeutral,
        joy: normJoy,
        sadness: normSadness,
        fear_anxiety: normFear,
        anger: normAnger,
      },
      safety: {
        isTriggered: isSafetyTriggered,
        riskLevel: safetyRiskLevel,
        triggerReason: safetyReason,
        timestamp: new Date().toISOString(),
        requiresCrisisResources: safetyRiskLevel === 'high_safety_risk',
        userAcknowledged: false,
      },
      isSimulatedDemo: true,
    };
  },
};
