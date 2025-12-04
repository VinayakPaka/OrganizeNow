"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FileText, Grid3x3, Lock, LogOut, CheckSquare, Calendar, Sparkles, Moon, Sun, LayoutDashboard } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { useTheme } from "@/contexts/ThemeContext";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { theme, toggleTheme } = useTheme();

  // Hide sidebar on auth pages
  if (pathname?.startsWith('/auth/')) {
    return null;
  }

  const handleLogout = async () => {
    await dispatch(logout());
    router.push("/auth/login");
  };

  return (
    <aside className="h-screen bg-white dark:bg-black flex flex-col sticky top-0 w-64 border-r border-gray-100 dark:border-gray-700">
      {/* Logo */}
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          {/* Purple circle with white star/sparkle logo */}
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-md">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {/* Thin sparkle icon */}
              <path d="M12 3v18M3 12h18M6.5 6.5l11 11M17.5 6.5l-11 11"/>
            </svg>
          </div>
          <span className="text-xl font-bold">
            <span className="text-gray-900 dark:text-white">Organize</span>
            <span className="text-yellow-500 italic" style={{ fontFamily: 'cursive' }}>Now</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        <div className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4 px-3 font-semibold">
          Main Menu
        </div>

        <SidebarItem
          href="/dashboard"
          icon={<LayoutDashboard size={20} />}
          label="Dashboard"
          isActive={pathname === "/dashboard"}
        />

        <SidebarItem
          href="/notes"
          icon={<FileText size={20} />}
          label="Notes"
          isActive={pathname === "/notes"}
        />

        <SidebarItem
          href="/whiteboards"
          icon={<Grid3x3 size={20} />}
          label="Whiteboards"
          isActive={pathname === "/whiteboards" || pathname?.startsWith("/board/")}
        />

        <SidebarItem
          href="/tasks"
          icon={<CheckSquare size={20} />}
          label="Tasks"
          isActive={pathname === "/tasks"}
        />

        <SidebarItem
          href="/calendar"
          icon={<Calendar size={20} />}
          label="Calendar"
          isActive={pathname === "/calendar"}
        />

        <SidebarItem
          href="/vault"
          icon={<Lock size={20} />}
          label="Vault"
          isActive={pathname === "/vault"}
        />

        <div className="h-px bg-gray-200 dark:border-gray-700 my-4"></div>

        {/* AI Assistant - Special Styling */}
        <Link
          href="/ai-assistant"
          className={`group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all overflow-hidden ${
            pathname === "/ai-assistant"
              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30"
              : "text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white hover:shadow-lg hover:shadow-purple-500/20"
          }`}
        >
          {/* Animated background shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

          {/* Icon with animation */}
          <span className={`relative z-10 ${pathname === "/ai-assistant" ? "animate-pulse" : ""}`}>
            <Sparkles size={20} />
          </span>

          {/* Label */}
          <span className="relative z-10 flex-1">AI Assistant</span>

          {/* Badge */}
          <span className="relative z-10 px-2 py-0.5 text-[9px] font-bold bg-white/20 backdrop-blur-sm rounded-full uppercase tracking-wider">
            AI
          </span>
        </Link>
      </nav>

      {/* User Profile & Settings */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-700">
        {user && (
          <div className="flex items-center gap-3 mb-4 px-3 py-3 rounded-2xl bg-gray-50 dark:bg-gray-700/50">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md overflow-hidden">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-semibold text-sm">
                  {user.name?.[0] || user.email[0].toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {user.name || user.email.split("@")[0]}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</div>
            </div>
          </div>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all mb-2"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <>
              <Sun size={20} />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon size={20} />
              <span>Dark Mode</span>
            </>
          )}
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

function SidebarItem({
  href,
  icon,
  label,
  isActive,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      prefetch={true}
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
        isActive
          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
    >
      <span className={isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
