"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import type { AppState, BinaryFiles } from "@excalidraw/excalidraw/types/types";
import { useAppDispatch } from "@/store/hooks";
import { fetchBoardById } from "@/store/slices/boardsSlice";

// Dynamically import Excalidraw to avoid SSR issues
const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full"><div className="text-gray-500">Loading canvas...</div></div> }
);

interface ExcalidrawCanvasProps {
  boardId: string;
  theme?: "light" | "dark";
}

/**
 * Excalidraw Canvas Component
 * Full-featured drawing canvas with all Excalidraw capabilities
 */
export function ExcalidrawCanvas({ boardId, theme = "light" }: ExcalidrawCanvasProps) {
  const dispatch = useAppDispatch();
  const [initialData, setInitialData] = useState<{
    elements: ExcalidrawElement[];
    appState: Partial<AppState>;
    files: BinaryFiles;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load board data on mount
  useEffect(() => {
    async function loadBoard() {
      try {
        setIsLoading(true);
        const result = await dispatch(fetchBoardById(boardId));

        if (fetchBoardById.fulfilled.match(result)) {
          const board = result.payload.board;
          const blocks = result.payload.blocks;

          // Try to parse existing Excalidraw data from blocks
          let elements: ExcalidrawElement[] = [];
          let appState: Partial<AppState> = {};
          let files: BinaryFiles = {};

          // If there's a special block with type 'excalidraw_data', use it
          const excalidrawBlock = blocks.find((b: any) => b.content_type === 'excalidraw_data');
          if (excalidrawBlock && excalidrawBlock.content) {
            elements = excalidrawBlock.content.elements || [];
            appState = excalidrawBlock.content.appState || {};
            files = excalidrawBlock.content.files || {};
          }

          setInitialData({
            elements,
            appState: {
              ...appState,
              viewBackgroundColor: board.color || "#ffffff",
            },
            files,
          });
        }
      } catch (error) {
        console.error("Error loading board:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadBoard();
  }, [boardId, dispatch]);

  // Auto-save handler with debounce
  const handleChange = useCallback(
    (elements: readonly ExcalidrawElement[], appState: AppState, files: BinaryFiles) => {
      // Debounce auto-save
      const saveTimeout = setTimeout(async () => {
        try {
          // Only save if there are elements to save
          if (elements.length === 0) return;

          // Save to API - we'll use a special content_type for Excalidraw data
          const response = await fetch(`/api/boards/${boardId}/excalidraw`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              elements: Array.from(elements),
              appState: {
                viewBackgroundColor: appState.viewBackgroundColor,
                currentItemStrokeColor: appState.currentItemStrokeColor,
                currentItemBackgroundColor: appState.currentItemBackgroundColor,
                currentItemFillStyle: appState.currentItemFillStyle,
                currentItemStrokeWidth: appState.currentItemStrokeWidth,
                currentItemRoughness: appState.currentItemRoughness,
                currentItemOpacity: appState.currentItemOpacity,
                gridSize: appState.gridSize,
                colorPalette: appState.colorPalette,
              },
              files: files,
            }),
          });

          if (!response.ok) {
            console.error("Failed to save board:", await response.text());
          }
        } catch (error) {
          console.error("Error auto-saving board:", error);
        }
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(saveTimeout);
    },
    [boardId]
  );

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center h-full"
        style={{ backgroundColor: theme === "dark" ? "#1e1e1e" : "white" }}
      >
        <div style={{ color: theme === "dark" ? "#9ca3af" : "#6b7280", fontSize: "1.125rem" }}>
          Loading canvas...
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Excalidraw
        initialData={initialData || undefined}
        onChange={handleChange}
        UIOptions={{
          canvasActions: {
            changeViewBackgroundColor: true,
            clearCanvas: true,
            export: {
              saveFileToDisk: true,
            },
            loadScene: true,
            saveToActiveFile: true,
            toggleTheme: false, // Disable built-in theme toggle as we have our own
          },
        }}
        theme={theme}
      />
    </div>
  );
}
