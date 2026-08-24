import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, Noto_Sans_Sinhala, Noto_Sans_Tamil } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

const notoSansSinhala = Noto_Sans_Sinhala({
  variable: '--font-noto-sans-sinhala',
  subsets: ['sinhala'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const notoSansTamil = Noto_Sans_Tamil({
  variable: '--font-noto-sans-tamil',
  subsets: ['tamil'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'MindCare | Multimodal Emotion-Aware Wellbeing Assistant',
  description:
    'Academic research prototype for multimodal emotional wellbeing assistance using text, voice, facial signals, and keystroke dynamics. Not a clinical tool.',
  keywords: [
    'digital therapy',
    'emotion awareness',
    'wellbeing',
    'multimodal AI',
    'keystroke dynamics',
    'mental health research',
    'stress detection',
    'affective computing',
  ],
  authors: [{ name: 'MindCare Research Team' }],
  openGraph: {
    title: 'MindCare — Multimodal Emotion-Aware Wellbeing Assistant',
    description:
      'Academic prototype combining text, voice, video, and keystroke signals for adaptive emotional wellbeing support.',
    type: 'website',
    locale: 'en_US',
  },
  robots: {
    index: false, // Academic prototype — do not index publicly
    follow: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
  ],
};

/**
 * Blocking theme initialization script injected before React hydration.
 * Prevents flash of unstyled theme (FOUT) on first render by reading
 * the stored theme preference from localStorage and setting the `dark` class
 * on `<html>` synchronously.
 */
const themeInitScript = `
  (function() {
    try {
      var stored = localStorage.getItem('mindcare_theme') || 'system';
      var isDark = stored === 'dark' || (stored === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${notoSansSinhala.variable} ${notoSansTamil.variable} h-full antialiased`}
    >
      <head>
        {/* Blocking theme script — must run before React to prevent FOUT */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
        {/* Skip-to-content link for screen reader & keyboard accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-xl focus:text-sm focus:font-medium"
        >
          Skip to main content
        </a>

        <div id="main-content" className="flex-1 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
