'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, CheckCircle, FileText, Lock, MessageSquarePlus, Trash2, Bell, Settings, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  relevantItems?: {
    type: 'task' | 'note' | 'board' | 'password';
    id: string;
    title: string;
    relevance: number;
  }[];
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

/**
 * AI Assistant Page
 * Full-page chat interface for intelligent search across tasks, notes, boards, and passwords
 */
export default function AIAssistantPage() {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 'default',
      title: 'New Conversation',
      messages: [
        {
          role: 'assistant',
          content: 'Hi! I can help you search through your tasks, notes, whiteboards, and passwords. Try asking me something like:\n\n• "What tasks are due today?"\n• "Find notes about project planning"\n• "Show me high priority tasks"\n• "What boards did I create recently?"',
        },
      ],
      createdAt: new Date(),
    },
  ]);
  const [activeConversationId, setActiveConversationId] = useState('default');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  const handleNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [
        {
          role: 'assistant',
          content: 'Hi! How can I help you today?',
        },
      ],
      createdAt: new Date(),
    };

    setConversations((prev) => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
  };

  const handleDeleteConversation = (conversationId: string) => {
    // Don't allow deleting if it's the only conversation
    if (conversations.length === 1) {
      return;
    }

    // If deleting the active conversation, switch to another one
    if (activeConversationId === conversationId) {
      const remainingConversations = conversations.filter((c) => c.id !== conversationId);
      setActiveConversationId(remainingConversations[0].id);
    }

    // Remove the conversation
    setConversations((prev) => prev.filter((c) => c.id !== conversationId));
  };

  const handleSend = async () => {
    if (!input.trim() || loading || !activeConversation) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
    };

    // Update conversation with user message
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeConversationId
          ? { ...conv, messages: [...conv.messages, userMessage] }
          : conv
      )
    );

    // Update title if first user message
    if (activeConversation.messages.length === 1) {
      const title = input.slice(0, 50) + (input.length > 50 ? '...' : '');
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversationId ? { ...conv, title } : conv
        )
      );
    }

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

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversationId
            ? { ...conv, messages: [...conv.messages, assistantMessage] }
            : conv
        )
      );
    } catch (error: any) {
      console.error('[AIAssistant] Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
      };
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversationId
            ? { ...conv, messages: [...conv.messages, errorMessage] }
            : conv
        )
      );
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

  const handleItemClick = (item: NonNullable<Message['relevantItems']>[0]) => {
    if (!item) return;

    // Navigate to the relevant section
    if (item.type === 'task') {
      router.push('/tasks');
    } else if (item.type === 'note') {
      router.push('/notes');
    } else if (item.type === 'board') {
      router.push('/dashboard');
    } else if (item.type === 'password') {
      router.push('/vault');
    }
  };

  const getItemIcon = (type: 'task' | 'note' | 'board' | 'password') => {
    if (type === 'task') return <CheckCircle size={16} className="text-purple-600" />;
    if (type === 'note') return <FileText size={16} className="text-blue-600" />;
    if (type === 'board') return <Sparkles size={16} className="text-pink-600" />;
    return <Lock size={16} className="text-green-600" />;
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-black dark:via-gray-900 dark:to-black">
      {/* Top Header Bar */}
      <div className="bg-white/80 dark:bg-black/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <span className="text-white text-xl">✨</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI Assistant</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Powered by Google Gemini</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                <Bell size={18} className="text-gray-600 dark:text-gray-300" />
              </button>
              <button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                <Settings size={18} className="text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Conversation History */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col h-[calc(100vh-200px)]">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Conversations</h2>
                <button
                  type="button"
                  onClick={handleNewConversation}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-2xl transition-all font-medium shadow-sm"
                >
                  <MessageSquarePlus size={20} />
                  New Chat
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`relative group rounded-2xl transition ${
                      activeConversationId === conversation.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 dark:border-blue-600'
                        : 'bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveConversationId(conversation.id)}
                      className="w-full text-left p-3 pr-10"
                    >
                      <p className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">
                        {conversation.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {conversation.messages.length} messages
                      </p>
                    </button>

                    {/* Delete button - only show if there's more than 1 conversation */}
                    {conversations.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteConversation(conversation.id);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-500 transition shadow-sm"
                        aria-label="Delete conversation"
                        title="Delete conversation"
                      >
                        <Trash2 size={14} className="text-gray-400 hover:text-red-600 transition" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col h-[calc(100vh-200px)]">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {activeConversation?.messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-3xl px-5 py-4 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                          : 'bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>

                      {/* Relevant Items */}
                      {message.relevantItems && message.relevantItems.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Relevant Items:</p>
                          {message.relevantItems.map((item, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleItemClick(item)}
                              className="w-full flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition border border-gray-200 dark:border-gray-600 text-left shadow-sm"
                            >
                              {getItemIcon(item.type)}
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-0.5">{item.type}</p>
                              </div>
                              <div className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                                {item.relevance}%
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
                    <div className="bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-3xl px-5 py-4 shadow-sm">
                      <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                        <Loader2 size={18} className="animate-spin text-purple-600 dark:text-purple-400" />
                        <span className="text-sm font-medium">Searching your data...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Bar */}
              <div className="p-6 border-t border-gray-100 dark:border-gray-700">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about your tasks, notes, boards, or passwords..."
                    className="flex-1 px-5 py-4 border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg font-medium"
                    aria-label="Send message"
                  >
                    <Send size={20} />
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                  Press Enter to send • Shift+Enter for new line
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
