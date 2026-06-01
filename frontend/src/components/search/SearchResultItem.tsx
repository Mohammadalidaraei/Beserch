import React from 'react';
import type { SearchResult } from '@/types';

interface SearchResultItemProps {
  result: SearchResult;
  position: number;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({ result, position }) => {
  return (
    <article className="group">
      <div className="flex items-start gap-3 mb-1">
        {result.favicon && (
          <img
            src={result.favicon}
            alt=""
            className="w-4 h-4 flex-shrink-0 mt-1"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
        <div className="flex-1 min-w-0">
          {/* URL */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
            <cite className="not-italic truncate">{result.displayUrl}</cite>
          </div>

          {/* Title */}
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group-hover:underline"
          >
            <h3 className="text-xl text-blue-700 dark:text-blue-400 font-medium mb-1 line-clamp-2">
              {result.title}
            </h3>
          </a>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-3">
            {result.description}
          </p>

          {/* Metadata */}
          {(result.publishedDate || result.source) && (
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
              {result.publishedDate && (
                <time dateTime={result.publishedDate}>{result.publishedDate}</time>
              )}
              {result.source && <span>{result.source}</span>}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default SearchResultItem;
