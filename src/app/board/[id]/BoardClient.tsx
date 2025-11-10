"use client";

import { ExcalidrawCanvas } from "@/components/board/ExcalidrawCanvas";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sun, Moon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useEffect, useState } from "react";
import { fetchBoardById } from "@/store/slices/boardsSlice";

export default function BoardClient({ id }: { id: string }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentBoard } = useAppSelector((state) => state.boards);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("excalidraw-theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("excalidraw-theme", newTheme);
  };

  useEffect(() => {
    dispatch(fetchBoardById(id));
  }, [id, dispatch]);

  const headerBgColor = theme === "dark" ? "#1e1e1e" : "white";
  const headerTextColor = theme === "dark" ? "#e5e7eb" : "#111827";
  const headerBorderColor = theme === "dark" ? "#333" : "#e5e7eb";
  const buttonHoverBg = theme === "dark" ? "#333" : "#f3f4f6";

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100vh',
      backgroundColor: theme === "dark" ? "#1e1e1e" : "white"
    }}>
      {/* Header with back button and board title */}
      <div style={{
        height: '56px',
        borderBottom: `1px solid ${headerBorderColor}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        backgroundColor: headerBgColor,
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => router.push("/dashboard")}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: theme === "dark" ? "#9ca3af" : "#4b5563",
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
              padding: '0.5rem',
              borderRadius: '0.375rem',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = buttonHoverBg}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <ArrowLeft size={20} />
            <span>Back to Boards</span>
          </button>
          {currentBoard && (
            <>
              <div style={{ height: '1.5rem', width: '1px', backgroundColor: headerBorderColor }}></div>
              <h1 style={{ fontSize: '1.125rem', fontWeight: 600, color: headerTextColor }}>{currentBoard.title}</h1>
            </>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          aria-pressed={theme === "dark"}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '0.5rem',
            border: `1px solid ${headerBorderColor}`,
            backgroundColor: theme === "dark" ? "#2d2d2d" : "#f9fafb",
            color: theme === "dark" ? "#fbbf24" : "#f59e0b",
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = theme === "dark" ? "#3d3d3d" : "#f3f4f6";
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = theme === "dark" ? "#2d2d2d" : "#f9fafb";
            e.currentTarget.style.transform = "scale(1)";
          }}
          title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        >
          {theme === "light" ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
        </button>
      </div>

      {/* Excalidraw Canvas */}
      <div style={{ flex: 1, height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
        <ExcalidrawCanvas boardId={id} theme={theme} />
      </div>
    </div>
  );
}


