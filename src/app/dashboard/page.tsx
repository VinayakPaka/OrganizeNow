'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchTasks } from '@/store/slices/tasksSlice';
import { fetchPages } from '@/store/slices/pagesSlice';
import { fetchBoards } from '@/store/slices/boardsSlice';
import { fetchPasswords } from '@/store/slices/passwordsSlice';
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

  // Count active notes (non-archived pages)
  const activeNotesCount = pages.filter(p => !p.is_archived).length;

  // Calculate active projects percentage (boards with content)
  const boardsWithContent = boards.filter(b => b.blocks && b.blocks.length > 0).length;
  const activeProjectsPercentage = boards.length > 0
    ? Math.round((boardsWithContent / boards.length) * 100)
    : 0;

  // Count calendar entries (archived pages with dates)
  const calendarEntriesCount = pages.filter(p => p.is_archived && p.title.match(/\d{4}-\d{2}-\d{2}/)).length;

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
      subtitle: `${boardsWithContent} of ${boards.length} active`,
      gradient: 'from-blue-300 via-cyan-200 to-sky-200',
    },
  ];

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Top Header Bar */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Welcome Message */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-xl">🏠</span>
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
                  <div className="absolute top-full mt-2 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
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
                  <div className="absolute top-full mt-2 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 p-4">
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
                onClick={() => alert('Settings feature coming soon!')}
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
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
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
                  <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                    <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-blue-500 to-purple-600">
                      {user?.name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-4 border-white dark:border-gray-800"></div>
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {user?.name || user?.email?.split('@')[0] || 'User'}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Productivity Master</p>
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
                  <button className="text-gray-700 hover:text-gray-900">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
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
                className="group bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 text-left relative overflow-hidden"
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
            ✨ Powered by cutting-edge technology for your productivity
          </p>
        </div>
      </div>
    </div>
  );
}
