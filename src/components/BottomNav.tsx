import React from 'react';
import { QRCodeSVG } from 'qrcode.react'; 
import { QrCode, ScanLine, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface BottomNavProps {
  activeTab: 'generate' | 'scan' | 'history';
  onChangeTab: (tab: 'generate' | 'scan' | 'history') => void;
}

const TABS = [
  { id: 'generate', icon: QrCode, label: 'Generate' },
  { id: 'scan', icon: ScanLine, label: 'Scan' },
  { id: 'history', icon: Clock, label: 'History' },
] as const;

export default function BottomNav({ activeTab, onChangeTab }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-4 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-t border-slate-200/50 dark:border-slate-800/50">
      <div className="max-w-md mx-auto flex justify-around items-center">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className="relative flex flex-col items-center justify-center p-2 min-w-[72px]"
            >
              {isActive && (
                <motion.div
                  layoutId="bubble"
                  className="absolute inset-0 bg-indigo-100 dark:bg-indigo-500/20 rounded-2xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon 
                className={cn(
                  "w-6 h-6 mb-1 relative z-10 transition-colors duration-300",
                  isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"
                )} 
              />
              <span 
                className={cn(
                  "text-[10px] font-medium relative z-10 transition-colors duration-300",
                  isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"
                )}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
