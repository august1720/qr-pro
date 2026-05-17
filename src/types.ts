export type QRDataType = 'Text' | 'URL' | 'WiFi' | 'Phone' | 'Email' | 'WhatsApp' | 'Telegram' | 'Viber' | 'Line' | 'WeChat' | 'Skype' | 'Facebook' | 'Instagram' | 'Twitter' | 'TikTok' | 'YouTube' | 'LinkedIn' | 'Snapchat' | 'Discord' | 'Twitch' | 'Reddit' | 'Pinterest';

export interface QRHistoryItem {
  id: string;
  type: QRDataType;
  data: string;
  createdAt: number;
  label?: string;
}

export type Theme = 'light' | 'dark' | 'system';
