'use client';

import { useEffect, useRef } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  confirmText?: string;
}

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onError?: (error: Error) => void;
}

export function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  confirmText = 'OK',
}: AlertModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Manage focus
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const icons = {
    info: <Info className="text-blue-500" size={24} />,
    success: <CheckCircle className="text-green-500" size={24} />,
    warning: <AlertTriangle className="text-orange-500" size={24} />,
    error: <AlertCircle className="text-red-500" size={24} />,
  };

  const gradients = {
    info: 'from-blue-500 to-blue-600',
    success: 'from-green-500 to-emerald-600',
    warning: 'from-orange-500 to-amber-600',
    error: 'from-red-500 to-rose-600',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="alert-modal-title"
        aria-describedby="alert-modal-description"
        tabIndex={-1}
        className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {icons[type]}
            <h3 id="alert-modal-title" className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <X size={18} className="text-gray-600 dark:text-gray-300" />
          </button>
        </header>

        {/* Content */}
        <main className="p-6">
          <p id="alert-modal-description" className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{message}</p>
        </main>

        {/* Footer */}
        <footer className="p-6 bg-gray-50 dark:bg-black border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={onClose}
            className={`w-full px-6 py-3 bg-gradient-to-r ${gradients[type]} hover:opacity-90 text-white rounded-2xl font-medium shadow-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${type === 'info' ? 'blue' : type === 'success' ? 'green' : type === 'warning' ? 'orange' : 'red'}-500`}
          >
            {confirmText}
          </button>
        </footer>
      </div>
    </div>
  );
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  onError,
}: ConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Manage focus
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const icons = {
    danger: <AlertCircle className="text-red-500" size={24} />,
    warning: <AlertTriangle className="text-orange-500" size={24} />,
    info: <Info className="text-blue-500" size={24} />,
  };

  const gradients = {
    danger: 'from-red-500 to-rose-600',
    warning: 'from-orange-500 to-amber-600',
    info: 'from-blue-500 to-blue-600',
  };

  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      if (onError) {
        onError(error as Error);
      } else {
        console.error('Confirmation action failed:', error);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-description"
        tabIndex={-1}
        className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {icons[type]}
            <h3 id="confirm-modal-title" className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <X size={18} className="text-gray-600 dark:text-gray-300" />
          </button>
        </header>

        {/* Content */}
        <main className="p-6">
          <p id="confirm-modal-description" className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{message}</p>
        </main>

        {/* Footer */}
        <footer className="p-6 bg-gray-50 dark:bg-black border-t border-gray-100 dark:border-gray-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-2xl font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 px-6 py-3 bg-gradient-to-r ${gradients[type]} hover:opacity-90 text-white rounded-2xl font-medium shadow-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${type === 'danger' ? 'red' : type === 'warning' ? 'orange' : 'blue'}-500`}
          >
            {confirmText}
          </button>
        </footer>
      </div>
    </div>
  );
}
