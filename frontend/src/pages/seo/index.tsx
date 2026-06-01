'use client';

import { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import SearchBox from '@/components/search/SearchBox';
import ThemeToggle from '@/components/common/ThemeToggle';
import LanguageSelector from '@/components/common/LanguageSelector';
import { seoApi } from '@/lib/api';
import type { SEOAnalysis } from '@/types';
import SEOScoreCard from '@/components/seo/SEOScoreCard';
import SEORecommendations from '@/components/seo/SEORecommendations';

const SEOAssistantPage: NextPage = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (searchUrl: string) => {
    if (!searchUrl.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const result = await seoApi.analyze(searchUrl);
      setAnalysis(result);
    } catch (err) {
      setError('خطا در تحلیل سایت. لطفاً آدرس را بررسی کنید.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFixes = async () => {
    if (!analysis?.url) return;
    // Implementation for generating fixes
    alert('تولید پیشنهادات سئو در حال انجام است...');
  };

  return (
    <>
      <Head>
        <title>دستیار سئو - BSearch</title>
        <meta name="description" content="تحلیل رایگان سئو وبسایت با دستیار هوشمند BSearch" />
      </Head>

      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
        {/* Header */}
        <header className="border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-2xl font-bold">
              <span className="text-blue-500">B</span>
              <span className="text-gray-700 dark:text-gray-300">Search</span>
            </a>
            <div className="flex items-center gap-4">
              <a href="/" className="text-sm text-gray-600 dark:text-gray-300 hover:underline">
                صفحه اصلی
              </a>
              <LanguageSelector />
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              دستیار هوشمند سئو
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              تحلیل کامل سئو وبسایت شما با هوش مصنوعی
            </p>

            {/* URL Input */}
            <div className="max-w-2xl mx-auto">
              <SearchBox
                value={url}
                onChange={setUrl}
                onSearch={handleAnalyze}
                placeholder="آدرس وبسایت خود را وارد کنید (مثال: https://example.com)"
                isLoading={loading}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="max-w-4xl mx-auto mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Results */}
          {analysis && (
            <div className="space-y-8">
              {/* Score Card */}
              <SEOScoreCard analysis={analysis} />

              {/* Detailed Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Title Analysis */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">عنوان صفحه</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">طول عنوان:</span>
                      <span className={`text-sm font-medium ${
                        analysis.title.optimal ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {analysis.title.length} کاراکتر
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      {analysis.title.value || 'بدون عنوان'}
                    </p>
                    {analysis.title.issues.length > 0 && (
                      <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                        {analysis.title.issues.map((issue, i) => (
                          <li key={i}>• {issue}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Meta Description */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">توضیحات متا</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">طول توضیحات:</span>
                      <span className={`text-sm font-medium ${
                        analysis.metaDescription.optimal ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {analysis.metaDescription.length} کاراکتر
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      {analysis.metaDescription.value || 'بدون توضیحات متا'}
                    </p>
                    {analysis.metaDescription.issues.length > 0 && (
                      <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                        {analysis.metaDescription.issues.map((issue, i) => (
                          <li key={i}>• {issue}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Headings Structure */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">ساختار هدینگ‌ها</h3>
                  <div className="flex gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{analysis.headings.h1}</div>
                      <div className="text-xs text-gray-500">H1</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{analysis.headings.h2}</div>
                      <div className="text-xs text-gray-500">H2</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{analysis.headings.h3}</div>
                      <div className="text-xs text-gray-500">H3</div>
                    </div>
                  </div>
                  {analysis.headings.issues.length > 0 && (
                    <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                      {analysis.headings.issues.map((issue, i) => (
                        <li key={i}>• {issue}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Images */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">تصاویر</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">کل تصاویر:</span>
                      <span className="font-medium">{analysis.images.total}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">با متن جایگزین:</span>
                      <span className="font-medium text-green-600">{analysis.images.withAlt}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">بدون متن جایگزین:</span>
                      <span className="font-medium text-red-600">{analysis.images.withoutAlt}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <SEORecommendations recommendations={analysis.recommendations} />

              {/* Generate Fixes Button */}
              <div className="text-center">
                <button
                  onClick={handleGenerateFixes}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg font-medium"
                >
                  تولید پیشنهادات اصلاح خودکار
                </button>
              </div>
            </div>
          )}

          {/* Features Section */}
          {!analysis && !loading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              {[
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  title: 'تحلیل کامل',
                  description: 'بررسی عنوان، متا، هدینگ‌ها، تصاویر و لینک‌ها',
                },
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  ),
                  title: 'سرعت و عملکرد',
                  description: 'سنجش Core Web Vitals و سرعت بارگذاری',
                },
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  ),
                  title: 'واکنش‌گرا',
                  description: 'بررسی سازگاری با موبایل و تبلت',
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center"
                >
                  <div className="text-blue-500 mb-4 flex justify-center">{feature.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 dark:border-gray-800 py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
            © ۱۴۰۳ BSearch - دستیار هوشمند سئو
          </div>
        </footer>
      </div>
    </>
  );
};

export default SEOAssistantPage;
