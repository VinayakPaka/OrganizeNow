"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { useAppDispatch } from "@/store/hooks";
import { fetchBoardById } from "@/store/slices/boardsSlice";

// Define types locally to avoid missing type declarations
type ExcalidrawElement = any;
type AppState = any;
type BinaryFiles = any;

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
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load board data on mount
  useEffect(() => {
    async function loadBoard() {
      try {
        setIsLoading(true);
        console.log(`[Excalidraw Load] Loading board ${boardId}...`);
        const result = await dispatch(fetchBoardById(boardId));

        if (fetchBoardById.fulfilled.match(result)) {
          const board = result.payload.board;
          const blocks = result.payload.blocks;

          console.log(`[Excalidraw Load] Board loaded, found ${blocks.length} blocks`);
          console.log('[Excalidraw Load] Block types:', blocks.map((b: any) => b.content_type));

          // Try to parse existing Excalidraw data from blocks
          let elements: ExcalidrawElement[] = [];
          let appState: Partial<AppState> = {};
          let files: BinaryFiles = {};

          // Find all excalidraw_data blocks and get the most recent one
          const excalidrawBlocks = blocks.filter((b: any) => b.content_type === 'excalidraw_data');

          if (excalidrawBlocks.length > 0) {
            // Sort by updated_at to get the most recent one
            const sortedBlocks = excalidrawBlocks.sort((a: any, b: any) =>
              new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
            );
            const excalidrawBlock = sortedBlocks[0];

            console.log(`[Excalidraw Load] Found ${excalidrawBlocks.length} excalidraw_data blocks, using most recent`);
            console.log('[Excalidraw Load] Selected block:', excalidrawBlock.id);
            console.log('[Excalidraw Load] Block updated_at:', excalidrawBlock.updated_at);
            console.log('[Excalidraw Load] Elements count:', excalidrawBlock.content?.elements?.length || 0);

            elements = excalidrawBlock.content?.elements || [];
            appState = excalidrawBlock.content?.appState || {};
            files = excalidrawBlock.content?.files || {};
          } else {
            console.log('[Excalidraw Load] No excalidraw_data block found, starting with empty canvas');
          }

          setInitialData({
            elements,
            appState: {
              ...appState,
              viewBackgroundColor: board.color || "#ffffff",
            },
            files,
          });

          console.log(`[Excalidraw Load] Initial data set with ${elements.length} elements`);
        }
      } catch (error) {
        console.error("[Excalidraw Load] Error loading board:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadBoard();
  }, [boardId, dispatch]);

  // Auto-save handler with debounce
  const handleChange = useCallback(
    (elements: readonly ExcalidrawElement[], appState: AppState, files: BinaryFiles) => {
      // Clear previous timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Set new timeout for auto-save
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          console.log(`[Excalidraw] Auto-saving ${elements.length} elements...`);

          if (elements.length === 0) {
            console.log("[Excalidraw] Saving empty canvas (all elements deleted)");
          } else {
            console.log("[Excalidraw] Elements:", elements.map(e => ({ type: e.type, id: e.id })));
          }

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

          if (response.ok) {
            const result = await response.json();
            console.log("[Excalidraw] Canvas saved successfully:", result);
          } else {
            const errorText = await response.text();
            console.error("[Excalidraw] Failed to save board. Status:", response.status);
            console.error("[Excalidraw] Error response:", errorText);
          }
        } catch (error) {
          console.error("[Excalidraw] Error auto-saving board:", error);
        }
      }, 2000); // Auto-save after 2 seconds of inactivity
    },
    [boardId]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center h-full"
        style={{ backgroundColor: theme === "dark" ? "#1e1e1e" : "white" }}
      >
        <div className="text-center">
          {/* Animated dots */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div
              className="w-3 h-3 rounded-full animate-bounce"
              style={{ 
                backgroundColor: theme === "dark" ? "#a78bfa" : "#7c3aed",
                animationDelay: '0ms'
              }}
            ></div>
            <div
              className="w-3 h-3 rounded-full animate-bounce"
              style={{ 
                backgroundColor: theme === "dark" ? "#60a5fa" : "#2563eb",
                animationDelay: '150ms'
              }}
            ></div>
            <div
              className="w-3 h-3 rounded-full animate-bounce"
              style={{ 
                backgroundColor: theme === "dark" ? "#818cf8" : "#4f46e5",
                animationDelay: '300ms'
              }}
            ></div>
          </div>
          <div style={{ color: theme === "dark" ? "#9ca3af" : "#6b7280" }}>
            Loading canvas...
          </div>
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
