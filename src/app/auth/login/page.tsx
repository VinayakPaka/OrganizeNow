"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { login, clearError } from "@/store/slices/authSlice";
import Link from "next/link";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const params = useSearchParams();
  const dispatch = useAppDispatch();

  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push(params.get("redirect") || "/dashboard");
    }
  }, [isAuthenticated, router, params]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email || !password) {
      return;
    }

    const result = await dispatch(login({ email, password }));

    if (login.fulfilled.match(result)) {
      router.push(params.get("redirect") || "/dashboard");
    }
  }

  return (
    <div className="min-h-screen h-screen flex flex-col bg-white relative overflow-hidden">

      {/* Centered Logo & Title at Top */}
      <div className="relative z-10 pt-8 pb-6 text-center">
        <Link href="/" className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v18M3 12h18M6.5 6.5l11 11M17.5 6.5l-11 11"/>
            </svg>
          </div>
          <span className="text-3xl font-bold">
            <span className="text-black">Organize</span>
            <span className="text-yellow-500 italic" style={{ fontFamily: 'cursive' }}>Now</span>
          </span>
        </Link>
        <p className="text-gray-600 mt-2 text-sm">Your all-in-one productivity workspace</p>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative z-10 flex items-center justify-center px-4 lg:px-8">
        <div className="w-full max-w-7xl mx-auto lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          
          {/* Left Side - Illustration & Decorative Elements */}
          <div className="hidden lg:flex items-center justify-center relative">
            
            {/* Decorative icons floating around */}
            <div className="absolute top-1/4 left-12 transform -translate-y-1/2">
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-purple-100 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3s' }}>
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            </div>
            
            <div className="absolute bottom-1/4 right-12">
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-yellow-100 animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '3s' }}>
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>

            {/* Main illustration */}
            <div className="max-w-lg relative">
              <img 
                src="/DrawKit Vector Illustration Team Work/SVG/DrawKit Vector Illustration Team Work (7).svg" 
                alt="Login Illustration" 
                className="w-full h-auto mb-8"
              />
              <div className="text-center relative z-10">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Welcome back to{' '}
                  <span className="text-purple-600 italic" style={{ fontFamily: 'cursive' }}>
                    productivity
                  </span>
                </h2>
                {/* <p className="text-lg text-gray-600 leading-relaxed">
                  Continue managing your tasks, notes, and goals all in one beautiful workspace. Your organized life awaits!
                </p> */}
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full flex items-center justify-center">
            <div className="w-full max-w-md">
              {/* Form Card */}
              <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-purple-100 hover:border-purple-200 transition-all duration-300">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome{' '}
              <span className="text-purple-600 italic" style={{ fontFamily: 'cursive' }}>
                back
              </span>
            </h1>
            <p className="text-base text-gray-600">Sign in to continue organizing</p>
          </div>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-gray-900 mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="w-full rounded-lg border-2 border-gray-200 bg-white text-gray-900 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition placeholder:text-gray-400 hover:border-gray-300"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-gray-900 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="w-full rounded-lg border-2 border-gray-200 bg-white text-gray-900 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition placeholder:text-gray-400 hover:border-gray-300"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-3 text-sm disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:scale-[1.02]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/auth/signup"
                className="font-bold text-purple-600 hover:text-purple-700 transition-colors"
              >
                Sign up for free
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-gray-500 mt-4">
            By signing in, you agree to our{" "}
            <Link href="#" className="text-purple-600 hover:underline">Terms</Link>
            {" "}and{" "}
            <Link href="#" className="text-purple-600 hover:underline">Privacy Policy</Link>
          </p>
        </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
        [style*="font-family: cursive"] {
          font-family: 'Dancing Script', cursive !important;
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-violet-50">
        <div className="w-10 h-10 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
