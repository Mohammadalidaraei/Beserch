import React from 'react';

interface SearchFiltersProps {
  timeRange?: string;
  sort?: string;
  language?: string;
  onFilterChange?: (filters: { timeRange?: string; sort?: string; language?: string }) => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  timeRange,
  sort,
  language,
  onFilterChange,
}) => {
  const timeRanges = [
    { value: 'any', label: 'هر زمانی' },
    { value: 'day', label: '۲۴ ساعت گذشته' },
    { value: 'week', label: 'هفته گذشته' },
    { value: 'month', label: 'ماه گذشته' },
    { value: 'year', label: 'سال گذشته' },
  ];

  const sortOptions = [
    { value: 'relevance', label: 'ارتباط' },
    { value: 'date', label: 'تاریخ' },
    { value: 'popularity', label: 'محبوبیت' },
  ];

  const languages = [
    { value: 'all', label: 'همه زبان‌ها' },
    { value: 'fa', label: 'فارسی' },
    { value: 'en', label: 'انگلیسی' },
    { value: 'ar', label: 'عربی' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-4 py-4 border-b border-gray-200 dark:border-gray-800 mb-6">
      {/* Time Range */}
      <div className="relative">
        <select
          value={timeRange || 'any'}
          onChange={(e) => onFilterChange?.({ timeRange: e.target.value })}
          className="appearance-none px-4 py-2 pr-8 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          {timeRanges.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Sort */}
      <div className="relative">
        <select
          value={sort || 'relevance'}
          onChange={(e) => onFilterChange?.({ sort: e.target.value })}
          className="appearance-none px-4 py-2 pr-8 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Language */}
      <div className="relative">
        <select
          value={language || 'all'}
          onChange={(e) => onFilterChange?.({ language: e.target.value })}
          className="appearance-none px-4 py-2 pr-8 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          {languages.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Clear Filters */}
      {(timeRange !== 'any' || sort !== 'relevance' || language !== 'all') && (
        <button
          onClick={() => onFilterChange?.({ timeRange: 'any', sort: 'relevance', language: 'all' })}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          حذف فیلترها
        </button>
      )}
    </div>
  );
};

export default SearchFilters;
