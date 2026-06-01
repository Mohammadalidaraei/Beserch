import { useState } from 'react';

export default function AIAnswerBox({ answer, sources, loading }) {
  const [expanded, setExpanded] = useState(false);

  if (loading) {
    return (
      <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border-primary/20 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">
            در حال تحلیل...
          </h3>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  if (!answer) {
    return null;
  }

  return (
    <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border-primary/20 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">
            پاسخ هوش مصنوعی
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            تولید شده بر اساس منابع معتبر
          </p>
        </div>
      </div>

      {/* Answer Content */}
      <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
        <p className={`text-gray-700 dark:text-gray-300 leading-relaxed ${!expanded && 'line-clamp-3'}`}>
          {answer}
        </p>
        
        {answer.length > 200 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-primary hover:underline text-sm font-medium mt-2"
          >
            {expanded ? 'نمایش کمتر' : 'نمایش بیشتر'}
          </button>
        )}
      </div>

      {/* Sources */}
      {sources && sources.length > 0 && (
        <div className="border-t border-primary/20 pt-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            منابع استفاده‌شده ({sources.length})
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sources.slice(0, expanded ? sources.length : 4).map((source, index) => (
              <a
                key={index}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">
                    {new URL(source.url).hostname.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">
                    {source.title || new URL(source.url).hostname}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {new URL(source.url).hostname}
                  </p>
                </div>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ))}
          </div>
          
          {sources.length > 4 && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="text-primary hover:underline text-sm font-medium mt-3"
            >
              نمایش {sources.length - 4} منبع دیگر
            </button>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-4 pt-4 border-t border-primary/20">
        <button
          onClick={() => {
            navigator.clipboard.writeText(answer);
            alert('پاسخ کپی شد');
          }}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          کپی پاسخ
        </button>
        
        <button
          onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(answer.substring(0, 100))}`, '_blank')}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          جستجوی مرتبط
        </button>
      </div>
    </div>
  );
}
