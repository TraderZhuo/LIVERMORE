import React, { useState, useEffect } from 'react';
import { Settings } from '../types';
import { DEFAULT_SETTINGS, UI_TEXT } from '../constants';
import { normalizeApiEndpoint } from '../services/endpoint';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: Settings) => void;
  onClearHistory: () => void;
  currentSettings: Settings;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onClearHistory,
  currentSettings,
}) => {
  const [localSettings, setLocalSettings] = useState<Settings>(currentSettings);
  
  // Safe access to translation
  const t = UI_TEXT[localSettings.language] || UI_TEXT['zh'];

  useEffect(() => {
    if (isOpen) {
      setLocalSettings(currentSettings);
    }
  }, [isOpen, currentSettings]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setLocalSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleLanguageChange = (lang: 'zh' | 'en') => {
    setLocalSettings(prev => ({ ...prev, language: lang }));
  };

  const handleThemeChange = (theme: 'dark' | 'light') => {
    setLocalSettings(prev => ({ ...prev, theme: theme }));
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const handleReset = () => {
    setLocalSettings(DEFAULT_SETTINGS);
  };

  // Dynamic Styles based on localSettings.theme (preview inside modal)
  const isDark = localSettings.theme === 'dark';
  const modalBg = isDark ? 'bg-[#0a0a0a]/95' : 'bg-[#f5f5dc]/95';
  const textColor = isDark ? 'text-[#d4af37]' : 'text-[#2c2c2c]';
  const borderColor = '#b8860b';
  const inputBg = isDark ? 'bg-black/50' : 'bg-white/50';
  const requestUrl = normalizeApiEndpoint(localSettings.apiEndpoint);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={`relative w-full max-w-2xl border p-6 md:p-8 rounded-sm shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar transition-colors duration-300 ${modalBg} ${textColor}`} style={{ borderColor: `${borderColor}40` }}>
        
        <div className="flex justify-between items-center mb-6 border-b pb-4" style={{ borderColor: `${borderColor}30` }}>
          <h2 className={`text-2xl font-serif tracking-widest ${isDark ? 'text-[#f0e68c]' : 'text-[#8b4513]'}`}>{t.settingsTitle}</h2>
          <button 
            onClick={onClose}
            className="hover:opacity-70 transition-opacity"
            style={{ color: borderColor }}
          >
            ✕
          </button>
        </div>

        <div className="space-y-6 font-mono text-sm">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Language Switcher */}
            <div className="space-y-2">
              <label className="block text-[#8b7d6b] uppercase text-xs tracking-widest">
                {t.languageLabel}
              </label>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleLanguageChange('zh')}
                  className={`flex-1 px-4 py-2 border transition-all ${localSettings.language === 'zh' ? 'bg-[#b8860b] text-white' : 'bg-transparent text-[#8b7d6b]'}`}
                  style={{ borderColor }}
                >
                  中文
                </button>
                <button 
                  onClick={() => handleLanguageChange('en')}
                  className={`flex-1 px-4 py-2 border transition-all ${localSettings.language === 'en' ? 'bg-[#b8860b] text-white' : 'bg-transparent text-[#8b7d6b]'}`}
                  style={{ borderColor }}
                >
                  English
                </button>
              </div>
            </div>

            {/* Theme Switcher */}
            <div className="space-y-2">
              <label className="block text-[#8b7d6b] uppercase text-xs tracking-widest">
                {t.themeLabel}
              </label>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleThemeChange('dark')}
                  className={`flex-1 px-4 py-2 border transition-all ${localSettings.theme === 'dark' ? 'bg-[#1a1a1a] text-[#f0e68c]' : 'bg-transparent text-[#8b7d6b]'}`}
                  style={{ borderColor }}
                >
                  {t.themeDark}
                </button>
                <button 
                  onClick={() => handleThemeChange('light')}
                  className={`flex-1 px-4 py-2 border transition-all ${localSettings.theme === 'light' ? 'bg-[#f5f5dc] text-[#8b4513]' : 'bg-transparent text-[#8b7d6b]'}`}
                  style={{ borderColor }}
                >
                  {t.themeLight}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-[#8b7d6b] uppercase text-xs tracking-widest">
                {t.endpointLabel}
              </label>
              <input
                type="text"
                name="apiEndpoint"
                value={localSettings.apiEndpoint}
                onChange={handleChange}
                placeholder="https://ark.cn-beijing.volces.com/api/v3"
                className={`w-full border p-3 focus:outline-none transition-all ${inputBg}`}
                style={{ borderColor: `${borderColor}30`, color: isDark ? '#d4af37' : '#2c2c2c' }}
              />
               <div className="text-[10px] text-[#8b7d6b] space-y-1">
                <p>{t.pathNote}</p>
                <p className="text-red-400/80">
                  {t.corsWarning}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[#8b7d6b] uppercase text-xs tracking-widest">{t.apiKeyLabel}</label>
              <input
                type="password"
                name="apiKey"
                value={localSettings.apiKey}
                onChange={handleChange}
                placeholder="sk-..."
                className={`w-full border p-3 focus:outline-none transition-all ${inputBg}`}
                style={{ borderColor: `${borderColor}30`, color: isDark ? '#d4af37' : '#2c2c2c' }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[#8b7d6b] uppercase text-xs tracking-widest">
              {t.modelIdLabel}
            </label>
            <input
              type="text"
              name="modelId"
              value={localSettings.modelId}
              onChange={handleChange}
              placeholder="e.g. ep-2025..."
              className={`w-full border p-3 focus:outline-none transition-all ${inputBg}`}
              style={{ borderColor: `${borderColor}30`, color: isDark ? '#d4af37' : '#2c2c2c' }}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[#8b7d6b] uppercase text-xs tracking-widest">
              {t.requestPathLabel}
            </label>
            <div
              className={`w-full border p-3 break-all text-xs leading-relaxed ${inputBg}`}
              style={{ borderColor: `${borderColor}20`, color: isDark ? '#8b7d6b' : '#5f5448' }}
            >
              POST {requestUrl}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[#8b7d6b] uppercase text-xs tracking-widest">{t.promptLabel}</label>
            <textarea
              name="systemPrompt"
              value={localSettings.systemPrompt}
              onChange={handleChange}
              rows={6}
              className={`w-full border p-3 focus:outline-none transition-all resize-none leading-relaxed ${inputBg}`}
              style={{ borderColor: `${borderColor}30`, color: isDark ? '#d4af37' : '#2c2c2c' }}
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mt-8 pt-4 border-t gap-4 md:gap-0" style={{ borderColor: `${borderColor}30` }}>
          <div className="flex space-x-4">
            <button
              onClick={handleReset}
              className="text-xs uppercase tracking-widest text-[#8b7d6b] hover:text-[#b8860b] transition-colors"
            >
              {t.reset}
            </button>
            <span className="text-[#8b7d6b]">|</span>
            <button
              onClick={() => {
                if(window.confirm('Are you sure you want to delete all memories? This cannot be undone.')) {
                  onClearHistory();
                  onClose();
                }
              }}
              className="text-xs uppercase tracking-widest text-red-900/70 hover:text-red-600 transition-colors"
            >
              {t.clearHistory}
            </button>
          </div>
          
          <div className="flex space-x-4">
             <button
              onClick={onClose}
              className="px-6 py-2 border transition-all font-serif italic"
              style={{ borderColor: `${borderColor}30`, color: borderColor }}
            >
              {t.cancel}
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 border font-serif font-bold tracking-wide transition-all"
              style={{ 
                borderColor: borderColor, 
                backgroundColor: `${borderColor}20`, 
                color: isDark ? '#f0e68c' : '#8b4513' 
              }}
            >
              {t.confirm}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
