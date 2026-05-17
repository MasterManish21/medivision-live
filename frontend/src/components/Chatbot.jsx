import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2 } from 'lucide-react';
import { chatMessage } from '../services/api';

let msgIdCounter = 0;
const newId = () => ++msgIdCounter;

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMin, setIsMin] = useState(false);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    { id: newId(), from: 'bot', text: "Hi! I'm Medivision AI Medical Assistant. I ONLY help with health and medical queries. I can explain your latest dashboard image report and suggest next steps. ⚕️" }
  ]);
  const [analysisContext, setAnalysisContext] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    if (isOpen && !isMin) inputRef.current?.focus();
  }, [isOpen, isMin]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('medivision:lastAnalysis');
      if (raw) setAnalysisContext(JSON.parse(raw));
    } catch {
      setAnalysisContext(null);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    setMessages(prev => [...prev, { id: newId(), from: 'user', text }]);
    setInput('');
    setTyping(true);

    try {
      const response = await chatMessage(text, 'default', analysisContext);
      setMessages(prev => [...prev, {
        id: newId(),
        from: 'bot',
        text: response.reply,
        mode: response.mode
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: newId(), from: 'bot', text: "Sorry, I'm having trouble connecting to the server right now." }]);
    } finally {
      setTyping(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <>
      {/* ── Floating Button ── */}
      <button
        id="chatbot-toggle"
        onClick={() => { setIsOpen(o => !o); setIsMin(false); }}
        aria-label="Open chatbot"
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-glow flex items-center justify-center transition-all duration-300 ${isOpen
          ? 'bg-red-500 hover:bg-red-600 rotate-0'
          : 'bg-gradient-to-br from-primary-500 to-accent-500 hover:scale-110 animate-bounce-sm'
          }`}
      >
        {isOpen ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white dark:border-slate-900 animate-pulse" />
        )}
      </button>

      {/* ── Chat Window ── */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-80 sm:w-96 transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-75 opacity-0 pointer-events-none'
          }`}
      >
        <div className="card shadow-2xl overflow-hidden flex flex-col" style={{ height: isMin ? 'auto' : '480px' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Medivision AI</p>
                <p className="text-xs text-primary-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse" />
                  Medical Only
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsMin(m => !m)}
              className="text-white/70 hover:text-white transition-colors"
              aria-label="Minimize chatbot"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          {!isMin && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-900/50">
                {/* Medical Disclaimer */}
                <div className="rounded-lg border border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-950/40 px-3 py-2">
                  <p className="text-[11px] font-bold text-amber-800 dark:text-amber-200 uppercase tracking-wide">⚕️ Medical Assistant Only</p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                    This AI helps only with health queries. For non-medical questions, please ask elsewhere.
                  </p>
                </div>
                {analysisContext && (
                  <div className="rounded-xl border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20 px-3 py-2">
                    <p className="text-[11px] font-semibold text-primary-700 dark:text-primary-300">Using latest dashboard analysis</p>
                    <p className="text-xs text-primary-600 dark:text-primary-400">
                      {analysisContext.disease} • {analysisContext.severity} • {analysisContext.confidence ?? 'N/A'}%
                    </p>
                  </div>
                )}

                {messages.map(msg => {
                  const isBlocked = msg.mode === 'blocked';
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 animate-fade-in ${msg.from === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs ${msg.from === 'bot' ? (isBlocked ? 'bg-red-500' : 'bg-gradient-to-br from-primary-500 to-accent-500') : 'bg-slate-600'
                        }`}>
                        {msg.from === 'bot' ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                      </div>
                      <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${msg.from === 'user'
                        ? 'bg-primary-600 text-white rounded-br-sm'
                        : isBlocked ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 shadow-sm rounded-bl-sm border border-red-200 dark:border-red-700'
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm rounded-bl-sm'
                        }`}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })}

                {typing && (
                  <div className="flex items-end gap-2 animate-fade-in">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
                      <div className="flex gap-1">
                        {[0, 1, 2].map(i => (
                          <span key={i} className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                <input
                  ref={inputRef}
                  id="chatbot-input"
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all"
                />
                <button
                  id="chatbot-send"
                  onClick={sendMessage}
                  disabled={!input.trim() || typing}
                  className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
