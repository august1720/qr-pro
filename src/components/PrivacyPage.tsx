import React from 'react';
import { ChevronLeft, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function PrivacyPage({ onClose }: { onClose: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 overflow-y-auto"
    >
      <header className="sticky top-0 z-40 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 pt-safe">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center">
          <button 
            onClick={onClose}
            className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="font-bold text-lg ml-2">Privacy Policy</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-8 space-y-8 pb-24">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Privacy First</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Last updated: May 2026</p>
          </div>
        </div>

        <div className="prose prose-slate dark:prose-invert prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-headings:text-slate-800 dark:prose-headings:text-slate-100 prose-sm w-full max-w-none">
          <section className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 space-y-4 mb-6">
            <h3 className="text-lg font-bold">1. Data Collection</h3>
            <p>
              QR Pro is built with privacy in mind. We do not collect, transmit, or store your personal data on any external servers. All QR codes you generate or scan are processed locally on your device.
            </p>
          </section>

          <section className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 space-y-4 mb-6">
            <h3 className="text-lg font-bold">2. Local Storage</h3>
            <p>
              Your scanning and generation history is saved strictly in your device's local storage (e.g., browser's LocalStorage). You can clear this history at any time from the History tab.
            </p>
          </section>

          <section className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 space-y-4 mb-6">
            <h3 className="text-lg font-bold">3. Camera Permissions</h3>
            <p>
              Camera access is requested solely for the purpose of scanning QR codes in real-time. We do not record video, capture images in the background, or upload any visual data. The camera feed is processed directly in your browser.
            </p>
          </section>
          
          <section className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 space-y-4 mb-6">
            <h3 className="text-lg font-bold">4. Third-Party Services</h3>
            <p>
              Since generating and scanning QR codes are handled locally, we do not utilize third-party tracking or analytics SDKs that monitor your specific usage behavior.
            </p>
          </section>
        </div>
      </main>
    </motion.div>
  );
}
