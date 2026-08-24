/**
 * Sinhala (si) Localization Dictionary
 * MindCare Multimodal Emotion-Aware Digital Therapy Assistant
 * 
 * Carefully crafted with empathetic, clinically supportive, and natural Sinhala phrasing
 * with accurate spelling (අක්ෂර වින්‍යාසය) and soothing tone.
 */

import { LocaleDictionary } from './en';

export const si: LocaleDictionary = {
  common: {
    appName: 'MindCare',
    academicBadge: 'පර්යේෂණාත්මක මූලාකෘතිය',
    zenMode: 'සන්සුන් අවස්ථාව',
    private: 'පෞද්ගලිකයි',
    connected: 'සජීවීව සම්බන්ධයි',
    demo: 'නිරූපණ මාදිලිය',
    connecting: 'සම්බන්ධ වෙමින්...',
    close: 'වසන්න',
    yes: 'ඔව්',
    no: 'නැත',
    done: 'නිමයි',
    cancel: 'අවලංගු කරන්න',
    clear: 'මකන්න',
  },

  ambientStatus: {
    low: 'සන්සුන් මනසක්',
    moderate: 'කල්පනාකාරී මනසක්',
    high: 'ආතතියක් හඳුනාගැනිණි',
  },

  header: {
    tagline: 'බහුවිධ හැඟීම්-හඳුනාගැනීමේ මානසික සුවතා සහයකයා',
    insightsBtn: 'තීක්ෂ්ණ දත්ත පුවරුව',
    insightsBtnShort: 'දත්ත පුවරුව',
    simulateLabel: 'අනුකරණය:',
    crisisBtn: 'හදිසි උපකාර',
    switchLanguage: 'Switch to English (ඉංග්‍රීසි භාෂාවට මාරු වන්න)',
    toggleTheme: 'තේමාව මාරු කරන්න',
    openSettings: 'යෙදුම් සැකසුම් විවෘත කරන්න',
    openHistory: 'සැසි ඉතිහාසය සහ ගිණුම විවෘත කරන්න',
  },

  chat: {
    assistantTitle: 'MindCare සහයකයා',
    assistantSubtitle: 'ඔබේ චිත්තවේගීය සුවතා සහයකයා',
    onlineStatus: 'සහයකයා සක්‍රියයි',
    reflecting: 'සහයකයා සිතමින් සිටී...',
    inputPlaceholder: 'ඔබේ සිතේ ඇති දේ බෙදාගන්න... (Enter ඔබන්න)',
    inputListening: 'ඔබේ හඬට සවන් දෙමින්...',
    shiftEnterHint: 'නව පේළියක් සඳහා Shift + Enter ඔබන්න',
    keystrokeActiveNotice: 'ටයිප් කිරීමේ රිද්ම විශ්ලේෂණය ක්‍රියාත්මකයි (වේගය හා කාලය පමණි; අන්තර්ගතය නොකියවේ).',
    textOnlyNotice: 'පෙළ-පමණක් පෞද්ගලික මාදිලිය.',
    sendMessage: 'පණිවිඩය යවන්න',
    enableCamera: 'කැමරා පෙරදසුන සක්‍රිය කරන්න',
    disableCamera: 'කැමරාව අක්‍රිය කරන්න',
    recordVoice: 'හඬ පණිවිඩයක් පටිගත කරන්න',
    voiceMessageSent: 'හඬ පණිවිඩය',
    systemNoticePrefix: 'දැනුම්දීම:',
    conversationAriaLabel: 'සංවාද සටහන්',
  },

  suggestions: {
    supportLabel: 'සහයෝගය:',
    suggestionsLabel: 'යෝජනා:',
    exploreLabel: 'ගවේෂණය:',
    boxBreathingAction: 'හුස්ම ගැනීමේ ව්‍යායාමය',
    groundingAction: 'මුල්බැසීමේ අභ්‍යාසය',
    low: [
      {
        label: 'දවස ගැන මෙනෙහි කරමු',
        prompt: 'අද දවස ගෙවුණු ආකාරය ගැන මෙනෙහි කිරීමට මම කැමතියි.',
      },
      {
        label: 'සන්සුන් අවධානය රැකගනිමු',
        prompt: 'දවස පුරා මෙම සන්සුන් සමබරතාවය පවත්වා ගන්නේ කෙසේද?',
      },
      {
        label: 'සතිපතා මනෝභාවය විමසමු',
        prompt: 'මෙම සතියේ මගේ මනෝභාවය පැවති ආකාරය සමාලෝචනය කරමු.',
      },
      {
        label: 'කෘතඥතාව සටහන් කරමු',
        prompt: 'අද දවසේ මා කෘතඥ වන මොහොතක් සටහන් කිරීමට කැමතියි.',
      },
    ],
    moderate: [
      {
        label: 'මට අධික පීඩනයක් දැනෙනවා',
        prompt: 'වැඩ කටයුතු නිසා මට යම් පීඩනයක් දැනෙනවා, මට ඔබේ මඟපෙන්වීම අවශ්‍යයි.',
      },
      {
        label: 'හුස්ම ගැනීමේ ව්‍යායාමයක් කරමු',
        prompt: 'සිත සන්සුන් කරගැනීමට කෙටි හුස්ම ගැනීමේ ව්‍යායාමයක් මට කියා දෙන්න පුළුවන්ද?',
      },
      {
        label: 'ප්‍රමුඛතා හඳුනාගනිමු',
        prompt: 'මා පාලනය කළ හැකි දේ කෙරෙහි අවධානය යොමු කිරීමට මට උදවු වන්න.',
      },
      {
        label: 'මොහොතක් සිතට සවන් දෙමු',
        prompt: 'අපට කෙටි ඉන්ද්‍රිය මුල්බැසීමේ (grounding) අභ්‍යාසයක් කළ හැකිද?',
      },
    ],
    high: [
      {
        label: 'මට දැන්ම සන්සුන් විය යුතුයි',
        prompt: 'මට දැඩි නොසන්සුන්තාවයක් දැනෙනවා. කරුණාකර 5-4-3-2-1 ඉන්ද්‍රිය මුල්බැසීමේ අභ්‍යාසය දැන්ම ආරම්භ කරන්න.',
      },
      {
        label: 'සිතුවිලි සෙමින් මෙහෙයවන්න',
        prompt: 'මගේ සිතුවිලි වේගවත් වී ඇත. සිත සන්සුන් කරගැනීමට මට මඟපෙන්වන්න.',
      },
      {
        label: 'උපකාරක සේවාවක් අමතන්න',
        prompt: 'විශ්වාසවන්ත උපකාරක සේවාවක් හෝ හදිසි ඇමතුම් අංකයක් සොයාගැනීමට උදවු වන්න.',
      },
      {
        label: 'සිතට නිදහසක් අවශ්‍යයි',
        prompt: 'සිතට දැනෙන බර අඩු කරගැනීමට මට නිහඬ අවකාශයක් අවශ්‍යයි.',
      },
    ],
  },

  safetyBanner: {
    highRiskTitle: 'ක්ෂණික උපකාරක සේවා සූදානම්',
    moderateRiskTitle: 'සුවතා විමසුම',
    highRiskBody:
      'ඔබ දැඩි මානසික පීඩනයක සිටින බව පෙනේ. ඔබ තනිවී නැත, මේ මොහොතේම උපකාර සහ සවන්දීමට කෙනෙකු සූදානම්ව සිටී.',
    moderateRiskBody:
      'යම් නොසන්සුන් බවක් නිරීක්ෂණය විය. සෙමින් ගැඹුරු හුස්මක් ගන්න. ඔබ මෙහි ආරක්ෂිතයි — සිත සන්සුන් කරගනිමු.',
    confirmDismiss: 'ඔබට විශ්වාසද?',
    groundingBtn: '5-4-3-2-1 මුල්බැසීම',
    breathingBtn: 'හුස්ම ගැනීමේ ව්‍යායාමය',
    allHotlinesBtn: 'සියලු හදිසි ඇමතුම් අංක',
    continueBtn: 'මම සුවෙන්, ඉදිරියට යමු',
  },

  telemetryDrawer: {
    title: 'තීක්ෂ්ණ දත්ත සහ සංඥා',
    subtitle: 'චිත්තවේගීය ජෛව-සංඥා සහ සංවේදක දත්ත ප්‍රවාහය',
    bannerNotice: 'සායනික දත්ත පුවරුව: සියලු සංඥා සජීවීව ගණනය කෙරෙන අතර ඔබේ අනුමැතියකින් තොරව කිසිවිටෙකත් සුරැකෙන්නේ නැත.',
    footerNotice: 'අධ්‍යයන පර්යේෂණ මාදිලිය',
    closeDrawer: 'පුවරුව වසන්න',
  },

  historyDrawer: {
    title: 'ගිණුම සහ ඉතිහාසය',
    subtitle: 'පසුගිය මෙනෙහි කිරීම් සහ සැසි සටහන්',
    presenceText: 'මනසික සුවතාවය සහ සන්සුන් බව',
    streak: 'දිනක සන්සුන් බව',
    boxBreathingBtn: '4-4-4 හුස්ම ගැනීමේ ව්‍යායාමය අරඹන්න',
    settingsBtn: 'යෙදුම් සහ පෞද්ගලිකත්ව සැකසුම්',
    ethicsTitle: 'පෞද්ගලිකත්වය සහ ආචාරධර්ම ප්‍රොටෝකෝලය',
    ethicsBody:
      'MindCare යනු අධ්‍යයන පර්යේෂණ මූලාකෘතියකි. චිත්තවේගීය සංඥා සංවේදක මගින් තක්සේරු කරනු ලබන අතර ඒවා සායනික රෝග විනිශ්චයන් නොවේ.',
    version: 'අනුවාදය 1.0.0 (පර්යේෂණ)',
  },

  interventions: {
    boxBreathing: {
      title: '4-4-4 හුස්ම ගැනීමේ ව්‍යායාමය',
      tag: '4-4-4',
      description: 'ක්ෂණික ආතතිය සමනය කර ශාරීරික සන්සුන් බව ළඟා කරගැනීමේ 4-4-4-4 හුස්ම ගැනීමේ රටාව.',
      calmerBtn: 'මට සන්සුන් බවක් දැනේ',
      pause: 'විරාමය',
      resume: 'යළි අරඹන්න',
      reset: 'නැවත මුල සිට',
      completedCycles: 'සම්පූර්ණ කළ වට ගණන:',
    },
    grounding: {
      title: '5-4-3-2-1 ඉන්ද්‍රිය මුල්බැසීමේ අභ්‍යාසය',
      stepOf: 'පියවර',
      of: 'න්',
      complete: 'සම්පූර්ණයි',
      allNoticed: 'සියල්ල හඳුනාගත්තා! ඊළඟ ඉන්ද්‍රියට යමු.',
      checkItemPrompt: 'ඔබ එක් එක් අංගය නිරීක්ෂණය කරන විට එය ලකුණු කරන්න.',
      nextSense: 'ඊළඟ ඉන්ද්‍රිය',
      finishGrounding: 'අභ්‍යාසය අවසන් කරන්න',
      completeTitle: 'මුල්බැසීමේ අභ්‍යාසය සාර්ථකයි ✓',
      completeBody: 'ඔබ වර්තමාන මොහොතට ඔබේ ඉන්ද්‍රියයන් යළි සම්බන්ධ කළා. වර්තමාන මොහොත ආරක්ෂිතයි. දැන් ඔබේ සිරුරට දැනෙන සැහැල්ලුව විඳින්න.',
      returnToChat: 'නැවත සංවාදයට යන්න',
    },
  },
};
