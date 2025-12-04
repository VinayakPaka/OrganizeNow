"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { signup, clearError } from "@/store/slices/authSlice";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

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

    if (password !== confirmPassword) {
      // Handle password mismatch
      return;
    }

    if (password.length < 8) {
      return;
    }

    const result = await dispatch(signup({ email, password, name: name || undefined }));

    if (signup.fulfilled.match(result)) {
      router.push("/dashboard");
    }
  }

  const passwordMatch = password === confirmPassword;
  const showPasswordMismatch = confirmPassword.length > 0 && !passwordMatch;

  return (
    <div className="min-h-screen h-screen flex flex-col bg-white relative overflow-hidden">
      {/* relative px-6 lg:px-8 pt-16 pb-24 bg-gradient-to-br from-purple-50 via-purple-100/50 to-white overflow-hidden */}

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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
            </div>
            
            <div className="absolute bottom-1/4 right-12">
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-yellow-100 animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '3s' }}>
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>

            <div className="absolute top-1/2 right-0">
              <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl shadow-lg border border-purple-100 animate-bounce" style={{ animationDelay: '2s', animationDuration: '3s' }}>
                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            {/* Main illustration */}
            <div className="max-w-lg relative">
              <img 
                src="/DrawKit Vector Illustration Team Work/SVG/DrawKit Vector Illustration Team Work (11).svg" 
                alt="Signup Illustration" 
                className="w-full h-auto mb-8"
              />
              <div className="text-center relative z-10">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Start your{' '}
                  <span className="text-purple-600 italic" style={{ fontFamily: 'cursive' }}>
                    organized
                  </span>
                  {' '}journey
                </h2>
                {/* <p className="text-lg text-gray-600 leading-relaxed">
                  Join thousands of professionals who trust OrganizeNow to manage their tasks, secure their passwords, and boost their productivity every day.
                </p> */}
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full flex items-center justify-center">
            <div className="w-full max-w-md">
              {/* Form Card */}
              <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-purple-100 hover:border-purple-200 transition-all duration-300">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Get{' '}
              <span className="text-purple-600 italic" style={{ fontFamily: 'cursive' }}>
                started
              </span>
            </h1>
            <p className="text-sm text-gray-600">Start organizing your life today</p>
          </div>
          <form className="space-y-3" onSubmit={onSubmit}>
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-gray-900 mb-1">
                Full Name <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                id="name"
                type="text"
                className="w-full rounded-lg border-2 border-gray-200 bg-white text-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition placeholder:text-gray-400 hover:border-gray-300"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-gray-900 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="w-full rounded-lg border-2 border-gray-200 bg-white text-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition placeholder:text-gray-400 hover:border-gray-300"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-gray-900 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="w-full rounded-lg border-2 border-gray-200 bg-white text-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition placeholder:text-gray-400 hover:border-gray-300"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-gray-900 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                className={`w-full rounded-lg border-2 bg-white text-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 transition placeholder:text-gray-400 ${
                  showPasswordMismatch
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-200 focus:ring-purple-500 focus:border-purple-500 hover:border-gray-300"
                }`}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              {showPasswordMismatch && (
                <p className="text-xs text-red-600 mt-0.5 font-medium">⚠ Passwords do not match</p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || showPasswordMismatch}
              className="w-full rounded-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-3 text-sm disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:scale-[1.02]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-600">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-bold text-purple-600 hover:text-purple-700 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-gray-500 mt-4">
            By signing up, you agree to our{" "}
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


