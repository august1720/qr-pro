import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { ScanLine, Copy, ExternalLink, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { QRHistoryItem, QRDataType } from '../types';

interface ScanTabProps {
  onScan: (item: QRHistoryItem) => void;
}

export default function ScanTab({ onScan }: ScanTabProps) {
  const [scanResult, setScanResult] = useState<string | null>(null);

  useEffect(() => {
    // Only initialize if we haven't scanned anything yet to avoid re-mounting loops
    if (scanResult) return;

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
    };

    const html5QrcodeScanner = new Html5QrcodeScanner(
      "qr-reader",
      config,
      false
    );

    html5QrcodeScanner.render(
      (decodedText) => {
        // Pause scanning first
        if (html5QrcodeScanner.getState && html5QrcodeScanner.getState() !== 3) {
           try { html5QrcodeScanner.pause(); } catch(e) {}
        }
        
        html5QrcodeScanner.clear().then(() => {
          setScanResult(decodedText);

          // Determine type basic logic
          let type: QRDataType = 'Text';
          if (decodedText.startsWith('http://') || decodedText.startsWith('https://')) type = 'URL';
          else if (decodedText.startsWith('WIFI:')) type = 'WiFi';
          else if (decodedText.startsWith('mailto:')) type = 'Email';
          else if (decodedText.startsWith('tel:')) type = 'Phone';

          onScan({
            id: Math.random().toString(36).substr(2, 9),
            type,
            data: decodedText,
            createdAt: Date.now(),
            label: 'Scanned Code'
          });
        }).catch(err => {
          console.error("Failed to clear scanner", err);
          // Fallback if clear fails
          setScanResult(decodedText);
        });
      },
      (error) => {
        // Ignored, continuous scanning
      }
    );

    return () => {
      try {
        html5QrcodeScanner.clear().catch(e => {
            console.warn("Scanner clear error ignored on unmount", e);
        });
      } catch (e) {
        console.error("Failed to clear scanner on unmount.");
      }
    };
  }, [scanResult, onScan]);

  const handleCopy = () => {
    if (scanResult) {
      navigator.clipboard.writeText(scanResult);
    }
  };

  const handleOpen = () => {
    if (scanResult && (scanResult.startsWith('http') || scanResult.startsWith('mailto:') || scanResult.startsWith('tel:'))) {
      window.open(scanResult, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 pb-24 px-4 sm:px-6 pt-6 max-w-md mx-auto w-full">
      <div className="text-center space-y-2 mb-2">
        <h2 className="text-2xl font-bold tracking-tight">Scan Code</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Point your camera at a QR code to read it
        </p>
      </div>

      <div className={scanResult ? 'hidden' : 'block'}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-3xl bg-slate-900 ring-4 ring-slate-100 dark:ring-slate-800 shadow-xl"
        >
          <div id="qr-reader" className="w-full h-full [&>div]:border-none [&>div>video]:rounded-3xl [&_a]:hidden" />
        </motion.div>
      </div>

      {scanResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700 space-y-6"
        >
          <div className="flex items-center justify-center w-16 h-16 bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400 rounded-full mx-auto">
            <ScanLine className="w-8 h-8" />
          </div>
          
          <div className="text-center">
            <h3 className="font-semibold text-lg">Scan Successful</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Result from the scanned code
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 break-all text-sm">
            {scanResult}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center space-x-2 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-xl font-medium transition-colors"
            >
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </button>
            <button
              onClick={handleOpen}
              className="flex-1 flex items-center justify-center space-x-2 py-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 rounded-xl font-medium transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open</span>
            </button>
          </div>

          <button
            onClick={() => setScanResult(null)}
            className="w-full flex items-center justify-center space-x-2 py-3.5 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white rounded-xl font-medium transition-all shadow-md mt-4"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Scan Another</span>
          </button>
        </motion.div>
      )}
    </div>
  );
}
