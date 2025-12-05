"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Square, Circle, Type, Pencil, MousePointer, ArrowRight, StickyNote, Check, X, Move, ZoomIn, ZoomOut } from "lucide-react";
import { fetchBlocks, createBlock, updateBlock, deleteBlock } from "@/lib/data/blocks";
import { uploadToBucket, getPublicUrl } from "@/lib/storage/files";
import { CanvasToolbar } from "./CanvasToolbar";

type ShapeType = "rectangle" | "square" | "circle" | "connector" | "freehand" | "sticky" | "task";
type Tool = "select" | "text" | ShapeType;

interface Point {
  x: number;
  y: number;
}

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export type Item = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: "text" | "image";
  subtype?: "grid";
  html?: string;
  zIndex?: number;
  url?: string;
  title?: string;
  secret?: string;
  secretShown?: boolean;
};

interface CanvasProps {
  boardId: string;
  onItemsChange?: (items: Item[]) => void;
}

const gridUpdateTimers = new Map<string, any>();

export function Canvas({ boardId, onItemsChange }: CanvasProps) {
  const [tool, setTool] = useState<Tool>("select");
  const [items, setItems] = useState<Item[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [drawing, setDrawing] = useState<boolean>(false);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [resizing, setResizing] = useState<boolean>(false);
  const [resizeDirection, setResizeDirection] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<Item[][]>([]);
  const [redoStack, setRedoStack] = useState<Item[][]>([]);
  
  const boardRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number; origW?: number; origH?: number } | null>(null);
  const panStartRef = useRef<{ x: number; y: number } | null>(null);

  // Load existing items when the board is opened
  useEffect(() => {
    async function loadItems() {
      try {
        setLoading(true);
        setError(null);
        const blocks = await fetchBlocks(boardId);
        // Update items initialization (only type: 'shape' for shapes, shapeType used for sub-kind)
        const loadedItems: Item[] = blocks.map((block: any) => {
          let t: Item["type"] = block.content_type === "image" ? "image" : "text";
          let item: Item = {
            id: block.id,
            x: block.position_x,
            y: block.position_y,
            w: block.content.width !== undefined ? block.content.width : (t === "text" ? 400 : 200), // use persisted, else sensible default
            h: block.content.height !== undefined ? block.content.height : (t === "text" ? 120 : 150),
            type: t,
            subtype: block.content.subtype ?? undefined,
            html: block.content.html ?? "",
            zIndex: block.position_index,
            url: block.content.url ?? "",
            title: block.content.title ?? "",
            secret: block.content.secret ?? "",
            secretShown: false
          };
          return item;
        });
        setItems(loadedItems);
      } catch (err) {
        console.error("Error loading board items:", err);
        setError("Failed to load board items");
      } finally {
        setLoading(false);
      }
    }
    loadItems();
  }, [boardId]);

  // Generate a unique ID
  const createId = useCallback(() => {
    return (typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `id_${Date.now()}_${Math.random().toString(36).slice(2)}`) as string;
  }, []);

  // Create a new item at the specified coordinates
  const createItemAt = useCallback(async (
    x: number,
    y: number,
    type: "text" | "image" | "grid",
    options?: { url?: string; w?: number; h?: number; html?: string; title?: string; secret?: string }
  ) => {
    const id = createId();
    const zIndex = items.length + 1;
    let newItem: Item | null = null;
    if (type === "text") {
      newItem = {
        id, x, y, w: 400, h: 120, type: "text", html: options?.html ?? "", zIndex
      };
    } else if (type === "image" && options?.url) {
      newItem = {
        id, x, y, w: options.w || 200, h: options.h || 150, type: "image", url: options.url, zIndex
      };
    } else if (type === "grid") {
      newItem = {
        id, x, y, w: 340, h: 180, type: "text", subtype: "grid", title: options?.title || "Title", secret: options?.secret || "Secret Info", secretShown: false, zIndex
      };
    }
    if (newItem) {
      try {
        await createBlock({
          board_id: boardId,
          content_type: newItem.type,
          position_x: newItem.x,
          position_y: newItem.y,
          position_index: newItem.zIndex,
          content: {
            width: newItem.w,
            height: newItem.h,
            html: newItem.html,
            url: newItem.url,
            title: newItem.title,
            secret: newItem.secret,
            subtype: newItem.subtype,
            secretShown: newItem.secretShown,
          },
        });
        setUndoStack((prev: Item[][]) => [...prev, items]);
        setRedoStack([]);
        setItems((arr: Item[]) => [...arr, newItem!]);
        setActiveId(newItem.id);
      } catch (err) {
        console.error("Error creating new item:", err);
      }
    }
  }, [items, createId, boardId]);

  // Handle double click on the board
  const onBoardDoubleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    
    // Adjust coordinates based on zoom and pan
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    
    if (tool === "select") return;
    createItemAt(x, y, "text");
  }, [tool, zoom, pan, createItemAt]);

  // Handle mouse down on an item
  const onMouseDownItem = useCallback((it: Item, e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    
    // Bring the item to the front
    setItems(prev => {
      const maxZ = Math.max(...prev.map(item => item.zIndex || 0));
      return prev.map(item => item.id === it.id ? {...item, zIndex: maxZ + 1} : item);
    });
    
    setActiveId(it.id);
    setSelectedItem(it.id);
    
    // Start dragging
    dragRef.current = { 
      id: it.id, 
      startX: e.clientX, 
      startY: e.clientY, 
      origX: it.x, 
      origY: it.y,
      origW: it.w,
      origH: it.h
    };
    
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }, []);

  // Handle mouse down on resize handle
  const onResizeStart = useCallback((e: React.MouseEvent<HTMLDivElement>, direction: string) => {
    e.stopPropagation();
    if (!activeId) return;
    
    const activeItem = items.find(item => item.id === activeId);
    if (!activeItem) return;
    
    setResizing(true);
    setResizeDirection(direction);
    
    dragRef.current = {
      id: activeId,
      startX: e.clientX,
      startY: e.clientY,
      origX: activeItem.x,
      origY: activeItem.y,
      origW: activeItem.w,
      origH: activeItem.h
    };
    
    window.addEventListener("mousemove", onResizeMove, { passive: true });
    window.addEventListener("mouseup", onResizeEnd, { passive: true });
  }, [activeId, items]);

  // Handle mouse move during resize
  const onResizeMove = useCallback((e: MouseEvent) => {
    if (!dragRef.current || !resizing) return;
    
    const { id, startX, startY, origW, origH, origX, origY } = dragRef.current;
    const dx = (e.clientX - startX) / zoom;
    const dy = (e.clientY - startY) / zoom;
    
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      
      let newW = origW || item.w;
      let newH = origH || item.h;
      let newX = item.x;
      let newY = item.y;
      const isImage = item.type === "image";
      const aspect = (origW || item.w) / (origH || item.h);
      
      switch (resizeDirection) {
        case "e":
          newW = Math.max(50, (origW || item.w) + dx);
          if (isImage) newH = Math.max(50, newW / aspect);
          break;
        case "s":
          newH = Math.max(50, (origH || item.h) + dy);
          if (isImage) newW = Math.max(50, newH * aspect);
          break;
        case "se":
          if (isImage) {
            // Keep aspect ratio; choose dominant delta
            const wCandidate = Math.max(50, (origW || item.w) + dx);
            const hCandidate = Math.max(50, (origH || item.h) + dy);
            // Use the larger scale to feel easier
            const scale = Math.max(wCandidate / (origW || item.w), hCandidate / (origH || item.h));
            newW = Math.max(50, (origW || item.w) * scale);
            newH = Math.max(50, newW / aspect);
          } else {
            newW = Math.max(50, (origW || item.w) + dx);
            newH = Math.max(50, (origH || item.h) + dy);
          }
          break;
        case "w":
          newW = Math.max(50, (origW || item.w) - dx);
          newX = (origX || item.x) + dx;
          if (isImage) newH = Math.max(50, newW / aspect);
          break;
        case "n":
          newH = Math.max(50, (origH || item.h) - dy);
          newY = (origY || item.y) + dy;
          if (isImage) newW = Math.max(50, newH * aspect);
          break;
        case "ne":
          if (isImage) {
            const wCandidate = Math.max(50, (origW || item.w) + dx);
            const hCandidate = Math.max(50, (origH || item.h) - dy);
            const scale = Math.max(wCandidate / (origW || item.w), hCandidate / (origH || item.h));
            newW = Math.max(50, (origW || item.w) * scale);
            const newHCalc = Math.max(50, newW / aspect);
            // Adjust Y since height changes from top
            newY = (origY || item.y) + ((origH || item.h) - newHCalc);
            newH = newHCalc;
          } else {
            newW = Math.max(50, (origW || item.w) + dx);
            newH = Math.max(50, (origH || item.h) - dy);
            newY = (origY || item.y) + dy;
          }
          break;
        case "nw":
          if (isImage) {
            const wCandidate = Math.max(50, (origW || item.w) - dx);
            const hCandidate = Math.max(50, (origH || item.h) - dy);
            const scale = Math.max(wCandidate / (origW || item.w), hCandidate / (origH || item.h));
            newW = Math.max(50, (origW || item.w) * scale);
            const newHCalc = Math.max(50, newW / aspect);
            newX = (origX || item.x) + ((origW || item.w) - newW);
            newY = (origY || item.y) + ((origH || item.h) - newHCalc);
            newH = newHCalc;
          } else {
            newW = Math.max(50, (origW || item.w) - dx);
            newH = Math.max(50, (origH || item.h) - dy);
            newX = (origX || item.x) + dx;
            newY = (origY || item.y) + dy;
          }
          break;
        case "sw":
          if (isImage) {
            const wCandidate = Math.max(50, (origW || item.w) - dx);
            const hCandidate = Math.max(50, (origH || item.h) + dy);
            const scale = Math.max(wCandidate / (origW || item.w), hCandidate / (origH || item.h));
            newW = Math.max(50, (origW || item.w) * scale);
            const newHCalc = Math.max(50, newW / aspect);
            newX = (origX || item.x) + ((origW || item.w) - newW);
            newH = newHCalc;
          } else {
            newW = Math.max(50, (origW || item.w) - dx);
            newH = Math.max(50, (origH || item.h) + dy);
            newX = (origX || item.x) + dx;
          }
          break;
      }
      
      return { ...item, x: newX, y: newY, w: newW, h: newH };
    }));
  }, [resizing, resizeDirection, zoom]);

  // Handle mouse up after resize
  const onResizeEnd = useCallback(() => {
    setResizing(false);
    setResizeDirection("");
    dragRef.current = null;
    
    window.removeEventListener("mousemove", onResizeMove);
    window.removeEventListener("mouseup", onResizeEnd);
  }, [onResizeMove]);

  // Handle mouse move during drag
  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragRef.current) return;
    
    const { id, startX, startY, origX, origY } = dragRef.current;
    const dx = (e.clientX - startX) / zoom;
    const dy = (e.clientY - startY) / zoom;
    
    setItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, x: origX + dx, y: origY + dy }
        : item
    ));
  }, [zoom]);

  // Handle mouse up after drag
  const onMouseUp = useCallback(() => {
    dragRef.current = null;
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  }, [onMouseMove]);

  // Delete active item
  const deleteActive = useCallback(async () => {
    if (selectedItem) {
      try {
        await deleteBlock(selectedItem);
        setUndoStack(prev => [...prev, items]);
        setRedoStack([]);
        setItems(prev => prev.filter(item => item.id !== selectedItem));
        setSelectedItem(null);
        setActiveId(null);
      } catch (err) {
        console.error("Error deleting item:", err);
      }
    }
  }, [selectedItem, items]);

  // Handle keyboard events
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Do not handle global delete when typing inside inputs/contentEditable elements
    const target = e.target as HTMLElement | null;
    const isTyping = !!target && (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      (target as HTMLElement).isContentEditable
    );
    if (isTyping) return;

    if (e.key === "Delete" || e.key === "Backspace") {
      deleteActive();
    }
  }, [deleteActive]);

  // Add keyboard event listeners
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // Clean up event listeners on unmount
  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onResizeMove);
      window.removeEventListener("mouseup", onResizeEnd);
    };
  }, [onMouseMove, onMouseUp, onResizeMove, onResizeEnd]);

  // Toolbar callbacks
  const handleUndo = useCallback(() => {
    if (undoStack.length > 0) {
      const prevState = undoStack[undoStack.length - 1];
      setRedoStack(prev => [...prev, items]);
      setItems(prevState);
      setUndoStack(prev => prev.slice(0, -1));
    }
  }, [items, undoStack]);

  const handleRedo = useCallback(() => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      setUndoStack(prev => [...prev, items]);
      setItems(nextState);
      setRedoStack(prev => prev.slice(0, -1));
    }
  }, [items, redoStack]);

  const handleAddText = useCallback((text: string) => {
    if (!boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const x = (window.innerWidth / 2 - rect.left - pan.x) / zoom;
    const y = (window.innerHeight / 2 - rect.top - pan.y) / zoom;
    
    createItemAt(x, y, "text", { html: text });
  }, [zoom, pan, createItemAt]);

  // Add image
  const onUploadImage = useCallback(async (file: File) => {
    try {
      const path = await uploadToBucket("board-images", file, boardId + "/");
      const publicUrl = getPublicUrl("board-images", path);
      createItemAt(100, 100, "image", { url: publicUrl, w: 200, h: 150 });
      setError(null);
    } catch (error) {
      console.error("Error uploading image:", error, file);
      let errMsg = "Failed to upload image.";
      if (file && file.size > 10 * 1024 * 1024) {
        errMsg = "Image too large (max 10MB).";
      } else if (file && !file.type.startsWith("image/")) {
        errMsg = "File is not an image.";
      }
      setError(errMsg);
    }
  }, [boardId, createItemAt]);

  // Instead of setItems for GridBox change, use this helper:
  const handleGridFieldChange = async (id: string, field: 'title' | 'secret', value: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
    try {
      await updateBlock(id, {
        content: { [field]: value },
      });
    } catch (err) {
      console.error('Failed to update grid box', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          {/* Animated dots */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div
              className="w-3 h-3 rounded-full bg-purple-600 dark:bg-purple-400 animate-bounce"
              style={{ animationDelay: '0ms' }}
            ></div>
            <div
              className="w-3 h-3 rounded-full bg-blue-600 dark:bg-blue-400 animate-bounce"
              style={{ animationDelay: '150ms' }}
            ></div>
            <div
              className="w-3 h-3 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce"
              style={{ animationDelay: '300ms' }}
            ></div>
          </div>
          <div className="text-gray-600 dark:text-gray-400">Loading board...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <CanvasToolbar
        onAddText={() => {
          if (!boardRef.current) return;
          const rect = boardRef.current.getBoundingClientRect();
          const x = (window.innerWidth / 2 - rect.left - pan.x) / zoom;
          const y = (window.innerHeight / 2 - rect.top - pan.y) / zoom;
          createItemAt(x, y, "text");
        }}
        onAddGridBox={() => {
          if (!boardRef.current) return;
          const rect = boardRef.current.getBoundingClientRect();
          const x = (window.innerWidth / 2 - rect.left - pan.x) / zoom;
          const y = (window.innerHeight / 2 - rect.top - pan.y) / zoom;
          createItemAt(x, y, "grid");
        }}
        onUploadImage={onUploadImage}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
      />
      <div 
        ref={boardRef}
        className="relative w-full h-full overflow-hidden bg-white"
        onDoubleClick={onBoardDoubleClick}
        style={{
          cursor: tool === "select" ? "default" : "crosshair",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: "0 0",
          }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              className={`absolute group ${activeId === item.id && (item.type === 'image' || item.subtype === 'grid') ? "ring-2 ring-blue-500 shadow-lg" : ""}`}
              style={{
                left: item.x,
                top: item.y,
                width: item.w,
                height: item.h,
                zIndex: item.zIndex,
              }}
              onMouseDown={(e) => onMouseDownItem(item, e)}
            >
              {/* Toolbar for delete on hover/focus */}
              <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all">
                <button
                  title="Delete"
                  className="bg-white p-1.5 border rounded-full shadow hover:bg-red-500 group hover:text-white hover:border-red-500 text-gray-700"
                  onClick={e => {
                    e.stopPropagation();
                    setItems(prev => prev.filter(i => i.id !== item.id));
                    deleteBlock(item.id);
                  }}
                >
                  <span className="sr-only">Delete</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              {/* RICH TEXT BLOCK: type text, no subtype: grid */}
              {item.type === "text" && item.subtype !== "grid" && (
                <RichTextBlock html={item.html ?? ""} itemId={item.id} onChange={newHTML => setItems(prev => prev.map(i => i.id === item.id ? { ...i, html: newHTML } : i))} />
              )}
              {/* IMAGE */}
              {item.type === "image" && item.url && (
                <img src={item.url} alt="uploaded" className="w-full h-full object-contain bg-white rounded" />
              )}
              {/* GRID BOX: type text, subtype grid */}
              {item.type === "text" && item.subtype === "grid" && (
                <GridBox
                  title={item.title ?? ""}
                  secret={item.secret ?? ""}
                  secretShown={item.secretShown}
                  onChangeTitle={newTitle => handleGridFieldChange(item.id, 'title', newTitle)}
                  onChangeSecret={newSecret => handleGridFieldChange(item.id, 'secret', newSecret)}
                  onToggleSecret={() => setItems(prev => prev.map(i => i.id === item.id ? { ...i, secretShown: !i.secretShown } : i))}
                />
              )}
              {/* Resize handles - show only for image and grid */}
              {activeId === item.id && (item.type === 'image' || item.subtype === 'grid') && (
                <>
                  <div className="absolute top-0 left-0 w-3 h-3 bg-blue-500 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2 cursor-nw-resize shadow-lg hover:bg-blue-600 transition-colors" onMouseDown={(e) => onResizeStart(e, "nw")} />
                  <div className="absolute top-0 right-0 w-3 h-3 bg-blue-500 border-2 border-white rounded-full translate-x-1/2 -translate-y-1/2 cursor-ne-resize shadow-lg hover:bg-blue-600 transition-colors" onMouseDown={(e) => onResizeStart(e, "ne")} />
                  <div className="absolute bottom-0 left-0 w-3 h-3 bg-blue-500 border-2 border-white rounded-full -translate-x-1/2 translate-y-1/2 cursor-sw-resize shadow-lg hover:bg-blue-600 transition-colors" onMouseDown={(e) => onResizeStart(e, "sw")} />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 border-2 border-white rounded-full translate-x-1/2 translate-y-1/2 cursor-se-resize shadow-lg hover:bg-blue-600 transition-colors" onMouseDown={(e) => onResizeStart(e, "se")} />
                  <div className="absolute top-0 left-1/2 w-3 h-3 bg-blue-500 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2 cursor-n-resize shadow-lg hover:bg-blue-600 transition-colors" onMouseDown={(e) => onResizeStart(e, "n")} />
                  <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-blue-500 border-2 border-white rounded-full -translate-x-1/2 translate-y-1/2 cursor-s-resize shadow-lg hover:bg-blue-600 transition-colors" onMouseDown={(e) => onResizeStart(e, "s")} />
                  <div className="absolute left-0 top-1/2 w-3 h-3 bg-blue-500 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2 cursor-w-resize shadow-lg hover:bg-blue-600 transition-colors" onMouseDown={(e) => onResizeStart(e, "w")} />
                  <div className="absolute right-0 top-1/2 w-3 h-3 bg-blue-500 border-2 border-white rounded-full translate-x-1/2 -translate-y-1/2 cursor-e-resize shadow-lg hover:bg-blue-600 transition-colors" onMouseDown={(e) => onResizeStart(e, "e")} />
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RichTextBlock({ html, itemId, onChange }: { html: string, itemId: string, onChange: (html: string) => void }) {
  const ref = useRef<HTMLDivElement | null>(null);
  return (
    <div className="w-full h-full relative group">
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        className="w-full h-full outline-none text-sm p-2 min-h-[60px] resize-none overflow-auto"
        style={{ 
          fontFamily: 'system-ui, -apple-system, sans-serif',
          lineHeight: '1.5',
          backgroundColor: 'transparent',
          direction: 'ltr'
        }}
        // was using dangerouslySetInnerHTML; switch to controlled innerText/innerHTML
        // dangerouslySetInnerHTML={{ __html: html || '<p>Start typing...</p>' }}
        onInput={async (e) => {
          if (ref.current) {
            const val = ref.current.innerHTML;
            onChange(val);
            await updateBlock(itemId, { content: { html: val } });
          }
        }}
        onFocus={e => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
          e.currentTarget.style.borderRadius = '4px';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
          // Sync display on focus
          if (ref.current) ref.current.innerHTML = html || '';
        }}
        onBlur={e => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.boxShadow = 'none';
        }}
        spellCheck={true}
      >
        {/* fallback for SSR: will not render on interactive mode */}
        {html ? <span dangerouslySetInnerHTML={{__html: html}} /> : <span>Start typing...</span>}
      </div>
      {/* Floating toolbar on hover/focus */}
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded shadow-lg border p-1 flex gap-1">
        <button onClick={() => document.execCommand('bold', false)} className="px-2 py-1 text-xs border rounded hover:bg-gray-100" title="Bold"><strong>B</strong></button>
        <button onClick={() => document.execCommand('fontSize', false, '4')} className="px-2 py-1 text-xs border rounded hover:bg-gray-100" title="Large Text">H1</button>
        <button onClick={() => document.execCommand('fontSize', false, '3')} className="px-2 py-1 text-xs border rounded hover:bg-gray-100" title="Medium Text">H2</button>
        <button onClick={() => document.execCommand('fontSize', false, '2')} className="px-2 py-1 text-xs border rounded hover:bg-gray-100" title="Small Text">H3</button>
      </div>
    </div>
  );
}
function GridBox({ title, secret, secretShown, onChangeTitle, onChangeSecret, onToggleSecret }: { title: string, secret: string, secretShown?: boolean, onChangeTitle: (s: string) => void, onChangeSecret: (s: string) => void, onToggleSecret: () => void }) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingSecret, setEditingSecret] = useState(false);
  
  return (
    <div className="w-full h-full bg-white rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 overflow-hidden group">
      {/* Header - like dashboard board card */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-3 text-white">
        <div 
          className="font-semibold text-sm cursor-pointer hover:bg-white/20 rounded px-1 -mx-1"
          onClick={() => setEditingTitle(true)}
        >
          {editingTitle ? (
            <input
              className="w-full outline-none bg-white/20 text-white placeholder-white/70 px-1 rounded"
              value={title}
              onChange={e => onChangeTitle(e.target.value)}
              onBlur={() => setEditingTitle(false)}
              onKeyDown={e => { if(e.key === 'Enter') setEditingTitle(false); }}
              placeholder="Card Title"
            />
          ) : (
            <span className="block truncate">{title || "Card Title"}</span>
          )}
        </div>
      </div>
      
      {/* Content area - like dashboard board content */}
      <div className="p-3 flex-1 flex flex-col">
        <div className="flex-1 flex items-center">
          <input
            className="w-full outline-none border-b border-gray-300 bg-transparent px-1"
            value={secret}
            onChange={e => onChangeSecret(e.target.value)}
            type={secretShown ? 'text' : 'password'}
            placeholder="Enter secret info..."
          />
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
          <button 
            type="button" 
            className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            onClick={onToggleSecret}
          >
            {secretShown ? "Hide" : "Show"}
          </button>
          <div className="text-xs text-gray-400">
            {secretShown ? "Visible" : "Hidden"}
          </div>
        </div>
      </div>
    </div>
  );
}
