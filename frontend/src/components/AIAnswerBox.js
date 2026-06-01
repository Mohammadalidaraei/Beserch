import { useState } from 'react';
import { FaRobot, FaLink, FaCopy, FaCheck } from 'react-icons/fa';

export default function AIAnswerBox({ answer }) {
  const [copied, setCopied] = useState(false);
  
  if (!answer) {
    return null;
  }

  const {
    text,
    sources,
    confidence,
    query,
    followUpQuestions,
  } = answer;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-6 md:p-8 mb-8 border border-purple-200 dark:border-purple-800">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
          <FaRobot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            پاسخ هوشمند
          </h2>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>سوال: {query}</span>
            {confidence && (
              <>
                <span>•</span>
                <span>اطمینان: {(confidence * 100).toFixed(0)}%</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Answer Text */}
      <div className="relative mb-6">
        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
            {text}
          </p>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="absolute top-0 left-0 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          title="کپی کردن پاسخ"
          aria-label="کپی کردن"
        >
          {copied ? (
            <FaCheck className="w-4 h-4 text-green-500" />
          ) : (
            <FaCopy className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Sources */}
      {sources && sources.length > 0 && (
        <div className="border-t border-purple-200 dark:border-purple-800 pt-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <FaLink className="w-4 h-4" />
            منابع استفاده‌شده ({sources.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {sources.slice(0, 4).map((source, index) => (
              <a
                key={index}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 p-2 bg-white dark:bg-dark-card rounded-lg hover:shadow-md transition-all text-sm group"
              >
                <span className="flex-shrink-0 w-5 h-5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded text-xs flex items-center justify-center font-medium">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-800 dark:text-gray-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 truncate">
                    {source.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {source.domain}
                  </p>
                </div>
              </a>
            ))}
          </div>
          
          {sources.length > 4 && (
            <div className="mt-3 text-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                و {sources.length - 4} منبع دیگر
              </span>
            </div>
          )}
        </div>
      )}

      {/* Follow-up Questions */}
      {followUpQuestions && followUpQuestions.length > 0 && (
        <div className="border-t border-purple-200 dark:border-purple-800 pt-4 mt-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            سوالات مرتبط
          </h3>
          <div className="flex flex-wrap gap-2">
            {followUpQuestions.map((question, index) => (
              <button
                key={index}
                className="px-3 py-2 bg-white dark:bg-dark-card border border-purple-200 dark:border-purple-800 rounded-full text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:border-purple-400 transition-all"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-800">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          این پاسخ توسط هوش مصنوعی تولید شده است. لطفاً اطلاعات مهم را از منابع اصلی بررسی کنید.
        </p>
      </div>
    </div>
  );
}
