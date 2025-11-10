"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FileText, Grid3x3, Lock, Search, LogOut, User, CheckSquare, Calendar, Sparkles, Moon, Sun, LayoutDashboard } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { useTheme } from "@/contexts/ThemeContext";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await dispatch(logout());
    router.push("/auth/login");
  };

  return (
    <aside className="h-screen border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col sticky top-0 w-64">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg grid place-items-center bg-gradient-to-br from-purple-500 to-violet-600 text-white font-bold">
            O
          </div>
          <Link href="/dashboard" className="block text-lg font-bold text-gray-900 dark:text-gray-100">
            OrganizeNow
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <div className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-3 px-2">
          Workspace
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
          label="Password Vault"
          isActive={pathname === "/vault"}
        />

        <div className="h-px bg-gray-200 my-4"></div>

        {/* AI Assistant - Special Styling */}
        <Link
          href="/ai-assistant"
          className={`group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition overflow-hidden ${
            pathname === "/ai-assistant"
              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30"
              : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 hover:shadow-lg hover:shadow-purple-500/20"
          }`}
        >
          {/* Animated background shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

          {/* Icon with animation */}
          <span className={`relative z-10 ${pathname === "/ai-assistant" ? "animate-pulse" : ""}`}>
            <Sparkles size={20} />
          </span>

          {/* Label */}
          <span className="relative z-10">AI Assistant</span>

          {/* Badge */}
          <span className="relative z-10 ml-auto px-2 py-0.5 text-[10px] font-bold bg-white/20 backdrop-blur-sm rounded-full">
            AI
          </span>
        </Link>
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {user && (
          <div className="flex items-center gap-3 mb-3 px-2 py-2 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-semibold text-sm">
              {user.email[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {user.name || user.email.split("@")[0]}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</div>
            </div>
          </div>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition mb-2"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <>
              <Sun size={18} />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon size={18} />
              <span>Dark Mode</span>
            </>
          )}
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
        >
          <LogOut size={18} />
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
  className,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  className?: string;
}) {
  // Use custom className if provided, otherwise use default styling
  const defaultClassName = `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
    isActive
      ? "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
  }`;

  return (
    <Link
      href={href}
      className={className || defaultClassName}
    >
      <span className={className ? "" : (isActive ? "text-purple-700 dark:text-purple-400" : "text-gray-500 dark:text-gray-400")}>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}


