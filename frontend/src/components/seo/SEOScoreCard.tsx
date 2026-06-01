import React from 'react';
import type { SEOAnalysis } from '@/types';

interface SEOScoreCardProps {
  analysis: SEOAnalysis;
}

const SEOScoreCard: React.FC<SEOScoreCardProps> = ({ analysis }) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 90) return 'from-green-500 to-emerald-600';
    if (score >= 70) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-rose-600';
  };

  const circumference = 2 * Math.PI * 45; // r = 45
  const strokeDashoffset = circumference - (analysis.score / 100) * circumference;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Score Circle */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-gray-200 dark:text-gray-700"
            />
            {/* Progress Circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              className={`text-transparent bg-gradient-to-r ${getScoreGradient(analysis.score)}`}
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset,
                transition: 'stroke-dashoffset 0.5s ease-in-out',
              }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-3xl font-bold ${getScoreColor(analysis.score)}`}>
              {analysis.score}
            </span>
          </div>
        </div>

        {/* Score Details */}
        <div className="flex-1 text-center md:text-right">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            امتیاز سئو: {analysis.score}/100
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {analysis.score >= 90
              ? 'عالی! وبسایت شما از نظر سئو در وضعیت بسیار خوبی قرار دارد.'
              : analysis.score >= 70
              ? 'خوب! وبسایت شما وضعیت مناسبی دارد اما جای بهبود وجود دارد.'
              : 'نیاز به بهبود! وبسایت شما نیاز به توجه و بهینه‌سازی دارد.'}
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className={`text-2xl font-bold ${analysis.mobileFriendly ? 'text-green-600' : 'text-red-600'}`}>
                {analysis.mobileFriendly ? '✓' : '✗'}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">موبایل</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className={`text-2xl font-bold ${
                analysis.speedScore >= 80 ? 'text-green-600' : 
                analysis.speedScore >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {analysis.speedScore}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">سرعت</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {analysis.links.internal}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">لینک داخلی</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className={`text-2xl font-bold ${
                analysis.links.broken === 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {analysis.links.broken}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">لینک شکسته</div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Web Vitals */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Core Web Vitals</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* LCP */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">LCP</span>
              <span className={`text-sm font-bold ${
                analysis.coreWebVitals.lcp <= 2.5 ? 'text-green-600' : 
                analysis.coreWebVitals.lcp <= 4 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {analysis.coreWebVitals.lcp.toFixed(1)}s
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  analysis.coreWebVitals.lcp <= 2.5 ? 'bg-green-500' : 
                  analysis.coreWebVitals.lcp <= 4 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min((analysis.coreWebVitals.lcp / 4) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Largest Contentful Paint
            </p>
          </div>

          {/* FID */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">FID</span>
              <span className={`text-sm font-bold ${
                analysis.coreWebVitals.fid <= 100 ? 'text-green-600' : 
                analysis.coreWebVitals.fid <= 300 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {analysis.coreWebVitals.fid}ms
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  analysis.coreWebVitals.fid <= 100 ? 'bg-green-500' : 
                  analysis.coreWebVitals.fid <= 300 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min((analysis.coreWebVitals.fid / 300) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              First Input Delay
            </p>
          </div>

          {/* CLS */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">CLS</span>
              <span className={`text-sm font-bold ${
                analysis.coreWebVitals.cls <= 0.1 ? 'text-green-600' : 
                analysis.coreWebVitals.cls <= 0.25 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {analysis.coreWebVitals.cls.toFixed(2)}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  analysis.coreWebVitals.cls <= 0.1 ? 'bg-green-500' : 
                  analysis.coreWebVitals.cls <= 0.25 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min((analysis.coreWebVitals.cls / 0.25) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Cumulative Layout Shift
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SEOScoreCard;
