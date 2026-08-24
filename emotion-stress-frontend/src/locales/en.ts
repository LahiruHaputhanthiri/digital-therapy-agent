/**
 * English (en) Localization Dictionary
 * MindCare Multimodal Emotion-Aware Digital Therapy Assistant
 */

export const en = {
  common: {
    appName: 'MindCare',
    academicBadge: 'Academic Prototype',
    zenMode: 'Zen Mode',
    private: 'Private',
    connected: 'Live Connected',
    demo: 'Standalone Demo',
    connecting: 'Connecting...',
    close: 'Close',
    yes: 'Yes',
    no: 'No',
    done: 'Done',
    cancel: 'Cancel',
    clear: 'Clear',
  },

  ambientStatus: {
    low: 'Calm State',
    moderate: 'Reflective',
    high: 'Tension Noticed',
  },

  header: {
    tagline: 'Multimodal Emotion-Aware Companion',
    insightsBtn: 'Insights & Telemetry',
    insightsBtnShort: 'Insights',
    simulateLabel: 'Simulate:',
    crisisBtn: 'Crisis Support',
    switchLanguage: 'සිංහල භාෂාවට මාරු වන්න (Switch to Sinhala)',
    toggleTheme: 'Toggle theme',
    openSettings: 'Open application settings',
    openHistory: 'Open session history and profile',
  },

  chat: {
    assistantTitle: 'MindCare Assistant',
    assistantSubtitle: 'Multimodal Emotional Wellbeing Companion',
    onlineStatus: 'Assistant online',
    reflecting: 'Assistant is reflecting...',
    inputPlaceholder: 'Share what is on your mind... (Enter to send)',
    inputListening: 'Listening to your voice...',
    shiftEnterHint: 'Shift + Enter for new line',
    keystrokeActiveNotice: 'Behavioral rhythm analysis active (keystroke timing only; text not collected).',
    textOnlyNotice: 'Text-only privacy mode.',
    sendMessage: 'Send message',
    enableCamera: 'Enable camera preview',
    disableCamera: 'Disable camera feed',
    recordVoice: 'Record voice message',
    voiceMessageSent: 'Voice message',
    systemNoticePrefix: 'Notice:',
    conversationAriaLabel: 'Conversation messages',
  },

  suggestions: {
    supportLabel: 'Support:',
    suggestionsLabel: 'Suggestions:',
    exploreLabel: 'Explore:',
    boxBreathingAction: 'Box Breathing',
    groundingAction: 'Grounding',
    low: [
      {
        label: 'Reflect on my day',
        prompt: 'I would like to reflect on how my day went today.',
      },
      {
        label: 'Maintain calm focus',
        prompt: 'How can I maintain this sense of balance and calm throughout my day?',
      },
      {
        label: 'Weekly mood review',
        prompt: "Let's review how my mood has been this week.",
      },
      {
        label: 'Log a gratitude',
        prompt: 'I would like to record a moment I am grateful for today.',
      },
    ],
    moderate: [
      {
        label: 'I feel overwhelmed',
        prompt: 'I feel a bit overwhelmed by workload right now and could use support.',
      },
      {
        label: 'Quick breathwork',
        prompt: 'Can you guide me through a quick breathing exercise to calm down?',
      },
      {
        label: 'Prioritize & focus',
        prompt: 'Help me prioritize what is actually in my control right now.',
      },
      {
        label: 'Grounding check-in',
        prompt: 'Can we do a short sensory grounding check-in?',
      },
    ],
    high: [
      {
        label: 'I need grounding NOW',
        prompt: 'Things feel very intense. Please walk me through the 5-4-3-2-1 grounding exercise immediately.',
      },
      {
        label: 'Help me slow down',
        prompt: 'I need a quiet space to slow my thoughts down. Please guide me.',
      },
      {
        label: 'Connect with support',
        prompt: 'Help me connect with a support resource or trusted contact right now.',
      },
      {
        label: 'Pace my thoughts',
        prompt: 'My thoughts are racing. Can you help me pace them?',
      },
    ],
  },

  safetyBanner: {
    highRiskTitle: 'Immediate Support Available',
    moderateRiskTitle: 'Wellbeing Check-In',
    highRiskBody:
      "You're showing signs of significant distress. Please know that support is available right now. You don't have to navigate this alone.",
    moderateRiskBody:
      "Elevated distress signals have been observed. Take a gentle breath. You're safe here — let's slow down together.",
    confirmDismiss: 'Are you sure?',
    groundingBtn: '5-4-3-2-1 Grounding',
    breathingBtn: 'Box Breathing',
    allHotlinesBtn: 'All Support Hotlines',
    continueBtn: "I'm okay, continue",
  },

  telemetryDrawer: {
    title: 'Insights & Telemetry',
    subtitle: 'Affective biometric signals & sensory streams',
    bannerNotice: 'Clinical telemetry view: signals are computed in-session and never stored without consent.',
    footerNotice: 'Academic Research Mode',
    closeDrawer: 'Close Drawer',
  },

  historyDrawer: {
    title: 'Profile & History',
    subtitle: 'Past mindful reflections & archives',
    presenceText: 'Mindful presence & wellbeing',
    streak: 'day streak',
    boxBreathingBtn: 'Start 4-4-4 Box Breathing',
    settingsBtn: 'Application & Privacy Settings',
    ethicsTitle: 'Privacy & Ethics Protocol',
    ethicsBody:
      'MindCare is an academic research prototype. Emotion signals are estimated from active sensors and are not presented as clinical diagnoses.',
    version: 'Version 1.0.0 (Research)',
  },

  interventions: {
    boxBreathing: {
      title: 'Box Breathing',
      tag: '4-4-4',
      description: '4-4-4-4 pattern used for acute stress regulation and physiological calm.',
      calmerBtn: 'I Feel Calmer',
      pause: 'Pause',
      resume: 'Resume',
      reset: 'Reset',
      completedCycles: 'Completed cycles:',
    },
    grounding: {
      title: '5-4-3-2-1 Sensory Grounding',
      stepOf: 'Step',
      of: 'of',
      complete: 'complete',
      allNoticed: 'All noticed! Move to the next sense.',
      checkItemPrompt: 'Check each item as you observe it.',
      nextSense: 'Next Sense',
      finishGrounding: 'Finish Grounding',
      completeTitle: 'Grounding Complete ✓',
      completeBody: 'You have re-anchored your senses in the present moment. The present is safe. Notice how your body feels right now.',
      returnToChat: 'Return to Conversation',
    },
  },
};

export type LocaleDictionary = typeof en;
