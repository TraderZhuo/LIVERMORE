import React, { useState, useEffect, useRef } from 'react';
import { Settings, Message } from './types';
import { DEFAULT_SETTINGS, LOCAL_STORAGE_KEY, LOCAL_STORAGE_HISTORY_KEY, UI_TEXT } from './constants';
import { SettingsModal } from './components/SettingsModal';
import { sendMessageToOracle } from './services/api';

const App: React.FC = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Robust translation retrieval
  const t = UI_TEXT[settings.language] || UI_TEXT['zh'];

  // Load settings on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedSettings) {
      try {
        const parsedSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) };

        if (!parsedSettings.modelId || parsedSettings.modelId.startsWith('cm-')) {
          parsedSettings.modelId = DEFAULT_SETTINGS.modelId;
        }

        setSettings(parsedSettings);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsedSettings));
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
  }, []);

  // Load history on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) {
          setMessages(parsed);
        }
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
    setHasLoadedHistory(true);
  }, []);

  // Save settings when changed
  const handleSaveSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSettings));
  };

  // Save history when messages change
  useEffect(() => {
    if (!hasLoadedHistory) return;

    localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(messages));
    if (!isLoading) {
      scrollToBottom();
    }
  }, [messages, isLoading, hasLoadedHistory]);

  const handleClearHistory = () => {
    setMessages([]);
    localStorage.removeItem(LOCAL_STORAGE_HISTORY_KEY);
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(id);
      setTimeout(() => setCopyFeedback(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const processSubmission = async (currentMessages: Message[], newMsg: Message) => {
    setIsLoading(true);
    setMessages([...currentMessages, newMsg]);

    try {
      const responseContent = await sendMessageToOracle([...currentMessages, newMsg], settings);
      
      const assistantMsg: Message = {
        role: 'assistant',
        content: responseContent,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error: any) {
      const errorMsg: Message = {
        role: 'assistant',
        content: `[SYSTEM ERROR] ${error.message || 'Connection severed.'}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };
    setInput('');
    
    await processSubmission(messages, userMsg);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const startEditing = (msg: Message, id: string) => {
    setEditingId(id);
    setEditText(msg.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText('');
  };

  const submitEdit = async (index: number) => {
    if (!editText.trim()) return;
    const newHistory = messages.slice(0, index);
    const newUserMsg: Message = {
      role: 'user',
      content: editText,
      timestamp: Date.now(),
    };
    setEditingId(null);
    await processSubmission(newHistory, newUserMsg);
  };

  const isDark = settings.theme === 'dark';
  const themeClasses = isDark 
    ? 'bg-black text-[#d4af37] bg-noise selection:bg-[#b8860b] selection:text-black' 
    : 'bg-[#f5f5dc] text-[#2c2c2c] selection:bg-[#b8860b] selection:text-white';
  
  const headerBg = isDark ? 'bg-black/80 border-[#b8860b]/30' : 'bg-[#f5f5dc]/90 border-[#b8860b]/30';
  const titleColor = isDark ? 'text-[#f0e68c]' : 'text-[#8b4513]';
  const userBubbleClass = isDark ? 'bg-zinc-950/80 border-zinc-700/70 text-gray-200' : 'bg-white/75 border-gray-300 text-gray-800';
  const aiBubbleClass = isDark
    ? 'bg-[#101006]/90 border-[#b8860b]/45 text-[#f0e68c] shadow-[0_0_22px_rgba(184,134,11,0.12)]'
    : 'bg-[#1a1a1a] border-[#b8860b]/30 text-[#f0e68c] shadow-lg'; 
  const inputContainerClass = isDark
    ? 'bg-[#060606]/95 border border-[#b8860b]/35 shadow-[0_12px_46px_rgba(0,0,0,0.62),0_0_18px_rgba(184,134,11,0.06)] focus-within:border-[#f0e68c]/80 focus-within:shadow-[0_0_0_1px_rgba(240,230,140,0.14),0_20px_70px_rgba(0,0,0,0.7),0_0_38px_rgba(184,134,11,0.24)]'
    : 'bg-white/95 border border-[#b8860b]/65 shadow-[0_12px_36px_rgba(44,44,44,0.12)] focus-within:border-[#8b4513] focus-within:shadow-[0_14px_42px_rgba(139,69,19,0.16)]';
  const inputTextClass = isDark ? 'text-[#f0e68c] placeholder-[#b8860b]/55' : 'text-[#2c2c2c] placeholder-[#8b7d6b]/65';
  
  // Dynamic Footer Gradient
  const footerGradient = isDark 
    ? 'bg-gradient-to-t from-black via-black/95 to-black/0' 
    : 'bg-gradient-to-t from-[#f5f5dc] via-[#f5f5dc]/95 to-[#f5f5dc]/0';

  return (
    // CHANGED: h-screen overflow-hidden to freeze layout
    <div className={`relative h-screen overflow-hidden flex flex-col font-mono transition-colors duration-500 ${themeClasses}`}>
      
      {/* Background Ambience */}
      <div className={`fixed inset-0 pointer-events-none transition-opacity duration-1000 z-0 ${isDark ? 'opacity-80' : 'opacity-0'}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1a1500] via-[#050400] to-black" />
      </div>

      {/* Header - Fixed Top */}
      <header className={`relative z-20 flex-shrink-0 flex items-center justify-between px-6 py-5 border-b backdrop-blur-md transition-colors duration-300 ${headerBg}`}>
        <div>
          <h1 className={`font-serif text-2xl md:text-3xl tracking-widest transition-colors ${titleColor} drop-shadow-[0_0_8px_rgba(240,230,140,0.3)]`}>
            {t.title}
          </h1>
          <div className="text-[10px] text-[#8b7d6b] tracking-[0.2em] mt-1 uppercase">
            {t.subtitle}
          </div>
        </div>
        
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="group p-2 border border-[#b8860b]/20 rounded-full hover:border-[#b8860b] hover:bg-[#b8860b]/10 transition-all duration-300"
          title={t.settingsTitle}
        >
          <svg className="w-6 h-6 text-[#8b7d6b] group-hover:text-[#f0e68c] group-hover:rotate-90 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </header>

      {/* Chat Area - Scrollable */}
      <main className="relative z-0 flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth custom-scrollbar">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center select-none pb-24">
            <div className="w-24 h-24 border border-[#b8860b]/35 rounded-full flex items-center justify-center mb-6 animate-pulse shadow-[0_0_34px_rgba(184,134,11,0.08)]">
              <span className="font-serif text-5xl italic text-[#b8860b]/50">J.L.</span>
            </div>
            <p className="font-serif text-xl italic text-[#8b7d6b]/70">
              {t.emptyStateQuote}
            </p>
          </div>
        )}

        {messages.map((msg, index) => {
          const msgId = `${index}-${msg.timestamp}`;
          const isUser = msg.role === 'user';
          const isEditing = editingId === msgId;

          return (
            <div key={msgId} className={`flex flex-col max-w-3xl mx-auto animate-[float_0.5s_ease-out] group ${isUser ? 'items-end' : 'items-start'}`}>
              <div className={`relative px-6 py-4 rounded-sm border backdrop-blur-sm min-w-[200px] transition-colors duration-300 ${isUser ? userBubbleClass : aiBubbleClass}`}>
                <div className="flex justify-between items-start gap-4">
                  <div className={`absolute -top-3 left-4 px-2 text-[10px] uppercase tracking-widest text-[#8b7d6b] ${isDark ? 'bg-black' : 'bg-[#f5f5dc]'}`}>
                    {isUser ? t.trader : t.assistant}
                  </div>
                  
                  {isEditing ? (
                    <div className="w-full min-w-[300px]">
                      <textarea 
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full bg-black/20 text-inherit p-2 border border-[#b8860b]/50 focus:outline-none resize-none rounded-sm"
                        rows={3}
                        autoFocus
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button onClick={cancelEditing} className="text-[10px] uppercase text-gray-500 hover:text-gray-300">{t.cancelEdit}</button>
                        <button onClick={() => submitEdit(index)} className="text-[10px] uppercase bg-[#b8860b] text-black px-2 py-1 rounded-sm font-bold hover:bg-[#d4af37]">{t.regenerate}</button>
                      </div>
                    </div>
                  ) : (
                    <div className="font-mono text-sm md:text-base whitespace-pre-wrap leading-relaxed flex-1">
                      {msg.content}
                    </div>
                  )}
                </div>

                <div className={`absolute top-2 right-2 flex gap-1 transition-all duration-300 opacity-0 group-hover:opacity-100 ${isEditing ? 'hidden' : ''}`}>
                   {isUser && (
                     <button onClick={() => startEditing(msg, msgId)} className="p-1.5 rounded-full text-gray-500 hover:text-white bg-gray-800/50" title={t.edit}>
                       <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                       </svg>
                     </button>
                   )}
                  <button onClick={() => copyToClipboard(msg.content, msgId)} className={`p-1.5 rounded-full ${isUser ? 'text-gray-500 hover:text-white bg-gray-800/50' : 'text-[#b8860b] hover:text-[#f0e68c] bg-[#b8860b]/10'}`} title="Copy">
                    {copyFeedback === msgId ? "✓" : <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex flex-col items-start max-w-3xl mx-auto animate-pulse">
            <div className={`border px-6 py-4 rounded-sm ${aiBubbleClass}`}>
               <div className="flex space-x-1 items-center h-6">
                 <div className="w-2 h-2 bg-[#b8860b] animate-bounce delay-0" />
                 <div className="w-2 h-2 bg-[#b8860b] animate-bounce delay-150" />
                 <div className="w-2 h-2 bg-[#b8860b] animate-bounce delay-300" />
               </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Footer - Fixed Bottom */}
      <footer className={`relative z-20 flex-shrink-0 px-4 py-5 md:px-6 md:py-6 ${footerGradient}`}>
        <div className="max-w-4xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#b8860b]/0 via-[#d4af37]/24 to-[#b8860b]/0 opacity-25 blur-md transition duration-500 group-focus-within:opacity-85"></div>
          <div className={`relative flex items-center rounded-sm transition-all duration-300 ${inputContainerClass}`}>
            <span className="pl-4 md:pl-5 text-[#b8860b]/75 text-xl animate-pulse font-bold drop-shadow-[0_0_5px_rgba(212,175,55,0.35)]">❯</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.askPlaceholder}
              className={`min-w-0 w-full bg-transparent border-none px-3 py-4 md:px-4 md:py-5 focus:ring-0 focus:outline-none font-mono text-[15px] md:text-base caret-animate drop-shadow-[0_0_2px_rgba(184,134,11,0.9)] ${inputTextClass}`}
              autoFocus
            />
            <button 
              onClick={() => handleSubmit()}
              disabled={isLoading || !input.trim()}
              className="mr-2 md:mr-3 flex-shrink-0 inline-flex items-center gap-2 border border-[#d4af37]/45 bg-[#d4af37]/10 px-3 py-2 md:px-4 text-[11px] md:text-xs uppercase tracking-widest text-[#f0e68c] hover:bg-[#d4af37] hover:text-black disabled:bg-transparent disabled:text-[#8b7d6b] disabled:border-[#8b7d6b]/20 disabled:opacity-55 transition-all font-bold"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
              {t.execute}
            </button>
          </div>
        </div>
        <div className="text-center mt-3 text-[10px] text-[#8b7d6b] font-mono opacity-55">
          {t.footer}
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        onClearHistory={handleClearHistory}
        currentSettings={settings}
      />
    </div>
  );
};

export default App;
