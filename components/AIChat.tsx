import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, User, Zap, MessageCircle, Compass, Star, ChevronDown } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendMessageToGemini } from '../services/ai';

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
  const [messages, setMessages] = useState<ChatMessage[]>([]); // Start empty to show welcome screen
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 100);
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
          className="fixed bottom-24 left-4 md:bottom-8 md:left-8 w-16 h-16 bg-gradient-to-tr from-indigo-600 via-purple-600 to-fuchsia-600 text-white rounded-full shadow-[0_0_30px_rgba(79,70,229,0.5)] hover:shadow-[0_0_50px_rgba(79,70,229,0.7)] hover:scale-110 transition-all flex items-center justify-center z-50 group animate-in zoom-in duration-300 border-2 border-white/20"
        >
          <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-[ping_2s_infinite] opacity-30"></div>
          <Sparkles className="absolute top-3 right-3 text-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity duration-500" size={14} />
          <Bot size={32} className="drop-shadow-lg" />
        </button>
      )}

      {/* Chat Interface */}
      {isOpen && (
        <div className="fixed bottom-0 left-0 w-full h-[100dvh] md:h-[650px] md:w-[450px] md:bottom-8 md:left-8 bg-white/95 dark:bg-dark-900/95 backdrop-blur-xl md:rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-gray-700/50 z-[100] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-fuchsia-900 p-6 flex justify-between items-start text-white relative shrink-0">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg border border-white/20">
                  <Bot size={32} className="text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-indigo-900 rounded-full"></div>
              </div>
              <div>
                <h3 className="font-bold text-2xl tracking-tight">رفيق</h3>
                <p className="text-indigo-200 text-xs font-medium">مساعدك الذكي لكل شيء</p>
              </div>
            </div>

            <button 
              onClick={() => setIsOpen(false)}
              className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors backdrop-blur-sm"
            >
              <ChevronDown size={24} />
            </button>
          </div>

          {/* Chat Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gradient-to-b from-gray-50 to-white dark:from-dark-950 dark:to-dark-900 custom-scrollbar scroll-smooth relative">
            
            {/* Empty State / Welcome Screen */}
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in duration-500">
                 <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-2">
                    <Compass size={48} className="text-indigo-500" strokeWidth={1.5} />
                 </div>
                 <div>
                   <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">أهلاً بك يا بطل! 👋</h3>
                   <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto text-sm leading-relaxed">
                     أنا رفيق، أعرف كل ركن في تطبيق نماء، وأستطيع مساعدتك في أي سؤال يخطر ببالك.
                   </p>
                 </div>

                 <div className="w-full max-w-sm space-y-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">اقتراحات للبداية</p>
                    {QUICK_PROMPTS.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(prompt)}
                        className="w-full text-right p-4 rounded-2xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-gray-700 hover:border-indigo-500 hover:shadow-md transition-all text-sm font-medium text-gray-700 dark:text-gray-200 group flex items-center justify-between"
                      >
                        {prompt}
                        <Send size={14} className="opacity-0 group-hover:opacity-100 text-indigo-500 transition-opacity transform rotate-180" />
                      </button>
                    ))}
                 </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in slide-in-from-bottom-2 duration-300`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-white/10 ${
                  msg.role === 'user' 
                    ? 'bg-gray-200 dark:bg-dark-700 text-gray-600 dark:text-gray-300' 
                    : 'bg-gradient-to-tr from-indigo-500 to-purple-600 text-white'
                }`}>
                  {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>

                <div className="flex flex-col gap-1 max-w-[85%]">
                  <div 
                    className={`p-4 rounded-3xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-white dark:bg-dark-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-tl-none'
                    }`}
                  >
                    {msg.role === 'model' ? renderText(msg.text) : msg.text}
                  </div>
                  <span className="text-[10px] text-gray-400 px-2 opacity-70">
                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shrink-0">
                  <Bot size={20} />
                </div>
                <div className="bg-white dark:bg-dark-800 p-4 rounded-3xl rounded-tl-none border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-2">
                   <div className="flex space-x-1 space-x-reverse">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleFormSubmit} className="p-4 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 shrink-0">
            <div className="relative flex items-center gap-2 group focus-within:ring-2 focus-within:ring-indigo-500/30 rounded-3xl">
              <input 
                ref={inputRef}
                type="text" 
                placeholder="اسأل رفيق عن أي شيء..." 
                className="w-full pl-4 pr-6 py-4 bg-gray-100 dark:bg-black/30 border-none rounded-3xl focus:outline-none dark:text-white text-sm transition-all"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button 
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute left-2 top-2 bottom-2 bg-indigo-600 text-white px-4 rounded-2xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-md flex items-center justify-center"
              >
                {isLoading ? <Zap size={20} className="animate-pulse" /> : <Send size={20} className="rotate-180" />}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};