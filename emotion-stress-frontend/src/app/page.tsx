import type { Metadata } from 'next';
import { DashboardShell } from '@/components/layout/DashboardShell';

/**
 * Page-level metadata — overrides root layout metadata for the home page.
 */
export const metadata: Metadata = {
  title: 'MindCare | Multimodal Emotion-Aware Wellbeing Assistant',
  description:
    'Academic research prototype for multimodal emotional wellbeing assistance. Combines text, voice, facial expression, and keystroke dynamics to estimate emotional state and provide adaptive therapeutic guidance.',
};

/**
 * HomePage — Entry point for the MindCare dashboard application.
 * Renders the full 3-panel DashboardShell which orchestrates:
 * - Sidebar (profile, mood history, session log) on desktop
 * - ChatWindow (conversational interface + inline interventions) center
 * - Right panel (stress gauge, emotion bars, sensor feeds, privacy controls)
 * - Mobile tabbed navigation for viewports < 1024px
 */
export default function HomePage() {
  return <DashboardShell />;
}
