'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Sparkles, CheckCircle, FileText, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';


interface Message {
  role: 'user' | 'assistant';
  content: string;
  relevantItems?: {
    type: 'task' | 'note' | 'password';
    id: string;
    title: string;
    relevance: number;
  }[];
}

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Global AI Chat Component
 * Intelligent search across tasks, notes, and passwords using natural language
 */
export function AIChat({ isOpen, onClose }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! I can help you search through your tasks, notes, and passwords. Try asking me something like:\n\n• "What tasks are due today?"\n• "Find notes about project planning"\n• "Show me high priority tasks"',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: input,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.answer,
        relevantItems: data.relevantItems,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('[AIChat] Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleItemClick = (item: Message['relevantItems'][0]) => {
    if (!item) return;

    // Navigate to the relevant section
    if (item.type === 'task') {
      router.push('/tasks');
    } else if (item.type === 'note') {
      router.push('/notes');
    } else if (item.type === 'password') {
      router.push('/vault');
    }

    onClose();
  };

  const getItemIcon = (type: 'task' | 'note' | 'password') => {
    if (type === 'task') return <CheckCircle size={16} className="text-purple-600" />;
    if (type === 'note') return <FileText size={16} className="text-blue-600" />;
    return <Lock size={16} className="text-green-600" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">AI Assistant</h2>
              <p className="text-xs text-gray-500">Powered by Google Gemini</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Close AI chat"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                {/* Relevant Items */}
                {message.relevantItems && message.relevantItems.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-semibold text-gray-700">Relevant Items:</p>
                    {message.relevantItems.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleItemClick(item)}
                        className="w-full flex items-center gap-2 p-2 bg-white rounded-lg hover:bg-gray-50 transition border border-gray-200 text-left"
                      >
                        {getItemIcon(item.type)}
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-900">{item.title}</p>
                          <p className="text-xs text-gray-500 capitalize">{item.type}</p>
                        </div>
                        <div className="text-xs text-gray-400">
                          {item.relevance}% match
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm">Searching...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your tasks, notes, or passwords..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="p-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              aria-label="Send message"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
