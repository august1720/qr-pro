import { QRCodeSVG } from 'qrcode.react';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, Share2, Type, Link, Wifi, Phone, Mail, 
  MessageCircle, Send, PhoneCall, MessageSquare, 
  Facebook, Instagram, Twitter, Music2, Youtube, Linkedin, Ghost, Gamepad2, Twitch, Cat
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRDataType, QRHistoryItem } from '../types';
import { cn } from '../lib/utils';

interface GenerateTabProps {
  onSave: (item: QRHistoryItem) => void;
}

const TYPE_CONFIG: Record<string, { icon: any, placeholder: string }> = {
  Text: { icon: Type, placeholder: 'Enter text here...' },
  URL: { icon: Link, placeholder: 'https://example.com' },
  WiFi: { icon: Wifi, placeholder: 'Network name' },
  Phone: { icon: Phone, placeholder: '+1 234 567 8900' },
  Email: { icon: Mail, placeholder: 'hello@example.com' },
  WhatsApp: { icon: MessageCircle, placeholder: 'Phone Number (with + code)' },
  Telegram: { icon: Send, placeholder: 'Telegram Username' },
  Viber: { icon: PhoneCall, placeholder: 'Phone Number' },
  Line: { icon: MessageSquare, placeholder: 'LINE ID or Link' },
  WeChat: { icon: MessageCircle, placeholder: 'WeChat ID' },
  Skype: { icon: PhoneCall, placeholder: 'Skype Username' },
  Facebook: { icon: Facebook, placeholder: 'Facebook Profile link' },
  Instagram: { icon: Instagram, placeholder: 'Instagram Username' },
  Twitter: { icon: Twitter, placeholder: 'Twitter/X Username' },
  TikTok: { icon: Music2, placeholder: 'TikTok Username' },
  YouTube: { icon: Youtube, placeholder: 'YouTube Channel' },
  LinkedIn: { icon: Linkedin, placeholder: 'LinkedIn Profile' },
  Snapchat: { icon: Ghost, placeholder: 'Snapchat Username' },
  Discord: { icon: Gamepad2, placeholder: 'Discord Invite Link' },
  Twitch: { icon: Twitch, placeholder: 'Twitch Channel' },
  Reddit: { icon: Cat, placeholder: 'Reddit Username' },
  Pinterest: { icon: Link, placeholder: 'Pinterest Username' },
};

