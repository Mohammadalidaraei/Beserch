import React from 'react';
import type { SEORecommendation } from '@/types';

interface SEORecommendationsProps {
  recommendations: SEORecommendation[];
}

const SEORecommendations: React.FC<SEORecommendationsProps> = ({ recommendations }) => {
  const getPriorityColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    }
  };

  const getPriorityLabel = (type: string) => {
    switch (type) {
      case 'critical':
        return 'حیاتی';
      case 'warning':
        return 'هشدار';
      default:
        return 'اطلاعات';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center">
        <svg
          className="w-12 h-12 mx-auto text-green-500 mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-1">
          عالی! هیچ مشکلی یافت نشد
        </h3>
        <p className="text-green-600 dark:text-green-400 text-sm">
          وبسایت شما از نظر سئو بهینه است.
        </p>
      </div>
    );
  }

  // Group by priority
  const critical = recommendations.filter((r) => r.type === 'critical');
  const warnings = recommendations.filter((r) => r.type === 'warning');
  const info = recommendations.filter((r) => r.type === 'info');

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
        پیشنهادات بهبود ({recommendations.length})
      </h3>

      {/* Critical Issues */}
      {critical.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide">
            مشکلات حیادی ({critical.length})
          </h4>
          {critical.map((rec, index) => (
            <RecommendationCard key={index} recommendation={rec} />
          ))}
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-yellow-600 dark:text-yellow-400 uppercase tracking-wide">
            هشدارها ({warnings.length})
          </h4>
          {warnings.map((rec, index) => (
            <RecommendationCard key={index} recommendation={rec} />
          ))}
        </div>
      )}

      {/* Info */}
      {info.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
            پیشنهادات ({info.length})
          </h4>
          {info.map((rec, index) => (
            <RecommendationCard key={index} recommendation={rec} />
          ))}
        </div>
      )}
    </div>
  );
};

interface RecommendationCardProps {
  recommendation: SEORecommendation;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation }) => {
  return (
    <div
      className={`border rounded-lg p-4 ${getPriorityColor(recommendation.type)}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">{getIcon(recommendation.type)}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-bold">{recommendation.title}</span>
            <span className="text-xs px-2 py-0.5 bg-white/50 dark:bg-black/20 rounded-full">
              {getPriorityLabel(recommendation.type)}
            </span>
          </div>
          <p className="text-sm opacity-90 mb-3">{recommendation.description}</p>
          {recommendation.suggestion && (
            <div className="bg-white/70 dark:bg-black/20 rounded p-3 text-sm">
              <strong>پیشنهاد:</strong> {recommendation.suggestion}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SEORecommendations;
