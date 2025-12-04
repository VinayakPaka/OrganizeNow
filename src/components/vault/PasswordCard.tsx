'use client';

import { Password } from '@/store/slices/passwordsSlice';
import { Lock, Eye, EyeOff, Copy, Trash2, Edit, ExternalLink, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface PasswordCardProps {
  password: Password;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  decryptedPassword?: string;
}

/**
 * PasswordCard component
 * Displays a password entry with view/hide functionality
 */
export function PasswordCard({
  password,
  onView,
  onEdit,
  onDelete,
  decryptedPassword,
}: PasswordCardProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<'username' | 'password' | null>(null);

  const handleCopy = async (text: string, field: 'username' | 'password') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleTogglePassword = () => {
    if (!showPassword && !decryptedPassword) {
      onView();
    }
    setShowPassword(!showPassword);
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Format date safely
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Recently updated';
      }
      return date.toLocaleDateString();
    } catch {
      return 'Recently updated';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Icon/Avatar */}
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-bold">
            {getInitials(password.service_name)}
          </div>

          {/* Service Name & URL */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-0.5">
              {password.service_name}
            </h3>
            {password.url && (
              <a
                href={password.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink size={12} />
                Visit site
              </a>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            title="Edit"
            aria-label="Edit password"
          >
            <Edit size={16} className="text-gray-600 dark:text-gray-400" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
            title="Delete"
            aria-label="Delete password"
          >
            <Trash2 size={16} className="text-red-600 dark:text-red-500" />
          </button>
        </div>
      </div>

      {/* Username */}
      <div className="mb-3">
        <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Username</label>
        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 rounded-lg px-3 py-2">
          <span className="text-sm text-gray-900 dark:text-gray-100">{password.username}</span>
          <button
            type="button"
            onClick={() => handleCopy(password.username, 'username')}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
            title="Copy username"
            aria-label="Copy username"
          >
            {copiedField === 'username' ? (
              <CheckCircle size={14} className="text-green-600 dark:text-green-500" />
            ) : (
              <Copy size={14} className="text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Password */}
      <div className="mb-3">
        <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Password</label>
        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 rounded-lg px-3 py-2">
          <span className="text-sm text-gray-900 dark:text-gray-100 font-mono">
            {showPassword && decryptedPassword ? decryptedPassword : '••••••••••••'}
          </span>
          <div className="flex items-center gap-1">
            {showPassword && decryptedPassword && (
              <button
                type="button"
                onClick={() => handleCopy(decryptedPassword, 'password')}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
                title="Copy password"
                aria-label="Copy password"
              >
                {copiedField === 'password' ? (
                  <CheckCircle size={14} className="text-green-600 dark:text-green-500" />
                ) : (
                  <Copy size={14} className="text-gray-600 dark:text-gray-400" />
                )}
              </button>
            )}
            <button
              type="button"
              onClick={handleTogglePassword}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
              title={showPassword ? 'Hide password' : 'Show password'}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff size={14} className="text-gray-600 dark:text-gray-400" />
              ) : (
                <Eye size={14} className="text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Notes */}
      {password.notes && (
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Notes</label>
          <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 rounded-lg px-3 py-2 line-clamp-2">
            {password.notes}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Updated {formatDate(password.updated_at)}
        </div>
      </div>
    </div>
  );
}
