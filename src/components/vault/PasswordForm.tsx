'use client';

import { useState } from 'react';
import { X, Eye, EyeOff, RefreshCw } from 'lucide-react';

interface PasswordFormProps {
  initialData?: {
    service_name: string;
    username: string;
    password: string;
    url?: string;
    notes?: string;
  };
  onSubmit: (data: {
    service_name: string;
    username: string;
    password: string;
    url?: string;
    notes?: string;
  }) => void;
  onCancel: () => void;
  isLoading?: boolean;
  title?: string;
}

/**
 * PasswordForm component
 * Form for creating/editing password entries
 */
export function PasswordForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  title = 'Add Password',
}: PasswordFormProps) {
  const [serviceName, setServiceName] = useState(initialData?.service_name || '');
  const [username, setUsername] = useState(initialData?.username || '');
  const [password, setPassword] = useState(initialData?.password || '');
  const [url, setUrl] = useState(initialData?.url || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [showPassword, setShowPassword] = useState(false);
  const [urlError, setUrlError] = useState('');

  /**
   * Fisher-Yates shuffle algorithm for unbiased randomization
   */
  const fisherYatesShuffle = (array: string[]): string[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Generate random password
  const generatePassword = () => {
    const length = 16;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let newPassword = '';

    // Ensure at least one of each type
    newPassword += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    newPassword += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    newPassword += '0123456789'[Math.floor(Math.random() * 10)];
    newPassword += '!@#$%^&*'[Math.floor(Math.random() * 8)];

    // Fill the rest
    for (let i = newPassword.length; i < length; i++) {
      newPassword += charset[Math.floor(Math.random() * charset.length)];
    }

    // Shuffle using Fisher-Yates algorithm for unbiased randomization
    const shuffled = fisherYatesShuffle(newPassword.split(''));
    newPassword = shuffled.join('');

    setPassword(newPassword);
    setShowPassword(true);
  };

  // Calculate password strength
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: '' };

    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score <= 3) return { score, label: 'Fair', color: 'bg-yellow-500' };
    if (score <= 4) return { score, label: 'Good', color: 'bg-blue-500' };
    return { score, label: 'Strong', color: 'bg-green-500' };
  };

  const strength = getPasswordStrength(password);

  // Handle URL change with validation
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(value);
    if (urlError) {
      setUrlError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!serviceName || !username || !password) {
      return;
    }

    // Validate URL if provided
    if (url && url.trim()) {
      try {
        new URL(url);
        setUrlError('');
      } catch (error) {
        setUrlError('Please enter a valid URL (e.g., https://example.com)');
        return;
      }
    }

    onSubmit({
      service_name: serviceName,
      username,
      password,
      url: url || undefined,
      notes: notes || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Service Name */}
          <div>
            <label htmlFor="serviceName" className="block text-sm font-medium text-gray-700 mb-1">
              Service Name *
            </label>
            <input
              id="serviceName"
              type="text"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="e.g., GitHub, Gmail, Netflix"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
              disabled={isLoading}
            />
          </div>

          {/* Username/Email */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username/Email *
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., user@example.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
              disabled={isLoading}
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password *
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-20"
                required
                disabled={isLoading}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={generatePassword}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                  title="Generate password"
                  disabled={isLoading}
                >
                  <RefreshCw size={14} className="text-gray-600" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                  title={showPassword ? 'Hide' : 'Show'}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff size={14} className="text-gray-600" />
                  ) : (
                    <Eye size={14} className="text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Password Strength:</span>
                  <span className={`text-xs font-medium ${strength.label === 'Weak' ? 'text-red-600' : strength.label === 'Fair' ? 'text-yellow-600' : strength.label === 'Good' ? 'text-blue-600' : 'text-green-600'}`}>
                    {strength.label}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${strength.color} transition-all`}
                    style={{ width: `${(strength.score / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* URL */}
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
              Website URL (Optional)
            </label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={handleUrlChange}
              placeholder="https://example.com"
              className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent ${
                urlError
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-purple-500'
              }`}
              disabled={isLoading}
              aria-invalid={!!urlError}
              aria-describedby={urlError ? 'url-error' : undefined}
            />
            {urlError && (
              <p id="url-error" className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <X size={14} />
                {urlError}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes..."
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              disabled={isLoading}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !!urlError}
            >
              {isLoading ? 'Saving...' : 'Save Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
