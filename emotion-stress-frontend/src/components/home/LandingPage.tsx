'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import {
  Sparkles,
  HeartHandshake,
  ShieldCheck,
  Camera,
  Mic,
  Brain,
  Lock,
  ArrowRight,
  Activity,
  Smile,
  MessageSquareHeart,
  Wind,
  CheckCircle2,
  AlertCircle,
  Cpu,
  LogIn,
  Languages,
  Eye,
  Keyboard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { AuthModal } from '@/components/auth/AuthModal';
import { EmotionOrb } from '@/components/emotion/EmotionOrb';
import { useAuthStore } from '@/store/useAuthStore';
import { useStressStore } from '@/store/useStressStore';
import { useTranslation } from '@/locales';

/**
 * LandingPage - Calm Intelligence Healthcare & Digital Therapeutics Portal.
 * Presented to visitors to introduce MindCare's multimodal AI companion,
 * emotional intelligence orb, ethical architecture, and non-clinical CBT support.
 */
export function LandingPage() {
  const { openAuthModal } = useAuthStore();
  const setIntervention = useStressStore((state) => state.setIntervention);
  const { t } = useTranslation();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: 'easeOut' },
    },
  };

  const features = [
    {
      id: 'fer',
      icon: Camera,
      color: 'from-blue-500 to-cyan-500',
      badge: 'DenseNet FER v2',
      title: 'Facial Affective Intelligence',
      description:
        'Analyzes micro-expression signals in real time to estimate emotional states (7 classes) with zero raw video storage.',
    },
    {
      id: 'ser',
      icon: Mic,
      color: 'from-teal-500 to-emerald-500',
      badge: 'CNN-LSTM SER + MFCC',
      title: 'Speech Emotion Analysis',
      description:
        'Extracts 40-MFCC acoustic features and pitch variation to detect vocal stress and emotional undertones in voice messages.',
    },
    {
      id: 'cbt',
      icon: HeartHandshake,
      color: 'from-indigo-500 to-purple-500',
      badge: 'Gemini 3.6 CBT Engine',
      title: 'Adaptive CBT Companion',
      description:
        'Delivers empathetic Cognitive Behavioral Therapy dialogues, reflective reframing, and actionable somatic grounding.',
    },
    {
      id: 'keystroke',
      icon: Keyboard,
      color: 'from-purple-500 to-pink-500',
      badge: 'Temporal Rhythm',
      title: 'Keystroke Dynamics',
      description:
        'Passively tracks inter-key flight times and dwell times without logging private keystrokes or sensitive character content.',
    },
    {
      id: 'trilingual',
      icon: Languages,
      color: 'from-amber-500 to-orange-500',
      badge: 'Unicode Grapheme Engine',
      title: 'Trilingual Indic Support',
      description:
        'Zero-artifact typographic rendering for Sinhala (සිංහල), Tamil (தமிழ்), and English with high-fidelity Text-to-Speech.',
    },
    {
      id: 'security',
      icon: ShieldCheck,
      color: 'from-slate-500 to-teal-500',
      badge: '3-Tier RBAC + Google OAuth',
      title: 'Privacy & Data Governance',
      description:
        'Google OAuth 2.0, bcrypt-salted hashes, JWT authentication, and strict Role-Based Access Control on local SQLite.',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Express Naturally',
      description:
        'Communicate via text, speech audio, or video turns in your preferred language whenever you need a mindful check-in.',
      icon: MessageSquareHeart,
    },
    {
      step: '02',
      title: 'Multimodal Fusion',
      description:
        'Neural models fuse facial expressions, speech acoustics, and behavioral dynamics to estimate emotional stress.',
      icon: Activity,
    },
    {
      step: '03',
      title: 'Guided Decompression',
      description:
        'Receive personalized CBT reframing, interactive 4-4-4 Box Breathing, and 5-4-3-2-1 Sensory Grounding exercises.',
      icon: Wind,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 selection:bg-teal-500/20 selection:text-teal-700 dark:selection:text-teal-300">
      {/* Global Navigation Header */}
      <Header />

      {/* Main Landing Content */}
      <main className="flex-1 flex flex-col items-center">
        {/* ── 1. Hero Section ────────────────────────────────────────────── */}
        <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 md:pt-16 md:pb-24 overflow-hidden">
          {/* Ambient Decorative Background Glows */}
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[380px] bg-gradient-to-tr from-teal-500/15 via-blue-400/15 to-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10"
            aria-hidden="true"
          />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-6"
          >
            {/* Pill Badge */}
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-semibold shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                <span>Calm Intelligence • Emotion-Aware Digital Therapeutics</span>
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12]"
            >
              Understand how you feel.{' '}
              <span className="bg-gradient-to-r from-teal-500 via-cyan-500 to-indigo-600 bg-clip-text text-transparent">
                Take a moment to feel better.
              </span>
            </motion.h1>

            {/* Description Subtitle */}
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed font-normal"
            >
              MindCare seamlessly blends facial affective signals, vocal acoustic analysis,
              and conversational CBT dialogue to provide personalized, non-clinical emotional wellness
              and real-time stress decompression.
            </motion.p>

            {/* Central Living Emotion Intelligence Orb */}
            <motion.div variants={itemVariants} className="py-4">
              <EmotionOrb size="hero" showDetails interactive />
            </motion.div>

            {/* CTAs */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 w-full max-w-md mx-auto"
            >
              <button
                type="button"
                onClick={() => openAuthModal('register')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Begin Your MindCare Journey</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => setIntervention('breathing')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Wind className="h-4 w-4 text-teal-500" />
                <span>Try Box Breathing</span>
              </button>
            </motion.div>

            {/* Academic Non-Clinical Disclaimer */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 max-w-xl text-left shadow-2xs"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
              <span>
                <strong className="font-semibold text-slate-800 dark:text-slate-200">Non-Clinical Support:</strong>{' '}
                MindCare is an academic research assistant for emotional wellbeing and stress regulation.
                In an acute crisis, dial Sri Lanka National Mental Health Helpline (1926).
              </span>
            </motion.div>
          </motion.div>
        </section>

        {/* ── 2. How It Works Section ────────────────────────────────────── */}
        <section className="w-full bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border-y border-slate-200/80 dark:border-slate-800/80 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-xs uppercase tracking-widest font-bold text-teal-600 dark:text-teal-400 mb-2">
                Guided Somatic Workflow
              </h2>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                How MindCare Understands & Decompresses Stress
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {steps.map((item, idx) => (
                <div
                  key={idx}
                  className="relative p-6 rounded-3xl bg-white/90 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800/80 shadow-md flex flex-col items-start hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between w-full mb-4">
                    <div className="h-10 w-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-800/60 flex items-center justify-center text-teal-600 dark:text-teal-300">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className="text-2xl font-black text-slate-200 dark:text-slate-800">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3. Core Multimodal AI Features ─────────────────────────────── */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs uppercase tracking-widest font-bold text-teal-600 dark:text-teal-400 mb-2">
              Research-Grade Architecture
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
              Multimodal Neural Pipelines & Affective Computing
            </p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Combines deep convolutional networks, recurrent acoustic models, and conversational LLMs
              for holistic affective sensing and therapeutic reframing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat) => {
              const IconComp = feat.icon;
              return (
                <div
                  key={feat.id}
                  className="relative p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/70 dark:border-slate-800/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-teal-500/10 to-blue-500/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-blue-600 flex items-center justify-center text-white shadow-md">
                        <IconComp className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {feat.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center text-[11px] font-semibold text-teal-600 dark:text-teal-400">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-teal-500" />
                    <span>Real-time local processing</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 4. Bottom Journey CTA ──────────────────────────────────────── */}
        <section className="w-full bg-gradient-to-tr from-teal-600 via-cyan-600 to-blue-700 py-16 px-4 text-center text-white relative overflow-hidden">
          <div className="max-w-3xl mx-auto space-y-5 relative z-10">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Experience Emotion-Aware Therapy?
            </h2>
            <p className="text-xs sm:text-sm text-teal-100 max-w-xl mx-auto leading-relaxed">
              Create an account in seconds or test with Google Single Sign-On.
              Experience real-time speech, facial emotion, and guided CBT decompression.
            </p>
            <button
              type="button"
              onClick={() => openAuthModal('register')}
              className="px-8 py-3.5 rounded-2xl bg-white text-teal-800 hover:bg-teal-50 font-bold text-sm shadow-xl hover:shadow-2xl transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Get Started with MindCare</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </main>

      {/* Auth Modal Portal */}
      <AuthModal />
    </div>
  );
}
