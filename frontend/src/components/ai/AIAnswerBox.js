import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function AIAnswerBox({ answer, sources, loading }) {
  const [expanded, setExpanded] = useState(true);

  if (loading) {
    return (
      <div className="card animate-pulse mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary-200 dark:bg-primary-900 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-primary-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  if (!answer) return null;

  return (
    <div className="card mb-6 border-primary-200 dark:border-primary-800 bg-gradient-to-br from-white to-primary-50 dark:from-dark-card dark:to-primary-900/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">
              پاسخ هوش مصنوعی
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              تولید شده بر اساس منابع معتبر
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label={expanded ? 'بستن' : 'باز کردن'}
        >
          <svg 
            className={`w-5 h-5 text-gray-600 dark:text-gray-400 transform transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Answer Content */}
      {expanded && (
        <div className="animate-slide-up">
          <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {answer.content || answer}
            </ReactMarkdown>
          </div>

          {/* Sources */}
          {sources && sources.length > 0 && (
            <div className="border-t border-gray-200 dark:border-dark-border pt-4">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                منابع استفاده‌شده
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sources.slice(0, 4).map((source, index) => (
                  <a
                    key={index}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3 bg-white dark:bg-dark-card rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <span className="flex-shrink-0 w-6 h-6 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-primary-600 dark:text-primary-400 group-hover:underline line-clamp-1">
                        {source.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                        {source.domain}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Feedback */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-dark-border">
            <span className="text-sm text-gray-500 dark:text-gray-400">آیا این پاسخ مفید بود؟</span>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg transition-colors" title="مفید">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
              </button>
              <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors" title="غیرمفید">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
