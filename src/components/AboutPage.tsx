import React from 'react';
import { ChevronLeft, Info, Github, Globe } from 'lucide-react';
import { motion } from 'motion/react';

export default function AboutPage({ onClose }: { onClose: () => void }) {
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
          <h1 className="font-bold text-lg ml-2">About QR Pro</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-8 space-y-8 pb-24">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center transform rotate-12 shadow-xl shadow-indigo-500/20">
            <span className="text-white font-bold text-2xl transform -rotate-12">QR</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold">QR Pro</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Version 1.0.0</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 space-y-4 text-slate-600 dark:text-slate-300">
          <p>
            QR Pro is a modern, fast, and secure QR code generator and scanner designed with Material 3 principles. 
          </p>
          <p>
            Our mission is to provide the best QR code experience with a minimal premium design, all while ensuring your privacy and data security. All history is stored locally on your device.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold px-2 text-slate-800 dark:text-slate-200">Links</h3>
          <a href="#" className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
            <div className="flex items-center space-x-3">
              <Globe className="w-5 h-5 text-indigo-500" />
              <span className="font-medium text-slate-700 dark:text-slate-200">Website</span>
            </div>
          </a>
          <a href="#" className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
            <div className="flex items-center space-x-3">
              <Github className="w-5 h-5 text-slate-800 dark:text-white" />
              <span className="font-medium text-slate-700 dark:text-slate-200">GitHub</span>
            </div>
          </a>
        </div>
      </main>
    </motion.div>
  );
}
