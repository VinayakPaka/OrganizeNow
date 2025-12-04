'use client';

import { useState } from 'react';
import {
  Wand2,
  CheckCircle,
  FileText,
  Sparkles,
  Languages,
  Maximize2,
  Loader2,
} from 'lucide-react';
import { AIOperation } from '@/lib/ai/gemini';

interface NotesAIToolbarProps {
  selectedText: string;
  onApplyResult: (newText: string) => void;
}

/**
 * AI Toolbar for Notes
 * Provides AI-powered text operations: rephrase, grammar, summarize, expand
 */
export function NotesAIToolbar({ selectedText, onApplyResult }: NotesAIToolbarProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const processText = async (operation: AIOperation) => {
    if (!selectedText.trim()) {
      setError('Please select some text first');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await fetch('/api/ai/process-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation,
          text: selectedText,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'AI processing failed');
      }

      const data = await response.json();
      setResult(data.result);
    } catch (err: any) {
      console.error('[NotesAIToolbar] Error:', err);
      setError(err.message || 'Failed to process text');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (result) {
      onApplyResult(result);
      setResult('');
    }
  };

  const handleCancel = () => {
    setResult('');
    setError('');
  };

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-3 shadow-sm">
      <div className="flex items-center gap-2 flex-wrap">
        {/* AI Operation Buttons */}
        <button
          type="button"
          onClick={() => processText('rephrase')}
          disabled={loading || !selectedText}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          title="Rephrase selected text"
        >
          <Wand2 size={16} />
          Rephrase
        </button>

        <button
          type="button"
          onClick={() => processText('grammar')}
          disabled={loading || !selectedText}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          title="Fix grammar and spelling"
        >
          <CheckCircle size={16} />
          Grammar
        </button>

        <button
          type="button"
          onClick={() => processText('summarize')}
          disabled={loading || !selectedText}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          title="Summarize text"
        >
          <FileText size={16} />
          Summarize
        </button>

        <button
          type="button"
          onClick={() => processText('expand')}
          disabled={loading || !selectedText}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-orange-50 dark:bg-orange-900/30 hover:bg-orange-100 dark:hover:bg-orange-900/50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          title="Expand with more details"
        >
          <Maximize2 size={16} />
          Expand
        </button>

        <button
          type="button"
          onClick={() => processText('simplify')}
          disabled={loading || !selectedText}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-pink-50 dark:bg-pink-900/30 hover:bg-pink-100 dark:hover:bg-pink-900/50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          title="Simplify text"
        >
          <Sparkles size={16} />
          Simplify
        </button>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
            <Loader2 size={16} className="animate-spin" />
            Processing...
          </div>
        )}

        {error && (
          <div className="flex-1 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
      </div>

      {/* Result Preview */}
      {result && (
        <div className="mt-3 border-t border-gray-200 dark:border-gray-700 pt-3">
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3 mb-2">
            <div className="text-sm font-medium text-purple-900 dark:text-purple-300 mb-1">
              AI Result:
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {result}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition text-sm font-medium"
            >
              Apply Changes
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
