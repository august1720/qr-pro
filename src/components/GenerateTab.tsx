import { QRCodeSVG } from 'qrcode.react';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, Share2, Type, Link, Wifi, Phone, Mail, 
  MessageCircle, Send, PhoneCall, MessageSquare, 
  Facebook, Instagram, Twitter, Music2, Youtube, Linkedin, Ghost, Gamepad2, Twitch, Cat, ImagePlus, X, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
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

  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchValues, setBatchValues] = useState('');
  const [animationStyle, setAnimationStyle] = useState<'none' | 'pulse' | 'float' | 'color-shift'>('pulse');

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
  const formatData = (currentType: string, val: string) => {
    if (!val && currentType !== 'WiFi') return '';
    val = val.trim();
    switch(currentType) {
      case 'WiFi':
        return `WIFI:T:${wifiType};S:${val || value};P:${wifiPass};;`;
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

  const getFormattedData = () => formatData(type, value);

  const formattedData = getFormattedData();
  const svgRef = useRef<SVGSVGElement>(null);
  const svgRefs = useRef<(SVGSVGElement | null)[]>([]);

  const batchList = isBatchMode 
    ? batchValues.split('\n').filter(v => v.trim().length > 0)
    : [];

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

  const handleBatchDownload = async () => {
    if (batchList.length === 0) return;
    const zip = new JSZip();
    
    const promises = batchList.map((val, index) => {
      return new Promise<void>((resolve) => {
        const svg = svgRefs.current[index];
        if (!svg) { resolve(); return; }
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
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
            
            const pngData = canvas.toDataURL('image/png').split(',')[1];
            zip.file(`QR_${type}_${index + 1}.png`, pngData, { base64: true });
            
            onSave({
              id: Math.random().toString(36).substr(2, 9),
              type,
              data: formatData(type, val),
              createdAt: Date.now(),
              label: val || `Batch item ${index + 1}`
            });
            resolve();
          } else {
            resolve();
          }
        };
        img.onerror = () => resolve();
        img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
      });
    });

    await Promise.all(promises);
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `QR_Batch_${Date.now()}.zip`);
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

  const getAnimationProps = () => {
    switch(animationStyle) {
      case 'pulse':
        return {
          animate: { 
            boxShadow: ['0px 0px 0px rgba(79, 70, 229, 0)', '0px 8px 30px rgba(79, 70, 229, 0.4)', '0px 0px 0px rgba(79, 70, 229, 0)'] 
          },
          transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        };
      case 'float':
        return {
          animate: { y: [0, -10, 0] },
          transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        };
      case 'color-shift':
        return {
          animate: { filter: ['hue-rotate(0deg)', 'hue-rotate(180deg)', 'hue-rotate(0deg)'] },
          transition: { duration: 5, repeat: Infinity, ease: "linear" }
        };
      default:
        return {};
    }
  };

  const animProps = getAnimationProps();

  const isPreviewVisible = isBatchMode ? batchList.length > 0 : !!formattedData;
  const previewData = isBatchMode ? formatData(type, batchList[0]) : formattedData;

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
        <div className="flex items-center justify-between ml-1">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Content
          </label>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-slate-500">Batch Mode</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={isBatchMode}
                onChange={(e) => setIsBatchMode(e.target.checked)}
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
        
        {isBatchMode ? (
          <div className="space-y-2">
            <textarea
              placeholder={`Enter multiple items, one per line:\n${TYPE_CONFIG[type].placeholder}\n...`}
              value={batchValues}
              onChange={(e) => setBatchValues(e.target.value)}
              rows={6}
              className="w-full px-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm transition-all resize-none text-sm leading-relaxed"
            />
            <p className="text-xs text-slate-500 ml-1">Generated QR codes will be available for batch download.</p>
          </div>
        ) : type === 'WiFi' ? (
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
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Animation Style</label>
            </div>
            <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-900/50 p-1 border border-slate-100 dark:border-slate-800 rounded-xl">
              {(['none', 'pulse', 'float', 'color-shift'] as const).map(anim => (
                <button
                  key={anim}
                  onClick={() => setAnimationStyle(anim)}
                  className={cn(
                    "py-1.5 text-sm font-semibold rounded-lg transition-all capitalize",
                    animationStyle === anim 
                      ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400" 
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  )}
                >
                  {anim.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

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

      {/* Batch Renderer (Hidden) */}
      {isBatchMode && batchList.length > 0 && (
        <div style={{ display: 'none' }}>
          {batchList.map((val, idx) => (
            <QRCodeSVG
              key={`batch-${idx}`}
              value={formatData(type, val)}
              size={200}
              level={errorCorrection}
              fgColor={fgColor}
              bgColor={bgColor}
              ref={(el) => (svgRefs.current[idx] = el)}
              {...(logoUrl ? {
                imageSettings: {
                  src: logoUrl,
                  height: logoSize,
                  width: logoSize,
                  excavate: logoExcavate,
                }
              } : {})}
            />
          ))}
        </div>
      )}

      {/* Preview Section */}
      <AnimatePresence mode="popLayout">
        {isPreviewVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="flex flex-col items-center bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-100 dark:border-slate-700/50 mt-4 relative group"
            whileHover={animationStyle !== 'none' ? { y: -4, transition: { duration: 0.2 } } : {}}
          >
            {isBatchMode && (
               <div className="absolute top-4 right-4 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center shadow-sm">
                 <Layers className="w-3.5 h-3.5 mr-1" />
                 {batchList.length} items
               </div>
            )}
            
            <motion.div 
              className="p-4 shadow-sm relative z-10" 
              style={{ backgroundColor: bgColor, borderRadius: `${cornerRadius}px` }}
              {...animProps}
            >
              <QRCodeSVG
                value={previewData}
                size={200}
                level={errorCorrection}
                fgColor={fgColor}
                bgColor={bgColor}
                ref={!isBatchMode ? svgRef : undefined}
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
              {isBatchMode ? (
                <button
                  onClick={handleBatchDownload}
                  className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-2xl font-medium transition-all shadow-md shadow-indigo-500/25"
                >
                  <Layers className="w-5 h-5" />
                  <span>Download {batchList.length} QRs (.zip)</span>
                </button>
              ) : (
                <>
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
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
