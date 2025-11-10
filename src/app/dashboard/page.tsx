'use client';

import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import {
  FileText,
  Grid3x3,
  Calendar as CalendarIcon,
  CheckSquare,
  Lock,
  Sparkles,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);

  const features = [
    {
      icon: FileText,
      title: 'Notes',
      description: 'Capture ideas with powerful block-based editor',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      route: '/notes',
      stats: 'Rich text editing',
    },
    {
      icon: Grid3x3,
      title: 'Whiteboards',
      description: 'Visualize ideas with infinite canvas',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
      route: '/whiteboards',
      stats: 'Collaborative boards',
    },
    {
      icon: CalendarIcon,
      title: 'Calendar',
      description: 'Daily notes and time management',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400',
      route: '/calendar',
      stats: 'Daily journaling',
    },
    {
      icon: CheckSquare,
      title: 'Tasks',
      description: 'Manage todos and track progress',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      iconColor: 'text-orange-600 dark:text-orange-400',
      route: '/tasks',
      stats: 'Stay organized',
    },
    {
      icon: Lock,
      title: 'Password Vault',
      description: 'Securely store your passwords',
      color: 'from-red-500 to-rose-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      iconColor: 'text-red-600 dark:text-red-400',
      route: '/vault',
      stats: 'Encrypted storage',
    },
    {
      icon: Sparkles,
      title: 'AI Assistant',
      description: 'Smart search and content generation',
      color: 'from-violet-500 to-purple-500',
      bgColor: 'bg-violet-50 dark:bg-violet-900/20',
      iconColor: 'text-violet-600 dark:text-violet-400',
      route: '/ai',
      stats: 'Powered by Gemini',
    },
  ];

  const quickStats = [
    { label: 'Productivity', value: '85%', icon: TrendingUp, color: 'text-green-600 dark:text-green-400' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-3">
            Welcome back{user ? `, ${user.name || user.email.split('@')[0]}` : ''}! 👋
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Your personal productivity workspace
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {quickStats.map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <stat.icon className={`${stat.color}`} size={40} />
              </div>
            </div>
          ))}

          <div className="md:col-span-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl p-6 shadow-lg text-white">
            <h3 className="text-2xl font-bold mb-2">🚀 All Your Tools in One Place</h3>
            <p className="text-purple-100">
              Access notes, whiteboards, calendar, tasks, passwords, and AI assistance seamlessly.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <button
              key={index}
              onClick={() => router.push(feature.route)}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-200 dark:border-gray-700 text-left overflow-hidden"
            >
              {/* Background gradient on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

              {/* Icon */}
              <div className={`${feature.bgColor} w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={feature.iconColor} size={32} />
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-violet-600 transition-all duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {feature.description}
              </p>

              {/* Stats */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-500">
                  {feature.stats}
                </span>
                <ArrowRight
                  className="text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:translate-x-1 transition-all duration-300"
                  size={20}
                />
              </div>
            </button>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            ✨ Powered by cutting-edge technology for your productivity
          </p>
        </div>
      </div>
    </div>
  );
}