export default function GenerateTab({ onSave }: GenerateTabProps) {
  const [type, setType] = useState<QRDataType>('URL');
  const [value, setValue] = useState('');
  const [wifiPass, setWifiPass] = useState('');
  const [wifiType, setWifiType] = useState('WPA');
  
  // Format data based on type
  const getFormattedData = () => {
    if (!value && type !== 'WiFi') return '';
    let val = value.trim();
    switch(type) {
      case 'WiFi':
        return `WIFI:T:${wifiType};S:${value};P:${wifiPass};;`;
      case 'Phone':
        return `tel:${val}`;
      case 'Email':
        return `mailto:${val}`;
      case 'WhatsApp': {
        const phone = val.replace(/[^0-9+]/g, '');
        return `https://wa.me/${phone}`;
      }
      case 'Telegram':
        return val.startsWith('http') ? val : `https://t.me/${val.replace(/^@/, '')}`;
      case 'Viber': {
        const phone = val.replace(/[^0-9+]/g, '');
        return `viber://chat?number=${phone}`;
      }
      case 'Line':
        return val.startsWith('http') ? val : `https://line.me/R/ti/p/~${val.replace(/^@/, '')}`;
      case 'WeChat':
        return `weixin://dl/chat?${val}`;
      case 'Skype':
        return `skype:${val}?chat`;
      case 'Facebook':
        return val.startsWith('http') ? val : `https://facebook.com/${val}`;
      case 'Instagram':
        return val.startsWith('http') ? val : `https://instagram.com/${val.replace(/^@/, '')}`;
      case 'Twitter':
        return val.startsWith('http') ? val : `https://twitter.com/${val.replace(/^@/, '')}`;
      case 'TikTok':
        return val.startsWith('http') ? val : `https://tiktok.com/@${val.replace(/^@/, '')}`;
      case 'YouTube':
        return val.startsWith('http') ? val : `https://youtube.com/@${val.replace(/^@/, '')}`;
      case 'LinkedIn':
        return val.startsWith('http') ? val : `https://linkedin.com/in/${val}`;
      case 'Snapchat':
        return val.startsWith('http') ? val : `https://snapchat.com/add/${val.replace(/^@/, '')}`;
      case 'Discord':
        return val.startsWith('http') ? val : `https://discord.gg/${val}`;
      case 'Twitch':
        return val.startsWith('http') ? val : `https://twitch.tv/${val}`;
      case 'Reddit':
        return val.startsWith('http') ? val : `https://reddit.com/user/${val}`;
      case 'Pinterest':
        return val.startsWith('http') ? val : `https://pinterest.com/${val}`;
      case 'URL':
        return val.startsWith('http') ? val : `https://${val}`;
      default:
        return val;
    }
  };

  const formattedData = getFormattedData();
  const svgRef = useRef<SVGSVGElement>(null);

  const handleDownload = () => {
    if (!svgRef.current || !formattedData) return;
    const svg = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Create padding and background
      const padding = 24;
      canvas.width = img.width + (padding * 2);
      canvas.height = img.height + (padding * 2);
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, padding, padding);
        
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `QR_${type}_${Date.now()}.png`;
        downloadLink.href = `${pngFile}`;
        downloadLink.click();
        
        onSave({
          id: Math.random().toString(36).substr(2, 9),
          type,
          data: formattedData,
          createdAt: Date.now(),
          label: value || 'Empty'
        });
      }
    };
    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
  };

  const handleShare = async () => {
    if (!formattedData) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'QR Code',
          text: 'Check out this QR Code',
          url: formattedData,
        });
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      alert('Sharing not supported on this browser');
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 pb-24 px-4 sm:px-6 pt-6 max-w-md mx-auto w-full">
      
      {/* Type Selector */}
      <div className="flex overflow-x-auto no-scrollbar py-2 space-x-2">
        {(Object.keys(TYPE_CONFIG) as QRDataType[]).map((t) => {
          const Icon = TYPE_CONFIG[t].icon;
          const isSelected = type === t;
          return (
            <button
              key={t}
              onClick={() => { setType(t); setValue(''); setWifiPass(''); }}
              className={cn(
                "flex items-center space-x-2 whitespace-nowrap px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300",
                isSelected 
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{t}</span>
            </button>
          );
        })}
      </div>

      {/* Input Section */}
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 ml-1">
          Content
        </label>
        
        {type === 'WiFi' ? (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Network Name (SSID)"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm transition-all"
            />
            <div className="flex space-x-3">
              <input
                type="password"
                placeholder="Password"
                value={wifiPass}
                onChange={(e) => setWifiPass(e.target.value)}
                className="w-full px-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm transition-all"
              />
              <select
                value={wifiType}
                onChange={(e) => setWifiType(e.target.value)}
                className="w-32 px-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm transition-all text-slate-700 dark:text-slate-200"
              >
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">None</option>
              </select>
            </div>
          </div>
        ) : (
          <textarea
            placeholder={TYPE_CONFIG[type].placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={4}
            className="w-full px-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm transition-all resize-none"
          />
        )}
      </div>

      {/* Preview Section */}
      <AnimatePresence mode="popLayout">
        {formattedData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="flex flex-col items-center bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-100 dark:border-slate-700/50 mt-4"
          >
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <QRCodeSVG
                value={formattedData}
                size={200}
                level="H"
                ref={svgRef}
                className="w-full h-full"
              />
            </div>
            
            <div className="flex w-full space-x-3 mt-8">
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center space-x-2 py-3.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-2xl font-medium transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span>Share</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center space-x-2 py-3.5 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-2xl font-medium transition-all shadow-md shadow-indigo-500/25"
              >
                <Download className="w-5 h-5" />
                <span>Save PNG</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
