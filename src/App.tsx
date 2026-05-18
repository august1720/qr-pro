import React, { useState, useEffect } from 'react';
import { useLocalStorage, useMediaQuery } from 'usehooks-ts';
import { Moon, Sun, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import BottomNav from './components/BottomNav';
import GenerateTab from './components/GenerateTab';
import ScanTab from './components/ScanTab';
import HistoryTab from './components/HistoryTab';
import SettingsTab from './components/SettingsTab';
import AboutPage from './components/AboutPage';
import PrivacyPage from './components/PrivacyPage';
import ContactPage from './components/ContactPage';
import { QRHistoryItem, Theme } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'generate' | 'scan' | 'history' | 'settings'>('generate');
  const [subPage, setSubPage] = useState<'about' | 'privacy' | 'contact' | null>(null);
  const [history, setHistory] = useLocalStorage<QRHistoryItem[]>('qr-history', []);
  const [theme, setTheme] = useLocalStorage<Theme>('qr-theme', 'system');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const systemPrefersDark = useMediaQuery('(prefers-color-scheme: dark)');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const isDark = theme === 'dark' || (theme === 'system' && systemPrefersDark);

  // Handle Theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setTheme(prev => {
      if (prev === 'system') {
        return systemPrefersDark ? 'light' : 'dark';
      }
      return prev === 'dark' ? 'light' : 'dark';
    });
  };

  const handleSaveToHistory = (item: QRHistoryItem) => {
    setHistory(prev => [item, ...prev]);
  };

  const handleDeleteHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300">
      
      {/* Top App Bar */}
      <header className="sticky top-0 z-40 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center transform rotate-12">
              <span className="text-white font-bold text-sm transform -rotate-12">QR</span>
            </div>
            <h1 className="font-bold text-xl tracking-tight">QR Pro</h1>
          </div>
          
          <button
            onClick={toggleTheme}
            className="p-1 rounded-full bg-slate-200/50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <div className="relative flex items-center w-14 h-8 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-200 dark:border-slate-700/50 overflow-hidden">
               <div className="flex w-full justify-between items-center px-2 z-0">
                 <Sun className="w-4 h-4 text-amber-500/50 dark:text-slate-600" />
                 <Moon className="w-4 h-4 text-slate-400 dark:text-indigo-400/50" />
               </div>

               <motion.div
                 className="absolute top-1 left-1 w-6 h-6 rounded-full shadow-md flex items-center justify-center z-10 bg-slate-800 dark:bg-slate-100"
                 animate={{
                   x: isDark ? 24 : 0
                 }}
                 transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
               >
                 {isDark ? (
                   <Moon className="w-3.5 h-3.5 text-slate-100 fill-slate-300" />
                 ) : (
                   <Sun className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                 )}
               </motion.div>
            </div>
          </button>
        </div>
        <AnimatePresence>
          {!isOnline && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-rose-500 text-white overflow-hidden"
            >
              <div className="flex items-center justify-center space-x-2 py-2 px-4 text-sm font-medium">
                <WifiOff className="w-4 h-4" />
                <span>You are offline. QR Pro is working in offline mode.</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content Area */}
      <main className="relative flex-1 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full min-h-[calc(100vh-4rem)]"
          >
            {activeTab === 'generate' && <GenerateTab onSave={handleSaveToHistory} />}
            {activeTab === 'scan' && <ScanTab onScan={handleSaveToHistory} />}
            {activeTab === 'history' && (
              <HistoryTab 
                items={history} 
                onDelete={handleDeleteHistory}
                onClear={clearHistory}
              />
            )}
            {activeTab === 'settings' && (
              <SettingsTab onOpenPage={setSubPage} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />
      
      {/* Sub Pages Overlays */}
      <AnimatePresence>
        {subPage === 'about' && <AboutPage onClose={() => setSubPage(null)} />}
        {subPage === 'privacy' && <PrivacyPage onClose={() => setSubPage(null)} />}
        {subPage === 'contact' && <ContactPage onClose={() => setSubPage(null)} />}
      </AnimatePresence>
    </div>
  );
}
