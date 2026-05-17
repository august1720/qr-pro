import React from 'react';
import { Info, Shield, Mail, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface SettingsTabProps {
  onOpenPage: (page: 'about' | 'privacy' | 'contact') => void;
}

export default function SettingsTab({ onOpenPage }: SettingsTabProps) {
  const menuItems = [
    { id: 'about', label: 'About QR Pro', icon: Info, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    { id: 'privacy', label: 'Privacy Policy', icon: Shield, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { id: 'contact', label: 'Contact Us', icon: Mail, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
  ] as const;

  return (
    <div className="flex flex-col h-full space-y-6 pb-24 px-4 sm:px-6 pt-6 max-w-md mx-auto w-full">
      <div className="text-center space-y-2 mb-2">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          App preferences and information
        </p>
      </div>

      <div className="space-y-3">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onOpenPage(item.id)}
              className="w-full bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-2.5 rounded-xl ${item.bg} ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-medium text-slate-700 dark:text-slate-200">{item.label}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
