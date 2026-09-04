import type { Metadata } from 'next';
import { HomeClient } from '@/components/home/HomeClient';

/**
 * Page-level metadata — overrides root layout metadata for the home page.
 */
export const metadata: Metadata = {
  title: 'MindCare | Multimodal Emotion-Aware Wellbeing Assistant',
  description:
    'Academic research prototype for multimodal emotional wellbeing assistance. Combines text, voice, facial expression, and keystroke dynamics to estimate emotional state and provide adaptive therapeutic guidance.',
};

/**
 * HomePage — Entry point for MindCare.
 * Automatically presents the professional Landing Page for unauthenticated visitors,
 * and seamlessly transitions to the full DashboardShell upon user authentication.
 */
export default function HomePage() {
  return <HomeClient />;
}
