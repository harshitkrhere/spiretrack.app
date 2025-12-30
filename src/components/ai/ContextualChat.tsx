import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface ContextualChatProps {
  contextId: string;
  contextType: 'weekly_report' | 'team_insight' | 'decision_analysis' | 'risk_flag';
  aiOutput: any;
  onClose: () => void;
}

export default function ContextualChat({ contextId, contextType, aiOutput, onClose }: ContextualChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const contextLabels = {
    weekly_report: 'Weekly Report Analysis',
    team_insight: 'Team Insights',
    decision_analysis: 'Decision Analysis',
    risk_flag: 'Risk Flag'
  };

  useEffect(() => {
    loadMessages();
  }, [contextId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_context_messages')
        .select('*')
        .eq('context_id', contextId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    
    // OPTIMISTIC UI: Add user message immediately (don't wait for server)
    const tempUserMessage: Message = {
      id: `temp-user-${Date.now()}`,
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMessage]);
    
    // Show typing indicator
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('contextual-chat', {
        body: {
          context_id: contextId,
          message: userMessage
        }
      });

      if (error) throw error;

      // Add AI response immediately (optimistic)
      if (data?.message) {
        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.message,
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove the optimistic user message on error
      setMessages(prev => prev.filter(m => m.id !== tempUserMessage.id));
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-[#f5f5f7] rounded-xl shadow-2xl w-full max-w-2xl h-[680px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header - System Style */}
        <div className="px-6 py-4 bg-white border-b border-[#e5e5e7] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#f5f5f7] flex items-center justify-center">
              <img 
                src="/spire-ai-logo.png" 
                alt="Spire AI" 
                className="w-5 h-5 opacity-80 object-contain"
              />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-[#1d1d1f] tracking-tight">
                Spire AI
              </h3>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#34c759]" />
                <p className="text-[12px] text-[#86868b]">
                  {contextLabels[contextType]}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-[#f5f5f7] text-[#86868b] hover:bg-[#e5e5e7] transition-all duration-200"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Messages - Clean List Style */}
        <div className="flex-1 overflow-y-auto px-6 py-6 bg-white">
          {loadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-2">
                <div className="w-5 h-5 border-2 border-[#e5e5e7] border-t-[#86868b] rounded-full animate-spin" />
                <p className="text-[13px] text-[#86868b]">Loading history...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-12">
              <div className="w-12 h-12 rounded-xl bg-[#f5f5f7] flex items-center justify-center mb-4 border border-[#e5e5e7]">
                <img src="/spire-ai-logo.png" alt="" className="w-6 h-6 opacity-40 grayscale" />
              </div>
              <h4 className="text-[15px] font-semibold text-[#1d1d1f] mb-1">
                Advisor Chat
              </h4>
              <p className="text-[13px] text-[#86868b] leading-relaxed">
                Reviewing context from: <span className="font-medium text-[#1d1d1f]">{contextLabels[contextType]}</span>
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-4 py-2.5 ${
                      message.role === 'user'
                        ? 'bg-[#007aff] text-white'
                        : 'bg-[#f5f5f7] text-[#1d1d1f]'
                    }`}
                  >
                    <div className="text-[15px] leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator - Minimal */}
              {loading && (
                <div className="flex justify-start animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5 px-4 py-3 bg-[#f5f5f7] rounded-lg">
                    <div className="w-1.5 h-1.5 bg-[#86868b] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-[#86868b] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-[#86868b] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input - System Bordered */}
        <div className="px-6 py-4 bg-[#f5f5f7] border-t border-[#e5e5e7]">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your question..."
              disabled={loading}
              className="w-full pl-4 pr-12 py-3 bg-white border border-[#e5e5e7] rounded-lg focus:outline-none focus:border-[#86868b] transition-colors text-[15px] placeholder:text-[#aeaeb2] disabled:opacity-60"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="p-1.5 text-[#007aff] hover:bg-[#f2f2f7] rounded-md disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                title="Send message"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          <p className="text-[11px] text-[#86868b] text-center mt-3">
            System generated response • Verify critical data
          </p>
        </div>
      </div>
    </div>
  );
}
