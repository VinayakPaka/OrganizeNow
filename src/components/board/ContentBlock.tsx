"use client";

import { useState, useRef, useEffect } from "react";
import { Check, Trash2, Strikethrough } from "lucide-react";

type BlockType = "text" | "image" | "file" | "shape";

export function ContentBlock({
  id,
  content,
  isDone,
  type = "text",
  shape,
  width,
  height,
  onToggleDone,
  onChange,
  onCommitChange,
  onDelete,
  onResize,
  isSelected,
  connectMode,
  autoEdit,
}: {
  id: string;
  content: any;
  isDone: boolean;
  type?: BlockType;
  shape?: "square" | "rectangle" | "circle";
  width?: number;
  height?: number;
  onToggleDone: (id: string) => void;
  onChange: (id: string, value: string) => void;
  onCommitChange?: (id: string, value: string) => void;
  onDelete?: (id: string) => void;
  onResize?: (id: string, width: number, height: number) => void;
  isSelected?: boolean;
  connectMode?: boolean;
  autoEdit?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string>("");
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string>("");
  const [strikethrough, setStrikethrough] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const shapeRef = useRef<HTMLDivElement>(null);

  const textContent = typeof content === 'object' ? content.text || "" : content || "";

  useEffect(() => {
    if (autoEdit && !editing) {
      setDraft(textContent || "");
      setEditing(true);
    }
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [autoEdit, editing]);

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = width || 200;
    const startHeight = height || 200;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;

      if (direction.includes("e")) newWidth = Math.max(100, startWidth + deltaX);
      if (direction.includes("w")) newWidth = Math.max(100, startWidth - deltaX);
      if (direction.includes("s")) newHeight = Math.max(80, startHeight + deltaY);
      if (direction.includes("n")) newHeight = Math.max(80, startHeight - deltaY);

      if (onResize) {
        onResize(id, newWidth, newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeDirection("");
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const shapeStyle: React.CSSProperties = type === "shape"
    ? {
        width: width || 200,
        height: height || 200,
        borderRadius: shape === "circle" ? "50%" : "12px",
        minWidth: "100px",
        minHeight: "80px",
      }
    : {};

  if (type === "shape") {
    return (
      <div
        ref={shapeRef}
        className={`group relative bg-white shadow-lg border-2 transition-all ${
          isSelected ? "ring-4 ring-purple-500 border-purple-500" : "border-gray-300"
        } ${connectMode ? "cursor-pointer" : "cursor-default"} flex items-center justify-center`}
        style={shapeStyle}
        onClick={(e) => {
          if (!isResizing && !connectMode) {
            e.stopPropagation();
            setEditing(true);
          }
        }}
      >
        {/* Resize handles */}
        {!connectMode && (
          <>
            <div onMouseDown={(e) => handleResizeStart(e, "nw")} className="absolute -top-2 -left-2 w-4 h-4 bg-purple-500 rounded-full cursor-nw-resize opacity-0 group-hover:opacity-100 transition-opacity" />
            <div onMouseDown={(e) => handleResizeStart(e, "ne")} className="absolute -top-2 -right-2 w-4 h-4 bg-purple-500 rounded-full cursor-ne-resize opacity-0 group-hover:opacity-100 transition-opacity" />
            <div onMouseDown={(e) => handleResizeStart(e, "sw")} className="absolute -bottom-2 -left-2 w-4 h-4 bg-purple-500 rounded-full cursor-sw-resize opacity-0 group-hover:opacity-100 transition-opacity" />
            <div onMouseDown={(e) => handleResizeStart(e, "se")} className="absolute -bottom-2 -right-2 w-4 h-4 bg-purple-500 rounded-full cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div onMouseDown={(e) => handleResizeStart(e, "n")} className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-2 bg-purple-500 rounded cursor-n-resize opacity-0 group-hover:opacity-100 transition-opacity" />
            <div onMouseDown={(e) => handleResizeStart(e, "s")} className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-2 bg-purple-500 rounded cursor-s-resize opacity-0 group-hover:opacity-100 transition-opacity" />
            <div onMouseDown={(e) => handleResizeStart(e, "w")} className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-8 bg-purple-500 rounded cursor-w-resize opacity-0 group-hover:opacity-100 transition-opacity" />
            <div onMouseDown={(e) => handleResizeStart(e, "e")} className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-8 bg-purple-500 rounded cursor-e-resize opacity-0 group-hover:opacity-100 transition-opacity" />
          </>
        )}

        {/* Controls */}
        {onDelete && (
          <div className="absolute top-2 right-2 flex gap-1 z-10 pointer-events-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setStrikethrough(!strikethrough);
              }}
              className={`p-1.5 rounded ${strikethrough ? "bg-purple-500 text-white" : "bg-white text-gray-600"} shadow-md hover:scale-110 transition-transform`}
              title="Toggle strikethrough"
              type="button"
            >
              <Strikethrough size={14} />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setEditing(false);
                onDelete(id);
              }}
              className="p-1.5 bg-white text-red-500 rounded shadow-md hover:bg-red-500 hover:text-white transition-colors"
              title="Delete"
              type="button"
              onPointerUp={(e)=>e.stopPropagation()}
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}

        {/* Text content */}
        <div className="w-full h-full p-4 overflow-auto" onDoubleClick={(e) => {
          e.stopPropagation();
          setEditing(true);
        }}>
          {editing ? (
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => {
                e.stopPropagation();
                setDraft(e.target.value);
              }}
              onMouseDown={(e)=>e.stopPropagation()}
              onBlur={() => {
                setEditing(false);
                onChange(id, draft);
                onCommitChange && onCommitChange(id, draft);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setEditing(false);
                  onChange(id, draft);
                  onCommitChange && onCommitChange(id, draft);
                }
                e.stopPropagation();
              }}
              className="w-full h-full bg-transparent outline-none resize-none text-center text-sm"
              style={{
                textDecoration: strikethrough ? "line-through" : "none",
              }}
              placeholder="Type your text here..."
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-center text-sm break-words cursor-text"
              style={{
                textDecoration: strikethrough ? "line-through" : "none",
                color: strikethrough ? "#9ca3af" : "inherit",
              }}
            >
              {textContent || "Double-click to add text"}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (type === "image") {
    return (
      <div className={`group relative rounded-lg overflow-hidden shadow-lg border transition-all ${
        isSelected ? "ring-4 ring-purple-500 border-purple-500" : "border-gray-200"
      }`}>
        <img src={content} alt="image" className="w-full max-w-md h-auto object-cover" />
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
            className="absolute top-2 right-2 p-2 bg-white/90 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    );
  }

  // Regular text block
  return (
    <div className={`group rounded-lg bg-white shadow-lg text-sm max-w-md hover:shadow-xl transition-all ${
      isSelected ? "ring-4 ring-purple-500 border-purple-500" : "border-gray-200"
    } ${connectMode ? "cursor-pointer" : ""} border`}>
      <div className="flex items-start gap-2 p-3">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleDone(id);
          }} 
          className={`mt-1 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
            isDone 
              ? "bg-purple-600 border-purple-600" 
              : "border-gray-300 hover:border-purple-400"
          }`}
          type="button"
        >
          {isDone && <Check size={14} className="text-white" />}
        </button>
        
        <div className="flex-1 min-w-0">
          {editing ? (
            <textarea
              ref={textareaRef}
            autoFocus
              className="w-full outline-none resize-none border-b border-purple-200 focus:border-purple-400 transition-colors min-h-[60px]"
              value={draft}
              onChange={(e) => {
                e.stopPropagation();
                setDraft(e.target.value);
              }}
              onMouseDown={(e)=>e.stopPropagation()}
              onBlur={() => {
                setEditing(false);
                onChange(id, draft);
                onCommitChange && onCommitChange(id, draft);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setEditing(false);
                  onChange(id, draft);
                  onCommitChange && onCommitChange(id, draft);
                }
                e.stopPropagation();
              }}
              rows={3}
              placeholder="Type unlimited text here..."
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div
              onClick={(e) => {
                e.stopPropagation();
                setEditing(true);
              }}
              className={`cursor-text py-1 break-words ${isDone ? "line-through text-gray-400" : "text-gray-700"}`}
            >
              {textContent || "Double-click to edit text"}
            </div>
          )}
        </div>

        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onDelete) {
                onDelete(id);
              }
            }}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Delete"
            type="button"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

