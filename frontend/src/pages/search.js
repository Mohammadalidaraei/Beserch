import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../components/Layout';
import SearchBox from '../components/SearchBox';
import SearchTabs from '../components/SearchTabs';
import SearchResultItem from '../components/SearchResultItem';
import ImageResultsGrid from '../components/ImageResultsGrid';
import VideoResultsList from '../components/VideoResultsList';
import AIAnswerBox from '../components/AIAnswerBox';
import { useSearch } from '../hooks/useSearch';
import { api, aiApi } from '../utils/api';

export default function SearchPage() {
  const router = useRouter();
  const { q, type: initialType } = router.query;
  const [searchType, setSearchType] = useState(initialType || 'web');
  const [aiAnswer, setAiAnswer] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const {
    query,
    results,
    loading,
    error,
    handleSearch,
    setQuery,
  } = useSearch(q || '');

  useEffect(() => {
    if (q) {
      setQuery(q);
    }
  }, [q, setQuery]);

  useEffect(() => {
    setSearchType(initialType || 'web');
  }, [initialType]);

  useEffect(() => {
    if (searchType === 'ai' && query && !aiAnswer && !aiLoading) {
      fetchAiAnswer(query);
    }
  }, [searchType, query]);

  const fetchAiAnswer = async (searchQuery) => {
    setAiLoading(true);
    try {
      const data = await aiApi.aiSearch(searchQuery);
      setAiAnswer(data.answer || data);
    } catch (err) {
      console.error('AI Search Error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleTabChange = (newType) => {
    setSearchType(newType);
    const params = new URLSearchParams({ q: query, type: newType });
    router.push(`/search?${params.toString()}`, undefined, { shallow: true });
    
    if (newType === 'ai' && query && !aiAnswer) {
      fetchAiAnswer(query);
    }
  };

  const getDisplayResults = () => {
    if (!results || results.length === 0) return [];
    
    switch (searchType) {
      case 'images':
        return results;
      case 'videos':
        return results;
      default:
        return results;
    }
  };

  const renderResults = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-12">
          <div className="loading-spinner"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12 text-red-500">
          خطا در بارگذاری نتایج: {error}
        </div>
      );
    }

    if (searchType === 'ai' && aiAnswer) {
      return <AIAnswerBox answer={aiAnswer} />;
    }

    if (searchType === 'images') {
      return <ImageResultsGrid images={getDisplayResults()} />;
    }

    if (searchType === 'videos') {
      return <VideoResultsList videos={getDisplayResults()} />;
    }

    // Default web results
    return (
      <div className="space-y-4">
        {aiAnswer && searchType === 'web' && (
          <AIAnswerBox answer={aiAnswer} />
        )}
        
        {getDisplayResults().map((result, index) => (
          <SearchResultItem key={index} result={result} />
        ))}
        
        {getDisplayResults().length === 0 && !aiAnswer && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            هیچ نتیجه‌ای یافت نشد.
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>{query ? `${query} - جستجو در BSearch` : 'جستجو - BSearch'}</title>
        <meta name="robots" content="noindex, follow" />
      </Head>

      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
          {/* Search Header */}
          <div className="bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border sticky top-16 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <SearchBox
                onSearch={handleSearch}
                initialValue={query}
                placeholder="جستجو..."
                size="medium"
                showAiButton={true}
                onAiSearch={(q) => {
                  setSearchType('ai');
                  handleSearch(q);
                }}
              />
            </div>
          </div>

          {/* Search Tabs */}
          <SearchTabs activeTab={searchType} onTabChange={handleTabChange} />

          {/* Results Section */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {renderResults()}

            {/* Pagination (placeholder) */}
            {!loading && !error && getDisplayResults().length > 0 && (
              <div className="flex justify-center mt-8 gap-2">
                <button className="px-4 py-2 bg-primary-600 text-white rounded-lg">
                  ۱
                </button>
                <button className="px-4 py-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-border">
                  ۲
                </button>
                <button className="px-4 py-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-border">
                  ۳
                </button>
                <span className="px-4 py-2 text-gray-500">...</span>
                <button className="px-4 py-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-border">
                  بعدی
                </button>
              </div>
            )}
          </main>
        </div>
      </Layout>
    </>
  );
}
