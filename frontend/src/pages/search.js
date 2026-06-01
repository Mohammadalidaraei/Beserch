import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import SearchBox from '../components/SearchBox';
import SearchResultItem from '../components/SearchResultItem';
import ImageResultsGrid from '../components/ImageResultsGrid';
import VideoResultsList from '../components/VideoResultsList';
import AIAnswerBox from '../components/AIAnswerBox';
import useSearch from '../hooks/useSearch';
import useTheme from '../hooks/useTheme';

export default function SearchPage() {
  const router = useRouter();
  const { q, type = 'web' } = router.query;
  const { theme, toggleTheme, mounted } = useTheme();
  const { 
    query, 
    setQuery, 
    results, 
    loading, 
    error, 
    search, 
    page, 
    totalResults,
    setPage 
  } = useSearch(q || '');
  
  const [activeTab, setActiveTab] = useState(type || 'web');
  const [aiAnswer, setAiAnswer] = useState(null);
  const [aiSources, setAiSources] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (q) {
      setQuery(q);
      search(q, activeTab, page);
      
      // Fetch AI answer for web search
      if (activeTab === 'web') {
        fetchAIAnswer(q);
      }
    }
  }, [q, activeTab, page]);

  const fetchAIAnswer = async (query) => {
    setAiLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/ai/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setAiAnswer(data.answer);
      setAiSources(data.sources || []);
    } catch (error) {
      console.error('Failed to fetch AI answer:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSearch = (newQuery) => {
    router.push(`/search?q=${encodeURIComponent(newQuery)}&type=${activeTab}`);
  };

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    router.push(`/search?q=${encodeURIComponent(query)}&type=${newTab}`);
    setPage(1);
  };

  const tabs = [
    { id: 'web', label: 'همه', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
    { id: 'images', label: 'تصاویر', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'videos', label: 'ویدیوها', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
    { id: 'news', label: 'اخبار', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-9-11h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z' },
    { id: 'ai', label: 'پاسخ هوشمند', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  ];

  if (!mounted) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{query ? `${query} - جستجوی BSearch` : 'جستجو - BSearch'}</title>
        <meta name="description" content="نتایج جستجو در BSearch" />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 py-4">
              {/* Logo & Search */}
              <div className="flex items-center gap-4 flex-1">
                <a href="/" className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">B</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white hidden sm:block">
                    BSearch
                  </span>
                </a>
                
                <div className="flex-1 max-w-2xl">
                  <SearchBox 
                    onSearch={handleSearch}
                    initialValue={query}
                    placeholder="جستجو..."
                    showButtons={false}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
                >
                  {theme === 'dark' ? (
                    <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                  </svg>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Results */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Results Info */}
          {!loading && !error && totalResults > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              حدود {(totalResults / 1000).toFixed(1)} هزار نتیجه ({((page - 1) * 10 + 1)}-{Math.min(page * 10, totalResults)})
            </p>
          )}

          {/* AI Answer */}
          {activeTab === 'web' && (aiAnswer || aiLoading) && (
            <div className="mb-8">
              <AIAnswerBox 
                answer={aiAnswer} 
                sources={aiSources} 
                loading={aiLoading} 
              />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading && !aiLoading && (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                </div>
              ))}
            </div>
          )}

          {/* Results Content */}
          {!loading && !error && (
            <>
              {activeTab === 'images' ? (
                <ImageResultsGrid images={results} />
              ) : activeTab === 'videos' ? (
                <VideoResultsList videos={results} />
              ) : activeTab === 'ai' ? (
                <AIAnswerBox answer={aiAnswer} sources={aiSources} loading={aiLoading} />
              ) : (
                <div className="space-y-4">
                  {results.map((result, index) => (
                    <SearchResultItem key={index} result={result} type="web" />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {results.length > 0 && (
                <div className="flex justify-center gap-4 mt-8">
                  {page > 1 && (
                    <button
                      onClick={() => setPage(page - 1)}
                      className="btn-secondary"
                    >
                      قبلی
                    </button>
                  )}
                  
                  <span className="flex items-center px-4 text-gray-600 dark:text-gray-400">
                    صفحه {page}
                  </span>
                  
                  {results.length === 10 && (
                    <button
                      onClick={() => setPage(page + 1)}
                      className="btn-secondary"
                    >
                      بعدی
                    </button>
                  )}
                </div>
              )}

              {/* No Results */}
              {results.length === 0 && !loading && (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    هیچ نتیجه‌ای یافت نشد
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                    لطفاً واژگان دیگری را امتحان کنید
                  </p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}
