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

    // Generate Contextual Reply (Trilingual)
    let reply = '';
    if (isTamil) {
      if (isSafetyTriggered && safetyRiskLevel === 'high_safety_risk') {
        reply =
          'உங்கள் பாதுகாப்பும் மனநலமும் எங்களுக்கு மிகவும் முக்கியமானது. தயவுசெய்து நினைவில் கொள்ளுங்கள், நீங்கள் தனியாக இல்லை. உடனடியாக உதவக்கூடிய ரகசிய உதவி எண்கள் (1926) திரையில் காட்டப்பட்டுள்ளன.';
      } else if (isSafetyTriggered && safetyRiskLevel === 'potential_concern') {
        reply =
          'மனதில் அதிக பாரம் இருப்பது தெரிகிறது. நாம் இணைந்து மெதுவாக ஒரு ஆழமான மூச்சை எடுப்போம். ஒரு சிறிய 5-4-3-2-1 உணர்வு நிலைப்படுத்துதல் அல்லது எளிய மூச்சுப்பயிற்சியை செய்யலாமா?';
      } else if (calculatedLevel === 'high') {
        reply =
          'இன்று உங்கள் மனதில் அதிக பாரம் இருப்பது எனக்கு புரிகிறது. பதற்றமடைய வேண்டாம், அதிக அழுத்தத்தை ஏற்படுத்தும் விடயத்தை பற்றி பேசலாமா அல்லது மனதை அமைதிப்படுத்தும் சிறிய இடைவேளை எடுக்கலாமா?';
      } else if (calculatedLevel === 'moderate') {
        reply =
          'நீங்கள் பகிர்ந்ததில் சற்று மன அழுத்தம் தெரிகிறது. ஆழமான மூச்சை எடுத்து எண்ணங்களை வரிசைப்படுத்துவது உங்களுக்கு உதவியாக இருக்கும். இப்போது உங்கள் முக்கிய கவனம் என்ன?';
      } else {
        reply =
          'உங்கள் எண்ணங்களை என்னுடன் பகிர்ந்ததற்கு நன்றி. நீங்கள் இப்போது அமைதியான மனநிலையில் இருப்பது தெரிகிறது. இன்று நாம் வேறு எதைப்பற்றி பேசலாம்?';
      }
    } else if (isSinhala) {
      if (isSafetyTriggered && safetyRiskLevel === 'high_safety_risk') {
        reply =
          'ඔබේ ආරක්ෂාව සහ මානසික සුවතාවය අපට ඉතාම වැදගත්. කරුණාකර මතක තබාගන්න, ඔබ තනිවී නැත. ඔබට මේ මොහොතේම සහය විය හැකි රහස්‍ය උපකාරක දුරකථන අංක සහ සේවාවන් තිරයේ දක්වා ඇත.';
      } else if (isSafetyTriggered && safetyRiskLevel === 'potential_concern') {
        reply =
          'දේවල් දරාගැනීමට අපහසු තරම් බරක් දැනෙන බව පෙනේ. අපි එක්ව සෙමින් ගැඹුරු හුස්මක් ගනිමු. කෙටි 5-4-3-2-1 ඉන්ද්‍රිය මුල්බැසීමේ අභ්‍යාසයක් හෝ සන්සුන් හුස්ම ගැනීමේ ක්‍රමයක් අත්හදා බලමුද?';
      } else if (calculatedLevel === 'high') {
        reply =
          'අද දවසේ ඔබේ සිතට විශාල බරක් දැනෙන බව මට වැටහෙනවා. කලබල නොවන්න, ඔබේ සිතට වඩාත්ම බලපාන කරුණ ගැන කතා කරමුද, නැතහොත් සිත සන්සුන් කරගැනීමේ කෙටි විරාමයක් ගනිමුද?';
      } else if (calculatedLevel === 'moderate') {
        reply =
          'ඔබ පැවසූ දෙයෙහි යම් ආතතියක් හෝ නොසන්සුන් බවක් දැනෙනවා. ගැඹුරු හුස්මක් ගෙන සිතුවිලි සෙමින් පෙළගස්වා ගැනීම ඔබට මහත් සහනයක් වේවි. මේ මොහොතේ ඔබේ ප්‍රමුඛතාවය කුමක්ද?';
      } else {
        reply =
          'ඔබේ සිතුවිලි මා සමඟ බෙදාගැනීම ගැන ස්තූතියි. ඔබ මේ වන විට යහපත්, සන්සුන් මනෝභාවයක සිටින බව පෙනේ. අද අප කතා කිරීමට කැමති තවත් කරුණක් තිබේද?';
      }
    } else {
      if (isSafetyTriggered && safetyRiskLevel === 'high_safety_risk') {
        reply =
          "Your safety and wellbeing are what matter most. Please remember that you don't have to navigate this alone. I've brought up confidential support hotlines and contacts on your screen.";
      } else if (isSafetyTriggered && safetyRiskLevel === 'potential_concern') {
        reply =
          "It feels like things are becoming overwhelming right now. Let's take a gentle pause together. Would you like to try a short 5-4-3-2-1 grounding exercise or slow box breathing?";
      } else if (calculatedLevel === 'high') {
        reply =
          "It sounds like there is a lot weighing on you today. Take your time. Would you like to explore what is contributing most to this stress, or try a relaxation pause?";
      } else if (calculatedLevel === 'moderate') {
        reply =
          'I sense some tension in what you described. Taking a moment to breathe and pace your thoughts can be really helpful. What feels like the biggest priority right now?';
      } else {
        reply =
          'Thank you for checking in with me. You seem to be in a relatively grounded space. What would you like to reflect on or explore today?';
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
