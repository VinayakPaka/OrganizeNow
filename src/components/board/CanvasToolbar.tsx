"use client";

import { Image as ImageIcon, Undo2, Redo2, Square, RectangleHorizontal, Circle, Type } from "lucide-react";
import { useState } from "react";

export function CanvasToolbar({
  onAddText,
  onAddGridBox,
  onUploadImage,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: {
  onAddText: () => void;
  onAddGridBox: () => void;
  onUploadImage: (file: File) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}) {
  return (
    <div
      className="absolute left-1/2 top-6 -translate-x-1/2 z-50 flex items-center gap-3 rounded-2xl bg-white shadow-xl border border-gray-200 px-4 py-3"
      style={{ pointerEvents: 'auto' }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Image Upload */}
      <div className="flex items-center gap-1 pr-3 border-r border-gray-200">
        <label className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors active:scale-95" title="Upload image">
          <ImageIcon size={18} className="text-gray-600" />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => {
              e.stopPropagation();
              const file = e.target.files?.[0];
              if (file) {
                onUploadImage(file);
                e.target.value = "";
              }
            }}
          />
        </label>
      </div>
      {/* Text Tool */}
      <button
        onClick={() => onAddText()}
        className="p-2 rounded-lg bg-purple-50 text-purple-700 font-bold hover:bg-purple-100 transition-all"
        title="Add Rich Text"
        type="button"
      >
        Text
      </button>
      {/* Grid Box Tool */}
      <button
        onClick={() => onAddGridBox()}
        className="p-2 rounded-lg bg-blue-50 text-blue-800 font-bold hover:bg-blue-100 transition-all"
        title="Add Grid Box"
        type="button"
      >
        Grid Box
      </button>
      {/* Undo/Redo */}
      <div className="flex items-center gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUndo();
          }}
          disabled={!canUndo}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
          title="Undo (Ctrl+Z)"
          type="button"
        >
          <Undo2 size={18} className="text-gray-600" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRedo();
          }}
          disabled={!canRedo}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
          title="Redo (Ctrl+Y)"
          type="button"
        >
          <Redo2 size={18} className="text-gray-600" />
        </button>
      </div>
    </div>
  );
}

