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
    <div className="min-h-screen flex items-center justify-center bg-white p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top right gradient blob */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-purple-400/30 to-purple-600/20 rounded-full blur-3xl"></div>
        {/* Bottom left gradient blob */}
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-yellow-400/20 to-purple-400/10 rounded-full blur-3xl"></div>
        {/* Small accent blob */}
        <div className="absolute top-1/3 right-1/4 w-[200px] h-[200px] bg-purple-300/20 rounded-full blur-2xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6 hover:opacity-80 transition-opacity">
            {/* Purple circle with white star/sparkle logo */}
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-md">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {/* Thin sparkle icon */}
                <path d="M12 3v18M3 12h18M6.5 6.5l11 11M17.5 6.5l-11 11"/>
              </svg>
            </div>
            <span className="text-2xl font-bold">
              <span className="text-black">Organize</span>
              <span className="text-yellow-500 italic" style={{ fontFamily: 'cursive' }}>Now</span>
            </span>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome{' '}
            <span className="text-purple-600 italic" style={{ fontFamily: 'cursive' }}>
              back
            </span>
          </h1>
          <p className="text-lg text-gray-600">Sign in to continue organizing</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-purple-100 hover:border-purple-200 transition-all duration-300">
          <form className="space-y-5" onSubmit={onSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="w-full rounded-xl border-2 border-gray-200 bg-white text-gray-900 px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition placeholder:text-gray-400 hover:border-gray-300"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="w-full rounded-xl border-2 border-gray-200 bg-white text-gray-900 px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition placeholder:text-gray-400 hover:border-gray-300"
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
              className="w-full rounded-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:scale-[1.02]"
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

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/auth/signup"
                className="font-bold text-purple-600 hover:text-purple-700 transition-colors"
              >
                Sign up for free
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          By signing in, you agree to our{" "}
          <Link href="#" className="text-purple-600 hover:underline">Terms of Service</Link>
          {" "}and{" "}
          <Link href="#" className="text-purple-600 hover:underline">Privacy Policy</Link>
        </p>
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
