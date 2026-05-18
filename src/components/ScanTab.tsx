import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { ScanLine, Copy, ExternalLink, RefreshCw, Wifi, UserPlus, Mail, Phone, MessageSquare, Globe, Search, SwitchCamera, ImagePlus, Camera } from 'lucide-react';
import { motion } from 'motion/react';
import { QRHistoryItem, QRDataType } from '../types';

interface ScanTabProps {
  onScan: (item: QRHistoryItem) => void;
}

const parseQRCode = (text: string) => {
  if (!text) return { type: 'Text', text };

  if (text.startsWith('WIFI:')) {
    const ssidMatch = text.match(/S:(.*?);/);
    const passMatch = text.match(/P:(.*?);/);
    const typeMatch = text.match(/T:(.*?);/);
    return {
      type: 'WiFi',
      ssid: ssidMatch ? ssidMatch[1] : 'Unknown Network',
      password: passMatch ? passMatch[1] : '',
      encryption: typeMatch ? typeMatch[1] : 'None',
      text
    };
  }

  if (text.startsWith('BEGIN:VCARD')) {
    const fnMatch = text.match(/FN:(.*?)(\r\n|\n|$)/);
    const nMatch = text.match(/N:(.*?)(\r\n|\n|$)/);
    const telMatch = text.match(/TEL.*?:(.*?)(\r\n|\n|$)/);
    const emailMatch = text.match(/EMAIL.*?:(.*?)(\r\n|\n|$)/);
    
    let name = 'Unknown Contact';
    if (fnMatch) name = fnMatch[1].trim();
    else if (nMatch) name = nMatch[1].replace(/;/g, ' ').trim();

    return {
      type: 'Contact',
      name,
      phone: telMatch ? telMatch[1].trim() : '',
      email: emailMatch ? emailMatch[1].trim() : '',
      text
    };
  }
  
  if (text.startsWith('MECARD:')) {
    const nMatch = text.match(/N:(.*?);/);
    const telMatch = text.match(/TEL:(.*?);/);
    const emailMatch = text.match(/EMAIL:(.*?);/);
    return {
      type: 'Contact',
      name: nMatch ? nMatch[1].replace(',', ' ') : 'Unknown Contact',
      phone: telMatch ? telMatch[1] : '',
      email: emailMatch ? emailMatch[1] : '',
      text
    };
  }

  if (text.startsWith('http://') || text.startsWith('https://')) {
    return { type: 'URL', url: text, text };
  }

  if (text.startsWith('mailto:')) {
    const target = text.substring(7);
    const email = target.split('?')[0];
    return { type: 'Email', email, text };
  }

  if (text.startsWith('tel:')) {
    return { type: 'Phone', phone: text.substring(4), text };
  }

  if (text.startsWith('SMSTO:')) {
    const parts = text.split(':');
    const phone = parts[1] || '';
    const message = parts[2] || '';
    return { type: 'SMS', phone, message, text };
  }

  return { type: 'Text', text };
};

