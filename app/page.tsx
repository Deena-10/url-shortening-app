'use client';

import { useState, useEffect } from 'react';

interface Url {
  id: string;
  originalUrl: string;
  shortUrl: string;
  shortCode: string;
  clickCount: number;
  createdAt: string;
}

interface ShortenResponse {
  success: boolean;
  data?: {
    id: string;
    originalUrl: string;
    shortUrl: string;
    shortCode: string;
    clickCount: number;
    createdAt: string;
  };
  error?: string;
}

interface UrlsResponse {
  success: boolean;
  data?: Url[];
  count?: number;
  error?: string;
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [shortenedUrl, setShortenedUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [urls, setUrls] = useState<Url[]>([]);
  const [urlsLoading, setUrlsLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  // Fetch all URLs on component mount
  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    try {
      setUrlsLoading(true);
      const response = await fetch('/api/urls');
      const data: UrlsResponse = await response.json();

      if (data.success && data.data) {
        setUrls(data.data);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to fetch URLs' });
      }
    } catch (error) {
      console.error('Error fetching URLs:', error);
      setMessage({ type: 'error', text: 'Failed to fetch URLs' });
    } finally {
      setUrlsLoading(false);
    }
  };

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setMessage({ type: 'error', text: 'Please enter a URL' });
      return;
    }

    setLoading(true);
    setMessage(null);
    setShortenedUrl(null);

    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data: ShortenResponse = await response.json();

      if (data.success && data.data) {
        setShortenedUrl(data.data.shortUrl);
        setMessage({ type: 'success', text: 'URL shortened successfully!' });
        setUrl(''); // Clear input
        // Refresh the URLs list
        fetchUrls();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to shorten URL' });
      }
    } catch (error) {
      console.error('Error shortening URL:', error);
      setMessage({ type: 'error', text: 'Failed to shorten URL. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shortenedUrl) return;

    try {
      await navigator.clipboard.writeText(shortenedUrl);
      setMessage({ type: 'success', text: 'URL copied to clipboard!' });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      setMessage({ type: 'error', text: 'Failed to copy URL' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this URL?')) {
      return;
    }

    try {
      setDeletingIds(prev => new Set(prev).add(id));
      const response = await fetch(`/api/urls/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'URL deleted successfully!' });
        // Remove from list immediately
        setUrls(prev => prev.filter(u => u.id !== id));
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to delete URL' });
      }
    } catch (error) {
      console.error('Error deleting URL:', error);
      setMessage({ type: 'error', text: 'Failed to delete URL. Please try again.' });
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">URL Shortener</h1>
          <p className="text-gray-600">Shorten your long URLs quickly and easily</p>
        </div>

        {/* URL Shortening Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleShorten} className="space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                Enter URL to shorten
              </label>
              <div className="flex gap-2">
                <input
                  id="url"
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/very/long/url"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !url.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {loading ? 'Shortening...' : 'Shorten'}
                </button>
              </div>
            </div>
          </form>

          {/* Success/Error Messages */}
          {message && (
            <div
              className={`mt-4 p-3 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Shortened URL Display */}
          {shortenedUrl && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <label htmlFor="shortened-url" className="block text-sm font-medium text-gray-700 mb-2">
                Shortened URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="shortened-url"
                  type="text"
                  value={shortenedUrl}
                  readOnly
                  aria-label="Shortened URL"
                  className="flex-1 px-3 py-2 bg-white border border-blue-300 rounded text-blue-700 font-mono text-sm"
                />
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
                >
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>

        {/* URLs Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Shortened URLs</h2>

          {urlsLoading ? (
            <div className="text-center py-8 text-gray-500">Loading URLs...</div>
          ) : urls.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No shortened URLs yet. Create one above!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Original URL
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Short URL
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Clicks
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {urls.map((urlItem) => (
                    <tr key={urlItem.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900 truncate max-w-xs" title={urlItem.originalUrl}>
                          {urlItem.originalUrl}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <a
                          href={urlItem.shortUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-mono"
                        >
                          {urlItem.shortUrl}
                        </a>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-900 font-medium">{urlItem.clickCount}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-500">{formatDate(urlItem.createdAt)}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          onClick={() => handleDelete(urlItem.id)}
                          disabled={deletingIds.has(urlItem.id)}
                          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                          {deletingIds.has(urlItem.id) ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
