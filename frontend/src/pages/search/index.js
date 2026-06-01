import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import SearchBox from '../../components/search/SearchBox';
import SearchResultItem from '../../components/search/SearchResultItem';
import ImageResultsGrid from '../../components/search/ImageResultsGrid';
import AIAnswerBox from '../../components/ai/AIAnswerBox';
import ThemeToggle from '../../components/common/ThemeToggle';
import LanguageSelector from '../../components/common/LanguageSelector';
import { searchApi, aiSearchApi } from '../../lib/api';

export default function SearchPage() {
  const router = useRouter();
  const { q, type = 'web' } = router.query;
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiAnswer, setAiAnswer] = useState(null);
  const [aiSources, setAiSources] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(type);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    if (q) {
      performSearch(q, activeTab, 1);
      if (activeTab === 'web' || activeTab === 'ai') {
        fetchAIAnswer(q);
      }
    }
  }, [q, activeTab]);

  const performSearch = async (query, searchType, pageNum) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      switch (searchType) {
        case 'images': response = await searchApi.images(query, pageNum); break;
        case 'videos': response = await searchApi.videos(query, pageNum); break;
        case 'news': response = await searchApi.news(query, pageNum); break;
        default: response = await searchApi.web(query, pageNum);
      }
      setResults(response.data.results || []);
      setTotalResults(response.data.total || 0);
      setPage(pageNum);
    } catch (err) {
      setError(err.response?.data?.message || 'Error in search');
    } finally {
      setLoading(false);
    }
  };

  const fetchAIAnswer = async (query) => {
    setAiLoading(true);
    try {
      const response = await aiSearchApi.answer(query);
      setAiAnswer(response.data.answer);
      setAiSources(response.data.sources || []);
    } catch (err) {
      console.error('AI Answer error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const tabs = [
    { id: 'web', label: 'All' },
    { id: 'images', label: 'Images' },
    { id: 'videos', label: 'Videos' },
    { id: 'news', label: 'News' },
    { id: 'ai', label: 'AI Answer' },
  ];

  return (
    <>
      <Head>
        <title>{q ? `${q} - BSearch` : 'Search - BSearch'}</title>
        <meta name="robots" content="noindex,follow" />
      </Head>
      <div className="min-h-screen flex flex-col" dir="rtl">
        <header className="sticky top-0 z-40 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex items-center gap-4">
              <a href="/" className="text-2xl font-bold text-primary-600 shrink-0">BSearch</a>
              <div className="flex-1 max-w-2xl">
                <SearchBox initialQuery={q || ''} size="small" />
              </div>
              <div className="flex items-center gap-2 mr-auto">
                <LanguageSelector />
                <ThemeToggle />
              </div>
            </div>
            <div className="flex gap-1 mt-3 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 text-sm font-medium ${activeTab === tab.id ? 'bg-primary-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </header>
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
          {!loading && !error && totalResults > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">About {Math.round(totalResults / 1000)}K results</p>
          )}
          {(activeTab === 'web' || activeTab === 'ai') && (aiAnswer || aiLoading) && (
            <AIAnswerBox answer={aiAnswer} sources={aiSources} loading={aiLoading} />
          )}
          {error && (
            <div className="card text-center py-12">
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Error</h3>
              <p className="text-gray-500 dark:text-gray-400">{error}</p>
            </div>
          )}
          {loading && (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && !error && (
            <>
              {activeTab === 'images' ? (
                <ImageResultsGrid images={results} />
              ) : (
                <div className="space-y-4">
                  {results.map((result, index) => (
                    <SearchResultItem key={index} result={result} />
                  ))}
                </div>
              )}
              {results.length > 0 && results.length < totalResults && (
                <div className="flex justify-center mt-8 gap-2">
                  <button onClick={() => performSearch(q, activeTab, page - 1)} disabled={page <= 1} className="btn-secondary disabled:opacity-50">Previous</button>
                  <span className="px-4 py-2 text-gray-600 dark:text-gray-400">Page {page}</span>
                  <button onClick={() => performSearch(q, activeTab, page + 1)} className="btn-secondary">Next</button>
                </div>
              )}
              {results.length === 0 && !loading && (
                <div className="card text-center py-12">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">No results found</h3>
                  <p className="text-gray-500 dark:text-gray-400">Try different keywords</p>
                </div>
              )}
            </>
          )}
        </main>
        <footer className="border-t border-gray-200 dark:border-dark-border py-6 px-4 mt-auto">
          <div className="max-w-6xl mx-auto text-center text-sm text-gray-500 dark:text-gray-400">2024 BSearch</div>
        </footer>
      </div>
    </>
  );
}
