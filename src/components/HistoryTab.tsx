import React from 'react';
import { Clock, Copy, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRHistoryItem } from '../types';

interface HistoryTabProps {
  items: QRHistoryItem[];
  onDelete: (id: string) => void;
  onClear: () => void;
}

export default function HistoryTab({ items, onDelete, onClear }: HistoryTabProps) {
  const handleCopy = (data: string) => {
    navigator.clipboard.writeText(data);
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] px-6 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
          <Clock className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">No History Yet</h3>
          <p className="text-slate-500 text-sm mt-1">
            Generated and scanned QR codes will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4 pb-24 px-4 sm:px-6 pt-6 max-w-md mx-auto w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">History</h2>
        <button
          onClick={onClear}
          className="text-sm font-medium text-rose-500 hover:text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex flex-col space-y-3"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="bg-indigo-50 dark:bg-indigo-500/20 text-indigo-500 p-2 rounded-xl">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm line-clamp-1">{item.label || item.type}</h4>
                    <p className="text-xs text-slate-500">
                      {new Date(item.createdAt).toLocaleDateString()} â€¢ {item.type}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleCopy(item.data)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl text-xs text-slate-600 dark:text-slate-400 truncate">
                {item.data}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
