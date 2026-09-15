import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, X, Send, Bot, User, Loader2, Calendar, 
  Users, DollarSign, Package, ArrowRight, CornerDownLeft, RefreshCw 
} from 'lucide-react';
import { api } from '../lib/api';
import { MarkdownRenderer } from './MarkdownRenderer';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  time: string;
  model?: string;
}

interface StudioAiCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName?: string;
}

interface SuggestionPrompt {
  label: string;
  category: string;
  description: string;
  icon: any;
}

const CATEGORIZED_PROMPTS: SuggestionPrompt[] = [
  { 
    label: 'When is my next shoot and who is booked?', 
    category: 'Shoots & Bookings',
    description: 'Upcoming client shoots, venues & call times',
    icon: Calendar 
  },
  { 
    label: 'How many cameras are available right now?', 
    category: 'Hardware Assets',
    description: 'Real-time inventory and availability status',
    icon: Package 
  },
  { 
    label: 'What are the pending payouts for crew?', 
    category: 'Finances & Ledger',
    description: 'Pending contractor fees and settlement status',
    icon: DollarSign 
  },
  { 
    label: 'What is the day rate for our lead cinematographer?', 
    category: 'Crew & Roster',
    description: 'Technician day rates and active crew info',
    icon: Users 
  }
];

export const StudioAiCopilotModal: React.FC<StudioAiCopilotModalProps> = ({
  isOpen,
  onClose,
  projectName = 'Studio Operations'
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: `Hello! I am **Zorvik AI**.\n\nI have complete real-time visibility into **${projectName}**. You can ask me anything about upcoming shoots, equipment status, technician rates, or financial compensation.`,
      time: 'Just now'
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [isOpen, messages]);

  if (!isOpen) return null;

  const handleSend = async (userQuery?: string) => {
    const textToSend = (userQuery || input).trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      id: String(Date.now()),
      role: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.slice(-5).map((m) => ({
        role: m.role,
        text: m.text
      }));

      const res = await api.askAssistant({
        query: textToSend,
        conversation_history: history
      });

      const assistantMessage: Message = {
        id: String(Date.now() + 1),
        role: 'assistant',
        text: res.answer,
        model: res.model,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: Message = {
        id: String(Date.now() + 1),
        role: 'assistant',
        text: `Error communicating with Zorvik-AI: ${err.message || 'Please check your connection and try again.'}`,
        time: 'Just now'
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white dark:bg-[#0c0c10] border border-ash dark:border-zinc-800 rounded-2xl w-full max-w-2xl shadow-floating overflow-hidden flex flex-col h-[640px] max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-ash dark:border-zinc-800 flex items-center justify-between bg-paper/50 dark:bg-zinc-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-charcoal dark:text-zinc-100">
                  Zorvik AI
                </h3>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Studio Copilot
                </span>
              </div>
              <p className="text-[11px] text-steel dark:text-zinc-400">
                Full intelligence across shoots, inventory, team, and money
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setMessages([
                  {
                    id: 'welcome-reset',
                    role: 'assistant',
                    text: `Conversation reset. How can I help you manage **${projectName}** today?`,
                    time: 'Just now'
                  }
                ]);
              }}
              className="p-1.5 text-fog hover:text-charcoal dark:hover:text-zinc-200 rounded-lg hover:bg-paper dark:hover:bg-zinc-800 transition cursor-pointer"
              title="Reset conversation"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-fog hover:text-charcoal dark:hover:text-zinc-200 rounded-lg hover:bg-paper dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/50 dark:bg-black/20">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-purple-600 text-white shadow-xs rounded-tr-xs'
                    : 'bg-white dark:bg-zinc-900 border border-ash dark:border-zinc-800 text-charcoal dark:text-zinc-100 shadow-xs rounded-tl-xs'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <MarkdownRenderer content={msg.text} />
                ) : (
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                )}
                <div
                  className={`text-[9px] mt-1.5 flex items-center gap-1.5 ${
                    msg.role === 'user' ? 'text-purple-200 justify-end' : 'text-zinc-400'
                  }`}
                >
                  <span>{msg.time}</span>
                  {msg.role === 'assistant' && (
                    <>
                      <span>•</span>
                      <span className="font-semibold text-purple-600 dark:text-purple-400">Zorvik AI</span>
                    </>
                  )}
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-200 flex items-center justify-center shrink-0 mt-0.5 text-xs font-semibold">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-ash dark:border-zinc-800 rounded-2xl rounded-tl-xs px-4 py-2.5 text-xs text-steel dark:text-zinc-400 flex items-center gap-2 shadow-xs">
                <Loader2 className="w-3.5 h-3.5 text-purple-500 animate-spin" />
                <span>Consulting live studio registry...</span>
              </div>
            </div>
          )}

          {/* Compact Inline Suggestions on Welcome */}
          {messages.length === 1 && (
            <div className="pt-2 space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                <Sparkles className="w-3 h-3 text-purple-500" />
                <span className="uppercase tracking-wider text-[10px]">Suggestions:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIZED_PROMPTS.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSend(item.label)}
                      className="group flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-ash dark:border-zinc-800 hover:border-purple-500/50 hover:bg-purple-50/40 dark:hover:bg-purple-950/20 text-charcoal dark:text-zinc-200 transition-all cursor-pointer shadow-2xs text-[11px]"
                    >
                      <Icon className="w-3 h-3 text-purple-500/80 group-hover:text-purple-600 dark:group-hover:text-purple-400 shrink-0" />
                      <span className="font-medium group-hover:text-purple-700 dark:group-hover:text-purple-300">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 border-t border-ash dark:border-zinc-800 bg-white dark:bg-[#0c0c10] shrink-0">
          <div className="flex items-end gap-2 bg-paper/60 dark:bg-zinc-900/80 border border-ash dark:border-zinc-800 rounded-xl p-2 focus-within:border-purple-500/50 transition">
            <textarea
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about shoots, gear, crew, money, or inventory..."
              className="flex-1 bg-transparent resize-none outline-none text-xs text-charcoal dark:text-zinc-100 placeholder:text-steel dark:placeholder:text-zinc-500"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="dub-btn-primary p-2 rounded-lg text-white disabled:opacity-40 transition cursor-pointer shrink-0"
              title="Send message"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          <div className="flex items-center justify-between text-[10px] text-steel dark:text-zinc-500 mt-1.5 px-1 font-mono">
            <span className="flex items-center gap-1.5 font-medium text-purple-600 dark:text-purple-400">
              <Sparkles className="w-3 h-3 text-purple-500" />
              Zorvik AI Studio Ultra
            </span>
            <span>Press Enter to send</span>
          </div>
        </div>
      </div>
    </div>
  );
};
