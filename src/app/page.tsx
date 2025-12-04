'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Calendar,
  Lock,
  LayoutDashboard,
  StickyNote,
  Sparkles,
  Target,
  Palette,
  Lightbulb,
  Users,
  BookOpen,
  TrendingUp,
  Zap,
  Shield
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated && mounted) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router, mounted]);

  if (isLoading || !mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-purple-50">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              {/* Purple circle with white star/sparkle logo */}
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-md">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {/* Thin sparkle icon */}
                  <path d="M12 3v18M3 12h18M6.5 6.5l11 11M17.5 6.5l-11 11"/>
                </svg>
              </div>
              {/* Brand Name */}
              <span className="text-2xl font-bold">
                <span className="text-black">Organize</span>
                <span className="text-yellow-500 italic" style={{ fontFamily: 'cursive' }}>Now</span>
              </span>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="#features" className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors">
                Features
              </Link>
              <Link href="#blog" className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors">
                Blog
              </Link>
              <Link
                href="/auth/login"
                className="px-6 py-2.5 text-sm font-semibold text-gray-700 hover:text-purple-600 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="px-7 py-3 text-sm font-semibold bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-xl"
              >
                Get Started →
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section - Light Purple Background */}
        <section className="relative px-6 lg:px-8 pt-16 pb-24 bg-gradient-to-br from-purple-50 via-purple-100/50 to-white overflow-hidden">
          {/* Decorative Background Blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 right-20 w-[400px] h-[400px] bg-yellow-300 rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute bottom-20 left-20 w-[350px] h-[350px] bg-purple-300 rounded-full opacity-15 blur-3xl"></div>
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left Content */}
              <div className="animate-fade-slide-up">
                <div className="mb-8">
                  <p className="text-lg text-gray-700 mb-2">
                    The workspace that is{' '}
                    <span className="text-purple-600 font-bold italic text-2xl" style={{ fontFamily: 'cursive' }}>
                      enjoyable
                    </span>
                  </p>
                  <p className="text-lg text-gray-700">for professionals</p>
                </div>

                <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-8 leading-tight">
                  The best place to{' '}
                  <span className="relative inline-block">
                    <span className="text-purple-600 italic" style={{ fontFamily: 'cursive' }}>
                      organize
                    </span>
                    <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 200 12" fill="none">
                      <path d="M2 10C50 3 150 3 198 10" stroke="#9333EA" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                  </span>{' '}
                  and{' '}
                  <span className="relative inline-block">
                    <span className="text-yellow-500 italic" style={{ fontFamily: 'cursive' }}>
                      thrive
                    </span>
                    <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 200 12" fill="none">
                      <path d="M2 10C50 3 150 3 198 10" stroke="#EAB308" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                  </span>
                </h1>

                <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-xl">
                  Manage your tasks, notes, and schedules all in one place.
                  A side project built with passion for modern productivity.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                  <Link
                    href="/auth/signup"
                    className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-purple-600 text-white rounded-full font-semibold text-lg hover:bg-purple-700 transition-all duration-300 shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:scale-105"
                  >
                    Get Started Free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-purple-600 border-2 border-purple-200 rounded-full font-semibold text-lg hover:border-purple-400 hover:bg-purple-50 transition-all duration-300"
                  >
                    View Demo
                  </Link>
                </div>
              </div>

              {/* Right Content - DrawKit Illustration */}
              <div className="relative animate-fade-in-right">
                <div className="relative">
                  {/* Decorative yellow blob */}
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-yellow-400 rounded-full opacity-60 blur-3xl"></div>

                  {/* Main illustration */}
                  <div className="relative bg-white rounded-3xl p-4 shadow-2xl border border-purple-100 overflow-hidden">
                    <img
                      src="/DrawKit Vector Illustration Team Work/SVG/DrawKit Vector Illustration Team Work (2).svg"
                      alt="Workspace Illustration"
                      className="w-full h-auto"
                    />
                  </div>

                  {/* Small decorative card */}
                  <div className="absolute -bottom-6 -left-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 shadow-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white/20 rounded-full"></div>
                      <div>
                        <div className="h-2 w-16 bg-white/60 rounded mb-1"></div>
                        <div className="h-2 w-12 bg-white/40 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats/Productivity Section */}
        {/*
          DrawKit Integration: Consider adding productivity-themed illustrations here
          - "Education & Remote Learning" pack would work well
          - Could add small illustrations above each stat card
        */}
        <section className="px-6 lg:px-8 py-24 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Boost your{' '}
                <span className="text-purple-600 italic" style={{ fontFamily: 'cursive' }}>
                  productivity
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Join thousands of professionals who have streamlined their workflow
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[
                {
                  icon: TrendingUp,
                  value: '83%',
                  label: 'Productivity Increase',
                  description: 'Average boost in task completion',
                  color: 'purple'
                },
                {
                  icon: Zap,
                  value: '5hrs',
                  label: 'Time Saved Weekly',
                  description: 'Less time organizing, more doing',
                  color: 'yellow'
                }
              ].map((stat, i) => (
                <div key={i} className="text-center p-8 bg-gradient-to-br from-purple-50 to-white rounded-3xl border-2 border-purple-100 hover:border-purple-300 transition-all duration-300 hover:shadow-xl">
                  <div className={`w-16 h-16 mx-auto ${stat.color === 'purple' ? 'bg-purple-100' : 'bg-yellow-100'} rounded-2xl flex items-center justify-center mb-6`}>
                    <stat.icon className={`w-8 h-8 ${stat.color === 'purple' ? 'text-purple-600' : 'text-yellow-600'}`} />
                  </div>
                  <div className="text-5xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-lg font-semibold text-gray-900 mb-2">{stat.label}</div>
                  <p className="text-sm text-gray-600">{stat.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Features Section */}
        <section id="features" className="px-6 lg:px-8 py-24 bg-gradient-to-br from-purple-50 via-purple-100/50 to-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Our{' '}
                <span className="text-purple-600 italic" style={{ fontFamily: 'cursive' }}>
                  powerful 
                </span>
                {' '}features
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Everything you need to stay organized and productive
              </p>
            </div>
            
            {/* DrawKit Illustration */}
            <div className="mb-12 flex justify-center">
              <div className="w-full max-w-md">
                <img 
                  src="/DrawKit Vector Illustration Team Work/SVG/DrawKit Vector Illustration Team Work (15).svg" 
                  alt="Productivity features" 
                  className="w-full h-auto opacity-90"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: LayoutDashboard,
                  title: 'Smart Dashboard',
                  description: 'Unified view of all your tasks and notes',
                  gradient: 'from-purple-200 to-purple-300',
                  iconBg: 'bg-white',
                  iconColor: 'text-gray-900'
                },
                {
                  icon: StickyNote,
                  title: 'Rich Notes',
                  description: 'Notion-style editor with AI assistance',
                  gradient: 'from-purple-600 to-purple-700',
                  textWhite: true,
                  iconBg: 'bg-white/20',
                  iconColor: 'text-white'
                },
                {
                  icon: Lock,
                  title: 'Secure Vault',
                  description: 'Encrypted password management',
                  gradient: 'from-yellow-400 to-yellow-500',
                  iconBg: 'bg-white',
                  iconColor: 'text-gray-900'
                },
                {
                  icon: Calendar,
                  title: 'Calendar View',
                  description: 'Manage deadlines and schedules',
                  gradient: 'from-purple-300 to-purple-400',
                  iconBg: 'bg-white',
                  iconColor: 'text-gray-900'
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className={`group bg-gradient-to-br ${feature.gradient} rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-scale-in`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`w-16 h-16 ${feature.iconBg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
                  </div>
                  <h3 className={`text-xl font-bold mb-3 ${feature.textWhite ? 'text-white' : 'text-gray-900'}`}>
                    {feature.title}
                  </h3>
                  <p className={`leading-relaxed text-sm ${feature.textWhite ? 'text-purple-100' : 'text-gray-700'}`}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="px-6 lg:px-8 py-20 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                The productivity tools are{' '}
                <span className="text-purple-600 italic" style={{ fontFamily: 'cursive' }}>
                  delightful
                </span>
              </h2>
              <p className="text-xl text-gray-600">
                Built as a side project with care and attention to detail
              </p>
            </div>
            <div className="mb-8 flex justify-center">
              <img 
                src="/DrawKit Vector Illustration Team Work/SVG/DrawKit Vector Illustration Team Work (17).svg" 
                alt="Pointing Illustration"
                className="w-full max-w-md md:max-w-lg lg:max-w-xl h-auto mx-auto -mb-12 md:-mb-20 rotate-[13deg]"
                style={{ transform: 'rotate(13deg)' }}
              />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: CheckCircle2,
                  title: 'Task Management',
                  description: 'Create, organize, and track tasks with priorities and deadlines',
                  color: 'purple'
                },
                {
                  icon: StickyNote,
                  title: 'BlockNote Editor',
                  description: 'Beautiful note-taking with blocks and advanced formatting',
                  color: 'yellow'
                },
                {
                  icon: Calendar,
                  title: 'Calendar Integration',
                  description: 'Manage meetings and deadlines with integrated calendar',
                  color: 'purple'
                },
                {
                  icon: Lock,
                  title: 'Password Vault',
                  description: 'Bank-level encryption for storing sensitive credentials',
                  color: 'yellow'
                },
                {
                  icon: Palette,
                  title: 'Visual Boards',
                  description: 'Whiteboard canvas for brainstorming and visual planning',
                  color: 'purple'
                },
                {
                  icon: Shield,
                  title: 'Data Security',
                  description: 'Your data is encrypted and stored securely',
                  color: 'yellow'
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className="group bg-white rounded-3xl p-8 border-2 border-purple-100 hover:border-purple-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`w-16 h-16 ${feature.color === 'purple' ? 'bg-purple-100' : 'bg-yellow-100'} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-8 h-8 ${feature.color === 'purple' ? 'text-purple-600' : 'text-yellow-600'}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Blog Section */}
        <section id="blog" className="px-6 lg:px-8 py-20 bg-gradient-to-br from-purple-50 via-purple-100/50 to-white">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-2">
                Read our{' '}
                <span className="text-purple-600 italic" style={{ fontFamily: 'cursive' }}>
                  blog
                </span>
              </h2>
              <p className="text-lg text-gray-600">
                Tips and insights for better productivity
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {[
                {
                  title: 'Master Your Task Management',
                  excerpt: 'Learn how to prioritize tasks effectively and achieve your goals faster with smart organization techniques.',
                  date: 'Nov 28, 2024',
                  readTime: '5 min read',
                  category: 'Productivity',
                  icon: Target,
                  gradient: 'from-purple-400 to-purple-600'
                },
                {
                  title: 'The Power of Digital Note-Taking',
                  excerpt: 'Discover how our BlockNote editor can transform your brainstorming sessions into actionable insights.',
                  date: 'Nov 25, 2024',
                  readTime: '7 min read',
                  category: 'Features',
                  icon: BookOpen,
                  gradient: 'from-yellow-400 to-yellow-600'
                },
                {
                  title: 'Secure Password Management',
                  excerpt: 'Why you need a password vault and how OrganizeNow keeps your credentials safe with bank-level encryption.',
                  date: 'Nov 22, 2024',
                  readTime: '6 min read',
                  category: 'Security',
                  icon: Shield,
                  gradient: 'from-purple-500 to-purple-700'
                }
              ].map((post, index) => (
                <Link
                  key={index}
                  href="#"
                  className="group bg-white rounded-3xl overflow-hidden border-2 border-purple-100 hover:border-purple-300 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col cursor-pointer"
                >
                  {/* Image/Icon Header */}
                  <div className={`relative h-48 bg-gradient-to-br ${post.gradient} p-8 flex items-center justify-center overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/5"></div>
                    <div className="relative z-10 w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <post.icon className="w-10 h-10 text-white" />
                    </div>
                    {/* Category badge */}
                    <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full">
                      <span className="text-xs font-bold text-gray-900">{post.category}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                      <span className="text-purple-600 font-semibold">{post.date}</span>
                      <span>•</span>
                      <span>{post.readTime}</span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="text-gray-600 mb-4 leading-relaxed flex-1 line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="inline-flex items-center gap-2 text-purple-600 font-semibold hover:gap-3 transition-all mt-auto">
                      Read Article
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 lg:px-8 py-24 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 rounded-3xl p-12 lg:p-20 text-center shadow-2xl shadow-purple-500/40 overflow-hidden">
              {/* Decorative blobs */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-yellow-400 rounded-full opacity-30 blur-2xl"></div>
              <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-yellow-300 rounded-full opacity-30 blur-2xl"></div>

              <div className="relative z-10">
                <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                  Ready to get{' '}
                  <span className="italic" style={{ fontFamily: 'cursive' }}>
                    organized
                  </span>
                  ?
                </h2>
                <p className="text-xl text-purple-100 mb-10 max-w-2xl mx-auto">
                  Start organizing today with this free side project built for professionals like you
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/auth/signup"
                    className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-yellow-400 text-gray-900 rounded-full font-bold text-lg hover:bg-yellow-300 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
                  >
                    Get Started Free
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-transparent text-white border-2 border-white rounded-full font-bold text-lg hover:bg-white/10 transition-all duration-300"
                  >
                    Sign In
                  </Link>
                </div>
                <p className="text-sm text-purple-200 mt-8">
                  100% Free • Built as a side project • No credit card required
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 lg:px-8 py-12 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-3">
                {/* Purple circle with white star/sparkle logo */}
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {/* Thin sparkle icon */}
                    <path d="M12 3v18M3 12h18M6.5 6.5l11 11M17.5 6.5l-11 11"/>
                  </svg>
                </div>
                {/* Brand Name */}
                <span className="text-xl font-bold">
                  <span className="text-black">Organize</span>
                  <span className="text-yellow-500 italic" style={{ fontFamily: 'cursive' }}>Now</span>
                </span>
              </div>
              <p className="text-sm text-gray-600">
                © 2025 OrganizeNow. A side project built with passion.
              </p>
            </div>
          </div>
        </footer>
      </main>

      {/* Custom Animations & Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Indie+Flower&family=Dancing+Script:wght@700&display=swap');

        @keyframes fadeSplideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-slide-up {
          animation: fadeSplideUp 1s ease-out;
        }

        .animate-fade-in-right {
          animation: fadeInRight 1s ease-out 0.3s backwards;
        }

        .animate-scale-in {
          animation: scaleIn 0.6s ease-out backwards;
        }

        html {
          color-scheme: light;
        }

        /* Cursive font styling */
        [style*="font-family: cursive"] {
          font-family: 'Dancing Script', 'Indie Flower', cursive !important;
        }
      `}</style>
    </div>
  );
}
