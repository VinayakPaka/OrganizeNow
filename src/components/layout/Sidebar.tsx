"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FileText, Grid3x3, Lock, Search, LogOut, User } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logout());
    router.push("/auth/login");
  };

  return (
    <aside className="h-screen border-r border-gray-200 bg-white flex flex-col sticky top-0 w-64">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg grid place-items-center bg-gradient-to-br from-purple-500 to-violet-600 text-white font-bold">
            O
          </div>
          <Link href="/notes" className="block text-lg font-bold text-gray-900">
            OrganizeNow
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <div className="text-[10px] uppercase tracking-wide text-gray-400 mb-3 px-2">
          Workspace
        </div>

        <SidebarItem
          href="/notes"
          icon={<FileText size={20} />}
          label="Notes"
          isActive={pathname === "/notes"}
        />

        <SidebarItem
          href="/dashboard"
          icon={<Grid3x3 size={20} />}
          label="Whiteboards"
          isActive={pathname === "/dashboard" || pathname?.startsWith("/board/")}
        />

        <SidebarItem
          href="/vault"
          icon={<Lock size={20} />}
          label="Password Vault"
          isActive={pathname === "/vault"}
        />

        <div className="h-px bg-gray-200 my-4"></div>

        <SidebarItem
          href="/search"
          icon={<Search size={20} />}
          label="Search"
          isActive={pathname === "/search"}
        />
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-gray-200">
        {user && (
          <div className="flex items-center gap-3 mb-3 px-2 py-2 rounded-lg bg-gray-50">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-semibold text-sm">
              {user.email[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {user.name || user.email.split("@")[0]}
              </div>
              <div className="text-xs text-gray-500 truncate">{user.email}</div>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition"
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
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
        isActive
          ? "bg-purple-50 text-purple-700"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      <span className={isActive ? "text-purple-700" : "text-gray-500"}>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}


