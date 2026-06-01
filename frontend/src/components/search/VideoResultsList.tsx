import React from 'react';
import type { VideoResult } from '@/types';

interface VideoResultsListProps {
  videos: VideoResult[];
}

const VideoResultsList: React.FC<VideoResultsListProps> = ({ videos }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <article
          key={video.id}
          className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
        >
          {/* Thumbnail */}
          <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 overflow-hidden">
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />

            {/* Duration Badge */}
            {video.duration && (
              <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs font-medium rounded">
                {video.duration}
              </span>
            )}

            {/* Play Icon Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
              <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Title */}
            <a
              href={video.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block group-hover:underline"
            >
              <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
                {video.title}
              </h3>
            </a>

            {/* Metadata */}
            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              {/* Source */}
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                {video.source}
              </span>

              {/* Published Date */}
              {video.publishedDate && (
                <time dateTime={video.publishedDate}>
                  {new Date(video.publishedDate).toLocaleDateString('fa-IR')}
                </time>
              )}

              {/* Views */}
              {video.views !== undefined && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  {video.views >= 1000000
                    ? `${(video.views / 1000000).toFixed(1)}M`
                    : video.views >= 1000
                    ? `${(video.views / 1000).toFixed(1)}K`
                    : video.views}
                </span>
              )}
            </div>

            {/* Source Link */}
            <a
              href={video.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              مشاهده در {video.source}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </article>
      ))}
    </div>
  );
};

export default VideoResultsList;
