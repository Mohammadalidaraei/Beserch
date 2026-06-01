'use client';

import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import SearchBox from '@/components/search/SearchBox';
import SearchResultItem from '@/components/search/SearchResultItem';
import SearchFilters from '@/components/search/SearchFilters';
import AIAnswerBox from '@/components/ai/AIAnswerBox';
import ImageResultsGrid from '@/components/search/ImageResultsGrid';
import VideoResultsList from '@/components/search/VideoResultsList';
import { searchApi } from '@/lib/api';
import type { SearchResponse, SearchResult, ImageResult, VideoResult } from '@/types';

type SearchType = 'all' | 'images' | 'videos' | 'news' | 'ai';

const SearchPage: NextPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [searchType, setSearchType] = useState<SearchType>((searchParams.get('type') as SearchType) || 'all');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [imageResults, setImageResults] = useState<ImageResult[]>([]);
  const [videoResults, setVideoResults] = useState<VideoResult[]>([]);

  useEffect(() => {
    const q = searchParams.get('q');
    const type = searchParams.get('type') as SearchType;
    if (q) {
      setQuery(q);
      if (type !== searchType) {
        setSearchType(type || 'all');
      }
      performSearch(q, type || 'all');
    }
  }, [searchParams]);

  const performSearch = async (searchQuery: string, type: SearchType) => {
    setLoading(true);
    try {
      let response;
      switch (type) {
        case 'images':
          response = await searchApi.searchImages({ q: searchQuery });
          setImageResults(response.results);
          break;
        case 'videos':
          response = await searchApi.searchVideos({ q: searchQuery });
          setVideoResults(response.results);
          break;
        default:
          response = await searchApi.search({ q: searchQuery, type: type === 'ai' ? 'ai' : undefined });
          setResults(response);
          break;
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (newQuery: string) => {
    if (newQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(newQuery)}&type=${searchType}`);
    }
  };

  const handleTypeChange = (type: SearchType) => {
    router.push(`/search?q=${encodeURIComponent(query)}&type=${type}`);
  };

  const tabs: { id: SearchType; label: string; icon?: React.ReactNode }[] = [
    { id: 'all', label: 'همه' },
    { id: 'images', label: 'تصاویر' },
    { id: 'videos', label: 'ویدیوها' },
    { id: 'news', label: 'اخبار' },
    { id: 'ai', label: 'پاسخ هوشمند' },
  ];

  return (
    <>
      <Head>
        <title>{query ? `${query} - جستجوی BSearch` : 'جستجو - BSearch'}</title>
        <meta name="description" content={`نتایج جستجو برای: ${query}`} />
      </Head>

      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center gap-4">
              {/* Logo */}
              <a href="/" className="text-2xl font-bold flex-shrink-0">
                <span className="text-blue-500">B</span>
                <span className="text-gray-700 dark:text-gray-300">Search</span>
              </a>

              {/* Search Box */}
              <div className="flex-1 max-w-2xl">
                <SearchBox
                  value={query}
                  onChange={setQuery}
                  onSearch={handleSearch}
                  isLoading={loading}
                />
              </div>
            </div>

            {/* Tabs */}
            <nav className="flex gap-1 mt-3 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTypeChange(tab.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                    searchType === tab.id
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* AI Answer */}
              {searchType === 'ai' && results?.aiAnswer && (
                <AIAnswerBox answer={results.aiAnswer} />
              )}

              {/* Filters */}
              {searchType === 'all' && <SearchFilters />}

              {/* Results */}
              {searchType === 'all' && results?.results && (
                <div className="space-y-6">
                  {results.results.map((result: SearchResult, index: number) => (
                    <SearchResultItem key={result.id || index} result={result} position={index + 1} />
                  ))}
                </div>
              )}

              {searchType === 'images' && imageResults.length > 0 && (
                <ImageResultsGrid images={imageResults} />
              )}

              {searchType === 'videos' && videoResults.length > 0 && (
                <VideoResultsList videos={videoResults} />
              )}

              {/* No Results */}
              {!loading && (
                ((searchType === 'all' && results?.results.length === 0) ||
                  (searchType === 'images' && imageResults.length === 0) ||
                  (searchType === 'videos' && videoResults.length === 0)) && (
                  <div className="text-center py-12">
                    <svg
                      className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      نتیجه‌ای یافت نشد
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      لطفاً واژه‌های دیگری را امتحان کنید
                    </p>
                  </div>
                )
              )}

              {/* Pagination */}
              {results && results.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    disabled={results.currentPage === 1}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    قبلی
                  </button>
                  <span className="text-gray-600 dark:text-gray-400">
                    صفحه {results.currentPage} از {results.totalPages}
                  </span>
                  <button
                    disabled={results.currentPage === results.totalPages}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    بعدی
                  </button>
                </div>
              )}
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 dark:border-gray-800 py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
            © ۱۴۰۳ BSearch - موتور جستجوی هوشمند فارسی
          </div>
        </footer>
      </div>
    </>
  );
};

export default SearchPage;
