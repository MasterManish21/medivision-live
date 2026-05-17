import { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, Trash2 } from 'lucide-react';
import { chatMessage } from '../services/api';

let msgIdCounter = 0;
const newId = () => ++msgIdCounter;

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    {
      id: newId(),
      from: 'bot',
      text: "Hi! I'm Medivision AI Medical Assistant. I help with health and medical questions. Ask me about symptoms, conditions, treatments, or any medical concerns. ⚕️"
    }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [sessionId] = useState('default');
  const [analysisContext, setAnalysisContext] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Load analysis context from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('medivision:lastAnalysis');
      if (raw) setAnalysisContext(JSON.parse(raw));
    } catch {
      setAnalysisContext(null);
    }
  }, []);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || typing) return;

    // Add user message
    setMessages(prev => [...prev, { id: newId(), from: 'user', text }]);
    setInput('');
    setTyping(true);

    try {
      const response = await chatMessage(text, sessionId, analysisContext);
      setMessages(prev => [...prev, {
        id: newId(),
        from: 'bot',
        text: response.reply,
        mode: response.mode
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: newId(),
        from: 'bot',
        text: "Sorry, I encountered an error. Please try again.",
        mode: 'error'
      }]);
    } finally {
      setTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: newId(),
      from: 'bot',
      text: "Hi! I'm Medivision AI Medical Assistant. I help with health and medical questions. Ask me about symptoms, conditions, treatments, or any medical concerns. ⚕️"
    }]);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 overflow-hidden">
      {/* ── Header ── */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">Medivision Medical Assistant</h1>
              <p className="text-xs text-primary-600 dark:text-primary-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Online & Ready to Help
              </p>
            </div>
          </div>
          <button
            onClick={clearChat}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Clear chat"
          >
            <Trash2 className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
        </div>
      </div>

      {/* ── Medical Disclaimer ── */}
      <div className="flex-shrink-0 px-6 py-3 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wide flex items-center gap-2">
            <span>⚕️</span>
            <span>Medical Assistant Only</span>
          </p>
          <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
            This AI assistant is designed for health-related queries only. For emergencies, please call your local emergency services (911 in US, 112 in EU).
          </p>
        </div>
      </div>

      {/* ── Messages Area ── */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-6 py-6"
      >
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map(msg => {
            const isBlocked = msg.mode === 'blocked';
            const isError = msg.mode === 'error';

            return (
              <div
                key={msg.id}
                className={`flex items-end gap-3 animate-fade-in ${msg.from === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-md ${msg.from === 'bot'
                      ? isBlocked || isError
                        ? 'bg-red-500'
                        : 'bg-gradient-to-br from-primary-500 to-accent-500'
                      : 'bg-slate-600'
                    }`}
                >
                  {msg.from === 'bot' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className={`max-w-xl lg:max-w-2xl px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.from === 'user'
                    ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-br-sm shadow-md'
                    : isBlocked || isError
                      ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 rounded-bl-sm border border-red-200 dark:border-red-700 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm shadow-md border border-slate-200 dark:border-slate-700'
                  }`}>
                  {msg.text}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {typing && (
            <div className="flex items-end gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex-shrink-0 flex items-center justify-center text-white shadow-md">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-sm shadow-md border border-slate-200 dark:border-slate-700">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Input Area ── */}
      <div className="flex-shrink-0 px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me about symptoms, conditions, treatments..."
            disabled={typing}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || typing}
            className="px-4 py-3 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 active:scale-95 text-white font-semibold flex items-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 text-sm"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
