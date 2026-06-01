import React from 'react';
import type { AIAnswer } from '@/types';

interface AIAnswerBoxProps {
  answer: AIAnswer;
}

const AIAnswerBox: React.FC<AIAnswerBoxProps> = ({ answer }) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">پاسخ هوشمند</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">تولید شده توسط هوش مصنوعی</p>
        </div>
        {answer.confidence && (
          <div className="mr-auto flex items-center gap-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">اطمینان:</span>
            <span className={`text-xs font-medium ${
              answer.confidence > 0.8 ? 'text-green-600 dark:text-green-400' :
              answer.confidence > 0.6 ? 'text-yellow-600 dark:text-yellow-400' :
              'text-red-600 dark:text-red-400'
            }`}>
              {Math.round(answer.confidence * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Answer Content */}
      <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
        <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line">
          {answer.answer}
        </p>
      </div>

      {/* Sources */}
      {answer.sources && answer.sources.length > 0 && (
        <div className="border-t border-blue-200 dark:border-blue-800 pt-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">منابع:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {answer.sources.slice(0, 4).map((source, index) => (
              <a
                key={index}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
              >
                <span className="flex-shrink-0 w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:underline line-clamp-1">
                    {source.title}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                    {source.snippet}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Generated Time */}
      {answer.generatedAt && (
        <div className="mt-4 text-xs text-gray-400 dark:text-gray-500 text-left">
          به‌روزرسانی: {new Date(answer.generatedAt).toLocaleString('fa-IR')}
        </div>
      )}
    </div>
  );
};

export default AIAnswerBox;
