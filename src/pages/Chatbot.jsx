import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

const QUICK_PROMPTS = [
  'Can I donate blood today?',
  'What are pre-donation precautions?',
  'What should I eat after donating?',
  'Which blood group is universal donor?',
  'What is the minimum age to donate?',
];

export default function Chatbot() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Namaskaram! 🙏 I'm RedConnect, your blood donation assistant.\n\nI can help you with:\n• Checking your donation eligibility\n• Pre & post-donation guidance\n• Blood group information\n• Hospital info in ${user?.district || 'your district'}\n\nHow can I help you today?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;

    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setInput('');
    setLoading(true);

    try {
      console.log("Sending:", msg);
      const { data } = await api.post('/chatbot/message', {
        message: msg
      });

      let reply = data.reply;

      // Append hospital info if returned
      if (data.hospitalInfo) {
        reply += `\n\n🏥 **Hospitals in ${data.hospitalInfo.district}:**\n${data.hospitalInfo.hospitals.map((h) => `• ${h}`).join('\n')}`;
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: reply, isErrorFallback: data.isErrorFallback }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      
      {/* Header */}
      <div className="bg-text-primary text-white px-6 py-4 border-b-4 border-primary">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="p-2 bg-primary">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <p className="font-black text-sm">RedConnect AI</p>
            <p className="text-xs text-gray-400">Powered by OpenRouter · Blood Donation Assistant</p>
          </div>
          <div className="ml-auto">
            <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 font-medium">
              ● Online
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot size={16} className="text-white" />
                  </div>
                )}
                <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'}>
                  <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{msg.content}</p>
                  {msg.isErrorFallback && (
                    <button 
                      onClick={() => sendMessage(messages[i-1].content)} 
                      className="mt-3 flex items-center gap-1 text-xs bg-bg-darker hover:bg-gray-200 text-text-primary px-3 py-1.5 rounded transition-colors"
                    >
                      <RefreshCw size={12} /> Retry Action
                    </button>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 bg-bg-darker flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User size={16} className="text-text-muted" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-primary flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div className="chat-bubble-bot flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-text-muted animate-bounce" style={{ borderRadius: '50%', animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-text-muted animate-bounce" style={{ borderRadius: '50%', animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-text-muted animate-bounce" style={{ borderRadius: '50%', animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Quick Prompts */}
      {!input.trim() && (
        <div className="max-w-3xl mx-auto px-4 pb-2">
          <p className="text-xs text-text-muted mb-2 font-medium">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => sendMessage(p)}
                className="text-xs border border-bg-darker bg-white px-3 py-2 hover:border-primary hover:text-primary transition-colors font-medium"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t-2 border-bg-darker bg-white">
        <div className="max-w-3xl mx-auto px-4 py-3 flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 input resize-none h-12 py-3 text-sm"
            placeholder="Ask about eligibility, precautions, blood types..."
            rows={1}
            disabled={loading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="btn-primary px-4 py-3 disabled:opacity-40"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
