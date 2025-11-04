'use client';

import { useState, useEffect } from 'react';
import { Search as SearchIcon, FileText, Grid3x3, Lock, Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SearchResult {
  id: string;
  type: 'page' | 'board' | 'password';
  title?: string;
  service_name?: string;
  description?: string;
  content?: string;
  username?: string;
  url?: string;
  icon?: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Unified Search Page
 * Search across Notes, Boards, and Passwords
 */
export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [counts, setCounts] = useState({ pages: 0, boards: 0, passwords: 0, total: 0 });

  // Perform search with debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setCounts({ pages: 0, boards: 0, passwords: 0, total: 0 });
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (response.ok) {
          setResults(data.results || []);
          setCounts(data.count || { pages: 0, boards: 0, passwords: 0, total: 0 });
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleResultClick = (result: SearchResult) => {
    switch (result.type) {
      case 'page':
        router.push(`/notes`);
        break;
      case 'board':
        router.push(`/board/${result.id}`);
        break;
      case 'password':
        router.push(`/vault`);
        break;
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'page':
        return <FileText size={20} className="text-purple-600" />;
      case 'board':
        return <Grid3x3 size={20} className="text-blue-600" />;
      case 'password':
        return <Lock size={20} className="text-green-600" />;
      default:
        return <SearchIcon size={20} className="text-gray-600" />;
    }
  };

  const getResultTitle = (result: SearchResult) => {
    return result.title || result.service_name || 'Untitled';
  };

  const getResultPreview = (result: SearchResult) => {
    if (result.content) {
      const text = result.content.replace(/<[^>]*>/g, '');
      return text.length > 150 ? text.substring(0, 150) + '...' : text;
    }
    if (result.description) return result.description;
    if (result.username) return `Username: ${result.username}`;
    return 'No description';
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <SearchIcon size={32} />
            Search
          </h1>

          {/* Search Input */}
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notes, boards, and passwords..."
              className="w-full pl-12 pr-12 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} className="text-gray-400" />
              </button>
            )}
            {isSearching && (
              <Loader2
                className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-purple-600"
                size={20}
              />
            )}
          </div>

          {/* Result Counts */}
          {query && counts.total > 0 && (
            <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
              <span className="font-medium">{counts.total} results</span>
              {counts.pages > 0 && <span>{counts.pages} notes</span>}
              {counts.boards > 0 && <span>{counts.boards} boards</span>}
              {counts.passwords > 0 && <span>{counts.passwords} passwords</span>}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-4xl mx-auto">
          {!query && (
            <div className="text-center py-20">
              <SearchIcon size={64} className="mx-auto text-gray-300 mb-4" />
              <h2 className="text-xl font-semibold text-gray-600 mb-2">
                Search across everything
              </h2>
              <p className="text-gray-500">
                Find notes, boards, and passwords in one place
              </p>
            </div>
          )}

          {query && !isSearching && results.length === 0 && (
            <div className="text-center py-20">
              <SearchIcon size={64} className="mx-auto text-gray-300 mb-4" />
              <h2 className="text-xl font-semibold text-gray-600 mb-2">
                No results found
              </h2>
              <p className="text-gray-500">
                Try different keywords or check your spelling
              </p>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-3">
              {results.map((result) => (
                <div
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md hover:border-purple-300 transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {result.icon ? (
                        <span className="text-2xl">{result.icon}</span>
                      ) : (
                        getResultIcon(result.type)
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {getResultTitle(result)}
                        </h3>
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 capitalize">
                          {result.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {getResultPreview(result)}
                      </p>
                      <div className="mt-2 text-xs text-gray-500">
                        Updated {new Date(result.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
