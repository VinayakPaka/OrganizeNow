'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchTasks } from '@/store/slices/tasksSlice';
import { fetchPages } from '@/store/slices/pagesSlice';
import { fetchBoards } from '@/store/slices/boardsSlice';
import { fetchPasswords } from '@/store/slices/passwordsSlice';
import { AlertModal } from '@/components/ui/Modal';
import {
  FileText,
  Grid3x3,
  Calendar as CalendarIcon,
  CheckSquare,
  Lock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Search,
  Bell,
  Settings
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { tasks } = useAppSelector((state) => state.tasks);
  const { pages } = useAppSelector((state) => state.pages);
  const { boards } = useAppSelector((state) => state.boards);
  const { passwords } = useAppSelector((state) => state.passwords);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [openStatMenu, setOpenStatMenu] = useState<number | null>(null);

  // Fetch all data on mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchTasks());
      dispatch(fetchPages());
      dispatch(fetchBoards());
      dispatch(fetchPasswords());
    }
  }, [dispatch, isAuthenticated]);

  // Handle search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results: any[] = [];

    // Search tasks
    tasks.forEach((task) => {
      if (task.title.toLowerCase().includes(query) || task.description?.toLowerCase().includes(query)) {
        results.push({ type: 'task', data: task, route: '/tasks' });
      }
    });

    // Search notes
    pages.filter(p => !p.is_archived).forEach((page) => {
      if (page.title.toLowerCase().includes(query) || page.content.toLowerCase().includes(query)) {
        results.push({ type: 'note', data: page, route: '/notes' });
      }
    });

    // Search boards
    boards.forEach((board) => {
      if (board.title.toLowerCase().includes(query)) {
        results.push({ type: 'board', data: board, route: `/board/${board.id}` });
      }
    });

    // Search passwords
    passwords.forEach((password) => {
      if (password.service_name.toLowerCase().includes(query) || password.username.toLowerCase().includes(query)) {
        results.push({ type: 'password', data: password, route: '/vault' });
      }
    });

    setSearchResults(results.slice(0, 10)); // Limit to 10 results
    setShowSearchResults(true);
  }, [searchQuery, tasks, pages, boards, passwords]);

  // Calculate real stats
  const completedTasksCount = tasks.filter(t => t.completed).length;
  const totalTasksCount = tasks.length;
  const completedTasksPercentage = totalTasksCount > 0
    ? Math.round((completedTasksCount / totalTasksCount) * 100)
    : 0;

  // URL validation helper to prevent XSS
  const isValidImageUrl = (url: string) => {
    if (!url || typeof url !== 'string') return false;

    // Allow relative paths (starts with /)
    if (url.startsWith('/')) return true;

    // Allow data URLs for base64 images
    if (url.startsWith('data:image/')) return true;

    // Validate full URLs
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
      return false;
    }
  };

  // Count active notes (non-archived pages)
  const activeNotesCount = pages.filter(p => !p.is_archived).length;

  // Calculate active projects percentage (non-archived boards)
  const activeBoardsCount = boards.filter(b => !b.is_archived).length;
  const activeProjectsPercentage = boards.length > 0
    ? Math.round((activeBoardsCount / boards.length) * 100)
    : 0;

  // Count calendar entries (archived pages with dates)
  const calendarEntriesCount = pages.filter(p => p.is_archived && p.title.match(/\d{4}-\d{2}-\d{2}/)).length;

  // Get today's date in YYYY-MM-DD format (local timezone)
  const today = (() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();

  // Get tomorrow's date in YYYY-MM-DD format (local timezone)
  const tomorrow = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();

  // Filter today's tasks (tasks due today)
  const todayTasks = tasks.filter(task => {
    if (!task.due_date) return false;
    return task.due_date === today;
  }).sort((a, b) => {
    // Sort by priority: high > medium > low
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
  });

  // Filter tomorrow's tasks (tasks due tomorrow)
  const tomorrowTasks = tasks.filter(task => {
    if (!task.due_date) return false;
    return task.due_date === tomorrow;
  }).sort((a, b) => {
    // Sort by priority: high > medium > low
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
  });

  // Filter today's calendar events (pages with today's date in title)
  const todayEvents = pages.filter(page => {
    return page.is_archived && page.title.includes(today);
  });

  // Filter tomorrow's calendar events (pages with tomorrow's date in title)
  const tomorrowEvents = pages.filter(page => {
    return page.is_archived && page.title.includes(tomorrow);
  });

  const features = [
    {
      icon: FileText,
      title: 'Notes',
      description: 'Capture ideas with powerful block-based editor',
      gradient: 'from-blue-400 via-blue-300 to-cyan-200',
      route: '/notes',
      stats: `${activeNotesCount} note${activeNotesCount !== 1 ? 's' : ''}`,
    },
    {
      icon: Grid3x3,
      title: 'Whiteboards',
      description: 'Visualize ideas with infinite canvas',
      gradient: 'from-purple-400 via-pink-300 to-rose-200',
      route: '/whiteboards',
      stats: `${boards.length} board${boards.length !== 1 ? 's' : ''}`,
    },
    {
      icon: CalendarIcon,
      title: 'Calendar',
      description: 'Daily notes and time management',
      gradient: 'from-green-400 via-emerald-300 to-teal-200',
      route: '/calendar',
      stats: `${calendarEntriesCount} entr${calendarEntriesCount !== 1 ? 'ies' : 'y'}`,
    },
    {
      icon: CheckSquare,
      title: 'Tasks',
      description: 'Manage todos and track progress',
      gradient: 'from-orange-400 via-amber-300 to-yellow-200',
      route: '/tasks',
      stats: `${totalTasksCount} task${totalTasksCount !== 1 ? 's' : ''}`,
    },
    {
      icon: Lock,
      title: 'Password Vault',
      description: 'Securely store your passwords',
      gradient: 'from-red-400 via-rose-300 to-pink-200',
      route: '/vault',
      stats: passwords.length > 0 ? `${passwords.length} password${passwords.length !== 1 ? 's' : ''}` : 'Encrypted',
    },
    {
      icon: Sparkles,
      title: 'AI Assistant',
      description: 'Smart search and content generation',
      gradient: 'from-violet-400 via-purple-300 to-indigo-200',
      route: '/ai-assistant',
      stats: 'AI Powered',
    },
  ];

  const quickStats = [
    {
      label: 'Completed Tasks',
      value: `${completedTasksPercentage}%`,
      subtitle: `${completedTasksCount} of ${totalTasksCount} completed`,
      gradient: 'from-pink-300 via-rose-200 to-orange-200',
    },
    {
      label: 'Active Projects',
      value: `${activeProjectsPercentage}%`,
      subtitle: `${activeBoardsCount} of ${boards.length} active`,
      gradient: 'from-blue-300 via-cyan-200 to-sky-200',
    },
  ];

  // Helper function to convert 24-hour time to 12-hour format with AM/PM
  const formatTime12Hour = (time24: string) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12; // Convert 0 to 12 for midnight
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Helper function to extract text from BlockNote JSON content
  const extractTextFromContent = (content: any): string => {
    if (!content) return '';

    // If it's a string, try to parse it as JSON first
    if (typeof content === 'string') {
      try {
        const parsed = JSON.parse(content);
        return extractTextFromContent(parsed);
      } catch {
        // If parsing fails, it's plain text
        return content;
      }
    }

    // If it's BlockNote JSON format (array of blocks)
    if (Array.isArray(content)) {
      const texts: string[] = [];

      content.forEach(block => {
        // Handle different block structures
        if (block.content && Array.isArray(block.content)) {
          // BlockNote format: block.content is array of inline content
          const blockText = block.content
            .map((item: any) => {
              if (typeof item === 'string') return item;
              if (item.text) return item.text;
              if (item.content) return extractTextFromContent(item.content);
              return '';
            })
            .join('');

          if (blockText.trim()) {
            texts.push(blockText);
          }
        } else if (block.text) {
          // Simple text block
          texts.push(block.text);
        } else if (typeof block === 'string') {
          // Plain string in array
          texts.push(block);
        }
      });

      return texts.join(' ');
    }

    // If it's an object with content property
    if (typeof content === 'object' && content !== null) {
      if (content.content) {
        return extractTextFromContent(content.content);
      }
      if (content.text) {
        return content.text;
      }
    }

    return '';
  };

  const getSearchIcon = (type: string) => {
    switch (type) {
      case 'task': return <CheckSquare size={16} className="text-orange-600" />;
      case 'note': return <FileText size={16} className="text-blue-600" />;
      case 'board': return <Grid3x3 size={16} className="text-purple-600" />;
      case 'password': return <Lock size={16} className="text-red-600" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-black dark:via-gray-900 dark:to-black">
      {/* Top Header Bar */}
      <div className="bg-white/80 dark:bg-black/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Welcome Message */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-xl">✨</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Welcome, {user?.name || user?.email?.split('@')[0] || 'User'}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Your personal dashboard overview</p>
              </div>
            </div>

            {/* Search and Actions */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search tasks, notes, boards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery && setShowSearchResults(true)}
                  onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                  className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 text-gray-900 dark:text-gray-100 placeholder-gray-500"
                />
                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute top-full mt-2 w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
                    <div className="p-2">
                      {searchResults.map((result, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            router.push(result.route);
                            setSearchQuery('');
                            setShowSearchResults(false);
                          }}
                          className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition text-left"
                        >
                          {getSearchIcon(result.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {result.type === 'task' ? result.data.title :
                               result.type === 'note' ? result.data.title :
                               result.type === 'board' ? result.data.title :
                               result.data.service_name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                              {result.type}
                            </p>
                          </div>
                          <ArrowRight size={16} className="text-gray-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {showSearchResults && searchResults.length === 0 && searchQuery && (
                  <div className="absolute top-full mt-2 w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                      No results found for "{searchQuery}"
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={() => router.push('/tasks')}
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                <Bell size={18} className="text-gray-600 dark:text-gray-300" />
              </button>
              <button
                onClick={() => router.push('/settings')}
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                <Settings size={18} className="text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Profile Card */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profile</h3>
              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1">
                  {(() => {
                    const hasProfilePic = user?.profilePicture;
                    const isValid = hasProfilePic ? isValidImageUrl(user.profilePicture!) : false;

                    console.log('[Dashboard] Full User Object:', user);
                    console.log('[Dashboard] Profile Picture Debug:', {
                      hasProfilePic,
                      profilePicture: user?.profilePicture,
                      profilePictureType: typeof user?.profilePicture,
                      profilePictureLength: user?.profilePicture?.length,
                      isValid,
                      startsWithData: user?.profilePicture?.startsWith('data:image/'),
                    });

                    return hasProfilePic && isValid ? (
                      <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <img
                          src={user.profilePicture}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('[Dashboard] Profile image failed to load:', user.profilePicture);
                            e.currentTarget.style.display = 'none';
                          }}
                          onLoad={() => {
                            console.log('[Dashboard] Profile image loaded successfully');
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
                        <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-blue-500 to-purple-600">
                          {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    );
                  })()}
                </div>
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-4 border-white dark:border-gray-800"></div>
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {user?.name || user?.email?.split('@')[0] || 'User'}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Productivity Master</p>
              <button
                onClick={() => router.push('/settings')}
                className="mb-4 px-4 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
              >
                Edit Profile
              </button>
              <div className="flex gap-6 w-full justify-center">
                <div className="text-center">
                  <div className="flex items-center gap-1 text-orange-500">
                    <span className="text-lg font-bold">{boards.length}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Projects</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 text-red-500">
                    <span className="text-lg font-bold">{totalTasksCount}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Tasks</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 text-yellow-500">
                    <span className="text-lg font-bold">{activeNotesCount}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Notes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Cards */}
          {quickStats.map((stat, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br ${stat.gradient} rounded-3xl p-6 shadow-sm relative overflow-hidden`}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-700">{stat.label}</h3>
                  <div className="relative">
                    <button
                      onClick={() => setOpenStatMenu(openStatMenu === index ? null : index)}
                      className="text-gray-700 hover:text-gray-900 p-1 rounded-lg hover:bg-white/30 transition"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {openStatMenu === index && (
                      <>
                        {/* Backdrop */}
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setOpenStatMenu(null)}
                        />

                        {/* Menu */}
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                          {index === 0 ? (
                            // Completed Tasks Menu
                            <>
                              <button
                                onClick={() => {
                                  router.push('/tasks');
                                  setOpenStatMenu(null);
                                }}
                                className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                              >
                                <CheckSquare size={16} />
                                View All Tasks
                              </button>
                              <button
                                onClick={() => {
                                  router.push('/tasks?filter=completed');
                                  setOpenStatMenu(null);
                                }}
                                className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                              >
                                <CheckSquare size={16} />
                                View Completed
                              </button>
                              <button
                                onClick={() => {
                                  router.push('/tasks?filter=pending');
                                  setOpenStatMenu(null);
                                }}
                                className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                              >
                                <TrendingUp size={16} />
                                View Pending
                              </button>
                            </>
                          ) : (
                            // Active Projects Menu
                            <>
                              <button
                                onClick={() => {
                                  router.push('/whiteboards');
                                  setOpenStatMenu(null);
                                }}
                                className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                              >
                                <Grid3x3 size={16} />
                                View All Projects
                              </button>
                              <button
                                onClick={() => {
                                  router.push('/whiteboards?filter=active');
                                  setOpenStatMenu(null);
                                }}
                                className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                              >
                                <TrendingUp size={16} />
                                View Active
                              </button>
                              <button
                                onClick={() => {
                                  router.push('/whiteboards?new=true');
                                  setOpenStatMenu(null);
                                }}
                                className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 border-t border-gray-200 dark:border-gray-700"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create New Project
                              </button>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="mb-2">
                  <div className="text-5xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-700 mt-1">{stat.subtitle}</div>
                </div>
                {index === 1 && (
                  <div className="mt-4 pt-4 border-t border-gray-700/10">
                    <p className="text-xs text-gray-700">Trackers connected</p>
                    <div className="flex gap-2 mt-2">
                      <div className="w-6 h-6 rounded bg-white/50 flex items-center justify-center">
                        <span className="text-xs">📊</span>
                      </div>
                      <div className="w-6 h-6 rounded bg-white/50 flex items-center justify-center">
                        <span className="text-xs">📈</span>
                      </div>
                      <div className="w-6 h-6 rounded bg-white/50 flex items-center justify-center">
                        <span className="text-xs">📉</span>
                      </div>
                      <div className="w-6 h-6 rounded bg-white/50 flex items-center justify-center">
                        <span className="text-xs">...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* Decorative pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                <div className="absolute inset-0 bg-white rounded-full blur-2xl"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Today's Tasks & Events Section */}
        {(todayTasks.length > 0 || todayEvents.length > 0) && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <CalendarIcon size={28} className="text-blue-600 dark:text-blue-400" />
                Today's Schedule
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Today's Tasks */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <CheckSquare size={20} className="text-orange-600" />
                    Today's Tasks
                  </h3>
                  <span className="text-sm px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full font-medium">
                    {todayTasks.length}
                  </span>
                </div>

                {todayTasks.length > 0 ? (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {todayTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => router.push('/tasks')}
                        className="group p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer border border-gray-100 dark:border-gray-700"
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            readOnly
                            className="mt-1 w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                {task.title}
                              </h4>
                              {task.priority && (
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  task.priority === 'high'
                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                    : task.priority === 'medium'
                                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                    : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                }`}>
                                  {task.priority}
                                </span>
                              )}
                            </div>
                            {task.description && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                                {task.description}
                              </p>
                            )}
                            {task.due_time && (
                              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                🕐 {formatTime12Hour(task.due_time)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                    <CheckSquare size={48} className="mb-3 opacity-50" />
                    <p className="text-sm">No tasks scheduled for today</p>
                  </div>
                )}

                {todayTasks.length > 0 && (
                  <button
                    onClick={() => router.push('/tasks')}
                    className="w-full mt-4 py-2 text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium flex items-center justify-center gap-1 transition"
                  >
                    View All Tasks
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>

              {/* Today's Calendar Events */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <CalendarIcon size={20} className="text-green-600" />
                    Today's Notes
                  </h3>
                  <span className="text-sm px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium">
                    {todayEvents.length}
                  </span>
                </div>

                {todayEvents.length > 0 ? (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {todayEvents.map((event) => (
                      <div
                        key={event.id}
                        onClick={() => router.push('/calendar')}
                        className="group p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer border border-gray-100 dark:border-gray-700"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                              {(() => {
                                const title = event.title;
                                if (title === today) return 'Daily Note';
                                if (title.startsWith(today)) return title.slice(today.length).replace(/^[\s\-:]+/, '').trim() || 'Daily Note';
                                if (title.endsWith(today)) return title.slice(0, -today.length).replace(/[\s\-:]+$/, '').trim() || 'Daily Note';
                                return title;
                              })()}
                            </h4>
                            {event.content && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                {(() => {
                                  const textContent = extractTextFromContent(event.content);
                                  return textContent ? textContent.substring(0, 150) + (textContent.length > 150 ? '...' : '') : 'View in calendar...';
                                })()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                    <CalendarIcon size={48} className="mb-3 opacity-50" />
                    <p className="text-sm">No calendar notes for today</p>
                  </div>
                )}

                {todayEvents.length > 0 && (
                  <button
                    onClick={() => router.push('/calendar')}
                    className="w-full mt-4 py-2 text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium flex items-center justify-center gap-1 transition"
                  >
                    View Calendar
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tomorrow's Tasks & Events Section */}
        {(tomorrowTasks.length > 0 || tomorrowEvents.length > 0) && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <CalendarIcon size={28} className="text-purple-600 dark:text-purple-400" />
                Tomorrow's Schedule
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tomorrow's Tasks */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <CheckSquare size={20} className="text-purple-600" />
                    Tomorrow's Tasks
                  </h3>
                  <span className="text-sm px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full font-medium">
                    {tomorrowTasks.length}
                  </span>
                </div>

                {tomorrowTasks.length > 0 ? (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {tomorrowTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => router.push('/tasks')}
                        className="group p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer border border-gray-100 dark:border-gray-700"
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            readOnly
                            className="mt-1 w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                {task.title}
                              </h4>
                              {task.priority && (
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  task.priority === 'high'
                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                    : task.priority === 'medium'
                                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                    : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                }`}>
                                  {task.priority}
                                </span>
                              )}
                            </div>
                            {task.description && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                                {task.description}
                              </p>
                            )}
                            {task.due_time && (
                              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                                🕐 {formatTime12Hour(task.due_time)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                    <CheckSquare size={48} className="mb-3 opacity-50" />
                    <p className="text-sm">No tasks scheduled for tomorrow</p>
                  </div>
                )}

                {tomorrowTasks.length > 0 && (
                  <button
                    onClick={() => router.push('/tasks')}
                    className="w-full mt-4 py-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium flex items-center justify-center gap-1 transition"
                  >
                    View All Tasks
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>

              {/* Tomorrow's Calendar Events */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <CalendarIcon size={20} className="text-indigo-600" />
                    Tomorrow's Notes
                  </h3>
                  <span className="text-sm px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full font-medium">
                    {tomorrowEvents.length}
                  </span>
                </div>

                {tomorrowEvents.length > 0 ? (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {tomorrowEvents.map((event) => (
                      <div
                        key={event.id}
                        onClick={() => router.push('/calendar')}
                        className="group p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer border border-gray-100 dark:border-gray-700"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2"></div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                              {(() => {
                                const title = event.title;
                                if (title === tomorrow) return 'Daily Note';
                                if (title.startsWith(tomorrow)) return title.slice(tomorrow.length).replace(/^[\s\-:]+/, '').trim() || 'Daily Note';
                                if (title.endsWith(tomorrow)) return title.slice(0, -tomorrow.length).replace(/[\s\-:]+$/, '').trim() || 'Daily Note';
                                return title;
                              })()}
                            </h4>
                            {event.content && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                {(() => {
                                  const textContent = extractTextFromContent(event.content);
                                  return textContent ? textContent.substring(0, 150) + (textContent.length > 150 ? '...' : '') : 'View in calendar...';
                                })()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                    <CalendarIcon size={48} className="mb-3 opacity-50" />
                    <p className="text-sm">No calendar notes for tomorrow</p>
                  </div>
                )}

                {tomorrowEvents.length > 0 && (
                  <button
                    onClick={() => router.push('/calendar')}
                    className="w-full mt-4 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium flex items-center justify-center gap-1 transition"
                  >
                    View Calendar
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Features Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Workspace</h2>
            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1">
              View All
              <ArrowRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <button
                key={index}
                onClick={() => router.push(feature.route)}
                className="group bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 text-left relative overflow-hidden"
              >
                {/* Icon with gradient background */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="text-white" size={24} />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                  {feature.description}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {feature.stats}
                  </span>
                  <ArrowRight
                    className="text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-300"
                    size={18}
                  />
                </div>

                {/* Hover gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-3xl`}></div>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Info */}
        <div className="text-center py-8">
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            Made with ❤️ by Vinayak Paka
          </p>
        </div>
      </div>

      {/* Hidden prefetch links to preload heavy pages in background */}
      <div className="hidden">
        <Link href="/notes" prefetch={true}>Notes</Link>
        <Link href="/calendar" prefetch={true}>Calendar</Link>
        <Link href="/whiteboards" prefetch={true}>Whiteboards</Link>
        <Link href="/tasks" prefetch={true}>Tasks</Link>
        <Link href="/vault" prefetch={true}>Vault</Link>
      </div>
    </div>
  );
}
