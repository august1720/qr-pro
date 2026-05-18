import { QRCodeSVG } from 'qrcode.react';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, Share2, Type, Link, Wifi, Phone, Mail, 
  MessageCircle, Send, PhoneCall, MessageSquare, 
  Facebook, Instagram, Twitter, Music2, Youtube, Linkedin, Ghost, Gamepad2, Twitch, Cat, ImagePlus, X
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
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('H');
  const [cornerRadius, setCornerRadius] = useState<number>(16);

  const [logoSize, setLogoSize] = useState<number>(48);
  const [logoExcavate, setLogoExcavate] = useState<boolean>(true);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoUrl(url);
    }
  };

  const handleRemoveLogo = () => {
    if (logoUrl) {
      URL.revokeObjectURL(logoUrl);
    }
    setLogoUrl(null);
  };
  
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
        ctx.fillStyle = bgColor;
        if (typeof ctx.roundRect === 'function') {
          ctx.beginPath();
          ctx.roundRect(0, 0, canvas.width, canvas.height, cornerRadius);
          ctx.fill();
        } else {
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
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

      {/* Colors Section */}
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 ml-1">
          Colors
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600 focus-within:ring-2 focus-within:ring-indigo-500/50">
              <input 
                type="color" 
                value={fgColor} 
                onChange={(e) => setFgColor(e.target.value)}
                className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
              />
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Foreground</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600 focus-within:ring-2 focus-within:ring-indigo-500/50">
              <input 
                type="color" 
                value={bgColor} 
                onChange={(e) => setBgColor(e.target.value)}
                className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
              />
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Background</span>
          </div>
        </div>
      </div>

      {/* Advanced Options Section */}
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 ml-1">
          Advanced Options
        </label>
        <div className="space-y-6 p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
          
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Error Correction</label>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md">{errorCorrection}</span>
            </div>
            <div className="flex space-x-2 bg-slate-50 dark:bg-slate-900/50 p-1 border border-slate-100 dark:border-slate-800 rounded-xl">
              {(['L', 'M', 'Q', 'H'] as const).map(level => (
                <button
                  key={level}
                  onClick={() => setErrorCorrection(level)}
                  className={cn(
                    "flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all",
                    errorCorrection === level 
                      ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400" 
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Corner Radius</label>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md">{cornerRadius}px</span>
            </div>
            <div className="px-1">
              <input 
                type="range" 
                min="0" 
                max="48" 
                value={cornerRadius}
                onChange={(e) => setCornerRadius(Number(e.target.value))}
                className="w-full accent-indigo-500 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Logo Upload Section */}
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 ml-1">
          Add Logo (Optional)
        </label>
        
        {!logoUrl ? (
          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <ImagePlus className="w-6 h-6 text-slate-400 mb-2" />
              <p className="text-xs text-slate-500 dark:text-slate-400">Click or drag image to upload (PNG, JPG)</p>
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept="image/png, image/jpeg, image/jpg" 
              onChange={handleLogoUpload}
            />
          </label>
        ) : (
          <div className="space-y-4 p-4 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img src={logoUrl} alt="Logo preview" className="w-10 h-10 object-contain rounded-lg bg-white border border-slate-100 dark:border-slate-700" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Custom Logo</span>
              </div>
              <button 
                onClick={handleRemoveLogo}
                className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                title="Remove logo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-700">
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Logo Size</label>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md">{logoSize}px</span>
                </div>
                <div className="px-1">
                  <input 
                    type="range" 
                    min="24" 
                    max="64" 
                    value={logoSize}
                    onChange={(e) => setLogoSize(Number(e.target.value))}
                    className="w-full accent-indigo-500 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Excavate Background</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={logoExcavate}
                    onChange={(e) => setLogoExcavate(e.target.checked)}
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preview Section */}
      <AnimatePresence mode="popLayout">
        {formattedData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="flex flex-col items-center bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-100 dark:border-slate-700/50 mt-4 relative group"
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <motion.div 
              className="p-4 shadow-sm relative z-10" 
              style={{ backgroundColor: bgColor, borderRadius: `${cornerRadius}px` }}
              animate={{ 
                boxShadow: ['0px 0px 0px rgba(79, 70, 229, 0)', '0px 4px 20px rgba(79, 70, 229, 0.1)', '0px 0px 0px rgba(79, 70, 229, 0)'] 
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <QRCodeSVG
                value={formattedData}
                size={200}
                level={errorCorrection}
                fgColor={fgColor}
                bgColor={bgColor}
                ref={svgRef}
                className="w-full h-full transform transition-transform duration-500 group-hover:scale-[1.02]"
                {...(logoUrl ? {
                  imageSettings: {
                    src: logoUrl,
                    height: logoSize,
                    width: logoSize,
                    excavate: logoExcavate,
                  }
                } : {})}
              />
            </motion.div>
            
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