export default function ScanTab({ onScan }: ScanTabProps) {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const onScanRef = useRef(onScan);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  const handleScanSuccess = (decodedText: string) => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.pause();
    }
    setScanResult(decodedText);
    const parsed = parseQRCode(decodedText);
    onScanRef.current({
      id: Math.random().toString(36).substr(2, 9),
      type: parsed.type as any,
      data: decodedText,
      createdAt: Date.now(),
      label: 'Scanned Code'
    });
  };

  const startCamera = async (mode: 'environment' | 'user') => {
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("qr-reader");
      }
      if (scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }
      
      await scannerRef.current.start(
        { facingMode: mode },
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
        handleScanSuccess,
        undefined
      );
      setIsCameraActive(true);
      setFacingMode(mode);
    } catch (err) {
      console.error("Camera start error:", err);
      setIsCameraActive(false);
    }
  };

  useEffect(() => {
    startCamera('environment');

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleCamera = () => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    startCamera(newMode);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode("qr-reader");
    }
    
    try {
      if (scannerRef.current.isScanning) {
        await scannerRef.current.stop();
        setIsCameraActive(false);
      }
      const decodedText = await scannerRef.current.scanFile(file, true);
      handleScanSuccess(decodedText);
    } catch (err) {
      console.error(err);
      alert('Could not find or decode a QR code in the image.');
      startCamera(facingMode); // restart camera
    }
    
    // clear input
    e.target.value = '';
  };

  const handleScanAnother = () => {
    setScanResult(null);
    startCamera(facingMode);
  };

  const handleCopy = () => {
    if (scanResult) {
      navigator.clipboard.writeText(scanResult);
    }
  };

  const parsedData = scanResult ? parseQRCode(scanResult) : null;

  const handleOpen = () => {
    if (!parsedData) return;

    if (parsedData.type === 'URL') {
      window.open(parsedData.url, '_blank', 'noopener,noreferrer');
    } else if (parsedData.type === 'Email') {
      window.open(`mailto:${parsedData.email}`, '_self');
    } else if (parsedData.type === 'Phone') {
      window.open(`tel:${parsedData.phone}`, '_self');
    } else if (parsedData.type === 'SMS') {
      window.open(`sms:${parsedData.phone}`, '_self');
    } else if (parsedData.type === 'Contact') {
      // For contacts, we can create a downloadable vCard if it's not already,
      // or if it is already a vcard, serve it as blob.
      const blob = new Blob([parsedData.text], { type: 'text/vcard' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${parsedData.name || 'contact'}.vcf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (parsedData.type === 'Text') {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(parsedData.text)}`, '_blank', 'noopener,noreferrer');
    }
  };

  const getActionDetails = () => {
    if (!parsedData) return { label: 'Open', icon: ExternalLink };
    
    switch (parsedData.type) {
      case 'URL': return { label: 'Open Link', icon: Globe };
      case 'Email': return { label: 'Send Email', icon: Mail };
      case 'Phone': return { label: 'Call Number', icon: Phone };
      case 'SMS': return { label: 'Send SMS', icon: MessageSquare };
      case 'Contact': return { label: 'Add Contact', icon: UserPlus };
      case 'Text': return { label: 'Search Web', icon: Search };
      case 'WiFi': return { label: 'Copy Password', icon: Copy, isWifiPass: true };
      default: return { label: 'Open', icon: ExternalLink };
    }
  };

  const actionDetails = getActionDetails();
  const ActionIcon = actionDetails.icon;

  return (
    <div className="flex flex-col h-full space-y-6 pb-24 px-4 sm:px-6 pt-6 max-w-md mx-auto w-full">
      <div className="text-center space-y-2 mb-2">
        <h2 className="text-2xl font-bold tracking-tight">Scan Code</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Point your camera at a QR code to read it
        </p>
      </div>

      <div className={scanResult ? 'hidden' : 'block space-y-4'}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-slate-900 ring-4 ring-slate-100 dark:ring-slate-800 shadow-xl min-h-[300px]"
        >
          <div id="qr-reader" className="w-full h-full [&>video]:object-cover" />
          
          {isCameraActive && (
            <div className="absolute top-4 right-4 z-10 flex space-x-2">
              <button 
                onClick={toggleCamera} 
                className="p-3 bg-black/50 backdrop-blur-md text-white rounded-full hover:bg-black/70 transition-colors shadow-lg"
                title="Switch Camera"
              >
                <SwitchCamera className="w-5 h-5" />
              </button>
            </div>
          )}

          {!isCameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-900 text-center z-20">
              <Camera className="w-12 h-12 text-slate-500 mb-4" />
              <button
                onClick={() => startCamera(facingMode)}
                className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full shadow-md transition-colors"
              >
                QR ကုဒ် စကင်န်ဖတ်ရန် ကင်မရာ ခွင့်ပြုချက် လိုအပ်ပါသည်
              </button>
            </div>
          )}
        </motion.div>

        {!scanResult && (
          <label className="flex items-center justify-center space-x-2 py-3.5 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-medium transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 shadow-sm">
            <ImagePlus className="w-5 h-5 opacity-70" />
            <span>Scan from Photo Gallery</span>
            <input type="file" accept="image/png, image/jpeg, image/jpg" className="hidden" onChange={handleFileUpload} />
          </label>
        )}
      </div>

      {scanResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700 space-y-6"
        >
          <div className="flex items-center justify-center w-16 h-16 bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400 rounded-full mx-auto">
            <ActionIcon className="w-8 h-8" />
          </div>
          
          <div className="text-center">
            <h3 className="font-semibold text-lg">{parsedData?.type === 'Text' ? 'Scan Successful' : parsedData?.type}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Result from the scanned code
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 space-y-2">
            {parsedData?.type === 'WiFi' ? (
              <div className="space-y-3">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Network Name</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white break-all">{parsedData.ssid}</span>
                </div>
                {parsedData.password && (
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Password</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white break-all">{parsedData.password}</span>
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Security</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{parsedData.encryption}</span>
                </div>
              </div>
            ) : parsedData?.type === 'Contact' ? (
              <div className="space-y-3">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Name</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white break-all">{parsedData.name}</span>
                </div>
                {parsedData.phone && (
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Phone</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{parsedData.phone}</span>
                  </div>
                )}
                {parsedData.email && (
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Email</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white break-all">{parsedData.email}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="break-all text-sm font-medium text-slate-900 dark:text-white">
                {scanResult}
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={parsedData?.type === 'WiFi' && parsedData?.password ? () => navigator.clipboard.writeText(parsedData.password || '') : handleCopy}
              className="flex-1 flex items-center justify-center space-x-2 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-xl font-medium transition-colors"
            >
              <Copy className="w-4 h-4" />
              <span>{parsedData?.type === 'WiFi' && parsedData?.password ? 'Copy Pass' : 'Copy'}</span>
            </button>
            <button
              onClick={handleOpen}
              className="flex-1 flex items-center justify-center space-x-2 py-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 rounded-xl font-medium transition-colors"
            >
              <ActionIcon className="w-4 h-4" />
              <span>{actionDetails.label}</span>
            </button>
          </div>

          <button
            onClick={handleScanAnother}
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
