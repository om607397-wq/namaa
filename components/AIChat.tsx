import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, User, Zap, Compass, Trash2, ChevronDown } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendMessageToGemini } from '../services/ai';
import { getProfile, getChatHistory, saveChatHistory, clearChatHistory } from '../services/storage';

const QUICK_PROMPTS = [
  "كيف أنظم وقتي اليوم؟ 🗓️",
  "خطة لمذاكرة الفيزياء ⚛️",
  "عايز أقرب من ربنا 🤲",
  "نصيحة لزيادة التركيز 🧠",
  "إيه ميزات التطبيق؟ 📱"
];

export const AIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]); 
  const [userName, setUserName] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load History and Profile
  useEffect(() => {
    const profile = getProfile();
    setUserName(profile.name);

    const history = getChatHistory();
    if (history && history.length > 0) {
      setMessages(history);
    }
  }, []);

  // Save History whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory(messages);
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => scrollToBottom(), 100);
      // On mobile, focusing immediately might trigger keyboard and resize oddly, 
      // slight delay helps.
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [messages, isOpen]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Call AI Service
    const responseText = await sendMessageToGemini(messages, text);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  const handleClear = () => {
    if(confirm('هل تريد مسح سجل المحادثة بالكامل؟')) {
      clearChatHistory();
      setMessages([]);
    }
  };

  // Helper to render text with bold formatting (**text**)
  const renderText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="text-indigo-200 dark:text-indigo-400 font-bold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 left-4 md:bottom-8 md:left-8 w-14 h-14 md:w-16 md:h-16 bg-gradient-to-tr from-indigo-600 via-purple-600 to-fuchsia-600 text-white rounded-full shadow-[0_0_30px_rgba(79,70,229,0.5)] hover:shadow-[0_0_50px_rgba(79,70,229,0.7)] hover:scale-110 transition-all flex items-center justify-center z-[150] group animate-in zoom-in duration-300 border-2 border-white/20"
        >
          <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-[ping_2s_infinite] opacity-30"></div>
          <Sparkles className="absolute top-3 right-3 text-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity duration-500" size={14} />
          <Bot size={28} className="md:w-8 md:h-8 drop-shadow-lg" />
        </button>
      )}

      {/* Chat Interface Container */}
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-end md:items-end md:justify-start md:p-6 pointer-events-none">
          
          {/* Backdrop for Desktop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto transition-opacity"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Chat Box - Fully Responsive Logic */}
          <div className="
            pointer-events-auto 
            w-full h-[100dvh] md:h-[600px] md:max-h-[85vh] md:w-[380px] lg:w-[400px]
            bg-white dark:bg-dark-900 
            md:rounded-[2rem] rounded-none
            shadow-2xl border border-gray-200 dark:border-gray-800
            flex flex-col overflow-hidden 
            animate-in slide-in-from-bottom-10 fade-in duration-300
            relative
          ">
            
            {/* Header - Fixed Height */}
            <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-fuchsia-900 p-4 shrink-0 flex justify-between items-center text-white relative shadow-lg z-20">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
              
              <div className="flex items-center gap-3 relative z-10">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg border border-white/20">
                    <Bot size={24} className="text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-indigo-900 rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">رفيق</h3>
                  <p className="text-indigo-200 text-[10px] font-medium">مساعدك الذكي</p>
                </div>
              </div>

              <div className="flex gap-2 relative z-10">
                {messages.length > 0 && (
                  <button 
                    onClick={handleClear}
                    className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors backdrop-blur-sm text-red-200 hover:text-red-100"
                    title="مسح المحادثة"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
                <button 
                  onClick={() => setIsOpen(false)}
                  className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors backdrop-blur-sm"
                >
                  <ChevronDown size={22} />
                </button>
              </div>
            </div>

            {/* Chat Body - Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gradient-to-b from-gray-50 to-white dark:from-dark-950 dark:to-dark-900 custom-scrollbar">
              
              {/* Empty State */}
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in duration-500 pb-10">
                   <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-2 shadow-inner">
                      <Compass size={40} className="text-indigo-500" strokeWidth={1.5} />
                   </div>
                   <div>
                     <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
                       أهلاً بك يا {userName || 'بطل'}! 👋
                     </h3>
                     <p className="text-gray-500 dark:text-gray-400 max-w-[200px] mx-auto text-xs leading-relaxed">
                       أنا هنا لمساعدتك في تنظيم وقتك، إجابة أسئلتك، ومتابعة إنجازك.
                     </p>
                   </div>

                   <div className="w-full space-y-2 px-2">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 text-right">جرب أن تسأل:</p>
                      {QUICK_PROMPTS.map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(prompt)}
                          className="w-full text-right p-3 rounded-xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-gray-700 hover:border-indigo-500 hover:shadow-md transition-all text-xs font-medium text-gray-700 dark:text-gray-200 group flex items-center justify-between"
                        >
                          {prompt}
                          <Send size={12} className="opacity-0 group-hover:opacity-100 text-indigo-500 transition-opacity transform rotate-180" />
                        </button>
                      ))}
                   </div>
                </div>
              )}

              {/* Messages List */}
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in slide-in-from-bottom-2 duration-300`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-white/10 mt-1 ${
                    msg.role === 'user' 
                      ? 'bg-gray-200 dark:bg-dark-700 text-gray-600 dark:text-gray-300' 
                      : 'bg-gradient-to-tr from-indigo-500 to-purple-600 text-white'
                  }`}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>

                  <div className="flex flex-col gap-1 max-w-[85%]">
                    <div 
                      className={`py-3 px-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                        msg.role === 'user' 
                          ? 'bg-indigo-600 text-white rounded-tr-none' 
                          : 'bg-white dark:bg-dark-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-tl-none'
                      }`}
                    >
                      {msg.role === 'model' ? renderText(msg.text) : msg.text}
                    </div>
                    <span className="text-[9px] text-gray-400 px-1 opacity-70">
                      {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-2 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shrink-0">
                    <Bot size={16} />
                  </div>
                  <div className="bg-white dark:bg-dark-800 p-3 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-1">
                     <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                     <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                     <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-1" />
            </div>

            {/* Input Area - Fixed at Bottom */}
            <form 
              onSubmit={handleFormSubmit} 
              className="shrink-0 p-3 bg-white dark:bg-dark-900 border-t border-gray-100 dark:border-gray-800 safe-area-bottom z-20"
            >
              <div className="relative flex items-center gap-2 group focus-within:ring-2 focus-within:ring-indigo-500/30 rounded-full bg-gray-100 dark:bg-black/30 transition-all">
                <input 
                  ref={inputRef}
                  type="text" 
                  placeholder="اكتب سؤالك هنا..." 
                  className="w-full pl-4 pr-12 py-3 bg-transparent border-none rounded-full focus:outline-none dark:text-white text-sm"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute left-1.5 top-1.5 bottom-1.5 bg-indigo-600 text-white w-10 h-10 rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-md flex items-center justify-center"
                >
                  {isLoading ? <Zap size={18} className="animate-pulse" /> : <Send size={18} className="rotate-180 ml-0.5" />}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};