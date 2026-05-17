import React, { useState } from 'react';
import { ChevronLeft, Mail, Send } from 'lucide-react';
import { motion } from 'motion/react';

export default function ContactPage({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send to an API. Here we just show a success state.
    setTimeout(() => {
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
    }, 500);
  };

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
          <h1 className="font-bold text-lg ml-2">Contact Us</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-8 space-y-8 pb-24">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/10">
            <Mail className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Get in Touch</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">We'd love to hear from you</p>
          </div>
        </div>

        {submitted ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 p-6 rounded-3xl border border-emerald-200 dark:border-emerald-800/30 text-center space-y-3 shadow-sm"
          >
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
              <Send className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg">Message Sent!</h3>
            <p className="text-sm opacity-90">Thank you for reaching out. We'll get back to you soon.</p>
            <button 
              onClick={() => setSubmitted(false)}
              className="mt-4 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors"
            >
              Send Another
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Name</label>
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Email</label>
              <input 
                required
                type="email" 
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
                className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Message</label>
              <textarea 
                required
                rows={4}
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                placeholder="How can we help you?"
                className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none text-slate-900 dark:text-white"
              />
            </div>
            <button 
              type="submit"
              className="w-full flex items-center justify-center space-x-2 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-2xl font-bold transition-all shadow-md shadow-indigo-500/25 mt-2"
            >
              <Send className="w-5 h-5" />
              <span>Send Message</span>
            </button>
          </form>
        )}
      </main>
    </motion.div>
  );
}
