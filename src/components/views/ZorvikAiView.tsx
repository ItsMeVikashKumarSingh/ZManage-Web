import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Send, Bot, User, Loader2, Mic, Paperclip, 
  X, Plus, MessageSquare, Trash2, FileText, Image as ImageIcon,
  RefreshCw, Calendar, Package, DollarSign, Users,
  PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { api } from '../../lib/api';
import { MarkdownRenderer } from '../MarkdownRenderer';

interface FileAttachment {
  name: string;
  mimeType: string;
  data: string;
  previewUrl?: string;
  sizeKb?: number;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  time: string;
  files?: FileAttachment[];
}

interface ChatSession {
  id: string;
  title: string;
  updatedAt: number;
  messages: ChatMessage[];
}

interface ZorvikAiViewProps {
  projectName?: string;
}

const STORAGE_KEY = 'zorvik_ai_sessions_v1';

const CATEGORIZED_SUGGESTIONS = [
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

export const ZorvikAiView: React.FC<ZorvikAiViewProps> = ({ projectName = 'Studio Operations' }) => {
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('zorvik_ai_history_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      {
        id: 'session-default',
        title: 'Studio Operations Overview',
        updatedAt: Date.now(),
        messages: [
          {
            id: 'welcome-1',
            role: 'assistant',
            text: `Hello! I am **Zorvik AI**.\n\nI have complete real-time visibility into **${projectName}**. You can ask me anything about upcoming shoots, equipment status, technician rates, financial payouts, or attach inspection images and shoot call sheets.`,
            time: 'Just now'
          }
        ]
      }
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => sessions[0]?.id || 'session-default');
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);

  const currentSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch {}
  }, [sessions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages, isLoading]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInput(prev => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      rec.onerror = () => {
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    } catch {
      setSpeechSupported(false);
    }
  }, []);

  const toggleSpeech = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} exceeds 10MB limit.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        const isImg = file.type.startsWith('image/');
        const newAttachment: FileAttachment = {
          name: file.name,
          mimeType: file.type || 'application/octet-stream',
          data: base64String,
          previewUrl: isImg ? (reader.result as string) : undefined,
          sizeKb: Math.round(file.size / 1024)
        };
        setAttachments(prev => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, idx) => idx !== index));
  };

  const startNewSession = () => {
    const newId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: 'New Studio Query',
      updatedAt: Date.now(),
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          text: `New conversation started. What would you like to check across **${projectName}**?`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    setAttachments([]);
    setInput('');
  };

  const deleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      startNewSession();
      return;
    }
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== sessionId);
      if (activeSessionId === sessionId) {
        setActiveSessionId(filtered[0]?.id || 'session-default');
      }
      return filtered;
    });
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if ((!textToSend && attachments.length === 0) || isLoading) return;

    const currentFiles = [...attachments];
    const userMessage: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      text: textToSend || 'Please inspect the attached documents/images.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      files: currentFiles.length > 0 ? currentFiles : undefined
    };

    setSessions(prev =>
      prev.map(s => {
        if (s.id === currentSession.id) {
          const isFirstUserMsg = !s.messages.some(m => m.role === 'user');
          const title = isFirstUserMsg ? (textToSend.slice(0, 30) || 'Studio Query') : s.title;
          return {
            ...s,
            title,
            updatedAt: Date.now(),
            messages: [...s.messages, userMessage]
          };
        }
        return s;
      })
    );

    setInput('');
    setAttachments([]);
    setIsLoading(true);

    try {
      const history = currentSession.messages.slice(-6).map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await api.askAssistant({
        query: textToSend || (currentFiles.length > 0 ? 'Please inspect and analyze the attached document(s) in detail, highlighting key information, figures, dates, and actionable summaries.' : 'Studio Operations Overview'),
        conversation_history: history,
        session_id: currentSession.id,
        files: currentFiles.map(f => ({
          name: f.name,
          mimeType: f.mimeType,
          data: f.data
        }))
      });

      const assistantMessage: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        text: res.answer,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setSessions(prev =>
        prev.map(s => {
          if (s.id === currentSession.id) {
            return {
              ...s,
              updatedAt: Date.now(),
              messages: [...s.messages, assistantMessage]
            };
          }
          return s;
        })
      );
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        text: `Unable to complete query: ${err.message || 'Please check your connection and try again.'}`,
        time: 'Just now'
      };
      setSessions(prev =>
        prev.map(s => {
          if (s.id === currentSession.id) {
            return {
              ...s,
              messages: [...s.messages, errorMessage]
            };
          }
          return s;
        })
      );
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
    <div className="h-[calc(100vh-8.5rem)] flex bg-white dark:bg-[#0c0c10] border border-ash dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">      {/* Sessions History Left Sidebar (Collapsible) */}
      <aside
        className={`border-r border-ash dark:border-zinc-800 bg-paper/40 dark:bg-zinc-900/40 flex flex-col shrink-0 transition-all duration-200 ease-in-out ${
          isHistoryCollapsed ? 'w-0 overflow-hidden border-r-0' : 'w-64'
        } hidden md:flex`}
      >
        <div className="p-3 border-b border-ash dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-charcoal dark:text-zinc-100">Chat History</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={startNewSession}
              className="p-1.5 rounded-lg border border-ash dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800 text-steel dark:text-zinc-300 transition cursor-pointer text-xs flex items-center gap-1"
              title="New Chat"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
            <button
              onClick={() => {
                const next = !isHistoryCollapsed;
                setIsHistoryCollapsed(next);
                try {
                  localStorage.setItem('zorvik_ai_history_collapsed', String(next));
                } catch {}
              }}
              className="p-1.5 rounded-lg border border-transparent hover:border-ash dark:hover:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800 text-steel dark:text-zinc-400 transition cursor-pointer"
              title="Collapse History"
            >
              <PanelLeftClose className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.map(s => {
            const isActive = s.id === currentSession.id;
            return (
              <div
                key={s.id}
                onClick={() => setActiveSessionId(s.id)}
                className={`group flex items-center justify-between px-2.5 py-2 rounded-xl text-xs cursor-pointer transition ${
                  isActive
                    ? 'bg-purple-500/10 text-purple-700 dark:text-purple-300 font-medium border border-purple-500/20'
                    : 'text-steel dark:text-zinc-400 hover:bg-paper dark:hover:bg-zinc-800/80 hover:text-charcoal dark:hover:text-zinc-200 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 truncate min-w-0">
                  <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
                  <span className="truncate">{s.title || 'Studio Query'}</span>
                </div>
                <button
                  onClick={(e) => deleteSession(s.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 rounded transition cursor-pointer shrink-0"
                  title="Delete conversation"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="p-3 border-t border-ash dark:border-zinc-800 text-[11px] text-steel dark:text-zinc-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium text-purple-600 dark:text-purple-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Zorvik AI Studio Ultra
          </span>
          <span className="font-mono text-[10px] text-fog dark:text-zinc-500">Live Ops</span>
        </div>
      </aside>

      <section className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#0c0c10]">
        <div className="px-5 py-3 border-b border-ash dark:border-zinc-800 flex items-center justify-between bg-paper/30 dark:bg-zinc-900/30">
          <div className="flex items-center gap-2.5">
            {isHistoryCollapsed && (
              <button
                onClick={() => {
                  setIsHistoryCollapsed(false);
                  try {
                    localStorage.setItem('zorvik_ai_history_collapsed', 'false');
                  } catch {}
                }}
                className="hidden md:flex p-1.5 rounded-lg border border-ash dark:border-zinc-800 text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-zinc-200 hover:bg-paper dark:hover:bg-zinc-800 transition cursor-pointer"
                title="Expand Chat History"
              >
                <PanelLeftOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </button>
            )}
            <div className="w-7 h-7 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-charcoal dark:text-zinc-100">
                  Zorvik AI Workspace
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gradient-to-r from-purple-500/15 to-cyan-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30 flex items-center gap-1 shadow-2xs">
                  <Sparkles className="w-2.5 h-2.5 text-purple-500" />
                  Studio Ultra
                </span>
              </div>
              <p className="text-[11px] text-steel dark:text-zinc-400">
                Full-suite intelligence: schedule, gear telemetry, crew compensation, and document analysis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={startNewSession}
              className="md:hidden px-2.5 py-1.5 rounded-lg border border-ash dark:border-zinc-700 text-xs text-steel dark:text-zinc-300 hover:bg-paper dark:hover:bg-zinc-800 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
            <button
              onClick={() => {
                setSessions(prev =>
                  prev.map(s => {
                    if (s.id === currentSession.id) {
                      return {
                        ...s,
                        messages: [
                          {
                            id: `reset-${Date.now()}`,
                            role: 'assistant',
                            text: `Chat reset. What would you like to check across **${projectName}**?`,
                            time: 'Just now'
                          }
                        ]
                      };
                    }
                    return s;
                  })
                );
              }}
              className="p-1.5 rounded-lg border border-ash dark:border-zinc-800 text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-zinc-200 hover:bg-paper dark:hover:bg-zinc-800 transition cursor-pointer"
              title="Reset conversation"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-zinc-50/40 dark:bg-black/10">
          {currentSession.messages.map(msg => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-purple-600 text-white shadow-xs rounded-tr-xs'
                    : 'bg-white dark:bg-zinc-900 border border-ash dark:border-zinc-800 text-charcoal dark:text-zinc-100 shadow-xs rounded-tl-xs'
                }`}
              >
                {msg.files && msg.files.length > 0 && (
                  <div className="mb-2.5 flex flex-wrap gap-2">
                    {msg.files.map((file, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] border ${
                          msg.role === 'user'
                            ? 'bg-white/10 border-white/20 text-white'
                            : 'bg-paper dark:bg-zinc-800 border-ash dark:border-zinc-700 text-charcoal dark:text-zinc-200'
                        }`}
                      >
                        {file.mimeType.startsWith('image/') ? (
                          <ImageIcon className="w-3.5 h-3.5" />
                        ) : (
                          <FileText className="w-3.5 h-3.5" />
                        )}
                        <span className="max-w-[140px] truncate">{file.name}</span>
                        {file.sizeKb && <span className="opacity-70">({file.sizeKb} KB)</span>}
                      </div>
                    ))}
                  </div>
                )}

                {msg.role === 'assistant' ? (
                  <MarkdownRenderer content={msg.text} />
                ) : (
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                )}

                <div
                  className={`text-[9px] mt-2 flex items-center gap-1.5 ${
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
                <div className="w-8 h-8 rounded-xl bg-zinc-800 text-zinc-200 flex items-center justify-center shrink-0 mt-0.5 text-xs font-semibold">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-ash dark:border-zinc-800 rounded-2xl rounded-tl-xs px-4 py-3 text-xs text-steel dark:text-zinc-400 flex items-center gap-2 shadow-xs">
                <Loader2 className="w-3.5 h-3.5 text-purple-500 animate-spin" />
                <span>Zorvik AI is processing your request...</span>
              </div>
            </div>
          )}

          {/* Compact Inline Suggestions on Welcome */}
          {currentSession.messages.length === 1 && (
            <div className="pt-2 space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                <Sparkles className="w-3 h-3 text-purple-500" />
                <span className="uppercase tracking-wider text-[10px]">Suggestions:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIZED_SUGGESTIONS.map((item, idx) => {
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

        {attachments.length > 0 && (
          <div className="px-4 py-2 border-t border-ash dark:border-zinc-800 bg-paper/50 dark:bg-zinc-900/50 flex flex-wrap gap-2">
            {attachments.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300 text-xs animate-in fade-in"
              >
                {file.previewUrl ? (
                  <img src={file.previewUrl} alt={file.name} className="w-5 h-5 object-cover rounded" />
                ) : (
                  <FileText className="w-4 h-4 text-purple-600" />
                )}
                <span className="max-w-[160px] truncate">{file.name}</span>
                <button
                  onClick={() => removeAttachment(idx)}
                  className="hover:text-red-500 transition cursor-pointer"
                  title="Remove file"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="p-3 md:p-4 border-t border-ash dark:border-zinc-800 bg-white dark:bg-[#0c0c10] shrink-0">
          <div className="flex items-end gap-2 bg-paper/60 dark:bg-zinc-900/80 border border-ash dark:border-zinc-800 rounded-xl p-2 focus-within:border-purple-500/50 transition">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              accept="image/*,.pdf,.txt"
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-zinc-200 hover:bg-paper dark:hover:bg-zinc-800 rounded-lg transition cursor-pointer"
              title="Attach Images or PDFs"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {speechSupported && (
              <button
                onClick={toggleSpeech}
                className={`p-2 rounded-lg transition cursor-pointer ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-zinc-200 hover:bg-paper dark:hover:bg-zinc-800'
                }`}
                title={isListening ? 'Stop listening' : 'Voice dictation'}
              >
                <Mic className="w-4 h-4" />
              </button>
            )}

            <textarea
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? 'Listening to your voice...' : 'Ask Zorvik AI about shoots, gear, crew, money, or attach an image/PDF...'}
              className="flex-1 bg-transparent resize-none outline-none text-xs text-charcoal dark:text-zinc-100 placeholder:text-steel dark:placeholder:text-zinc-500"
            />

            <button
              onClick={() => handleSend()}
              disabled={(!input.trim() && attachments.length === 0) || isLoading}
              className="dub-btn-primary p-2 rounded-lg text-white disabled:opacity-40 transition cursor-pointer shrink-0"
              title="Send message"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] text-steel dark:text-zinc-500 mt-2 px-1 font-mono">
            <span className="flex items-center gap-1.5 font-medium text-purple-600 dark:text-purple-400">
              <Sparkles className="w-3 h-3 text-purple-500" />
              Zorvik AI Studio Ultra
            </span>
            <span>Enter to send • Shift+Enter for new line</span>
          </div>
        </div>
      </section>
    </div>
  );
};
