export default function VideoResultsList({ videos, onLoadMore }) {
  if (!videos || videos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        هیچ ویدیویی یافت نشد.
      </div>
    );
  }

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views) => {
    if (!views) return '';
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    }
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  return (
    <div>
      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video, index) => (
          <div
            key={video.id || index}
            className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 cursor-pointer"
          >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-gray-100 dark:bg-gray-900 overflow-hidden">
              <img
                src={video.thumbnail}
                alt={video.title || 'Video'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              
              {/* Duration Badge */}
              {video.duration && (
                <div className="absolute bottom-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                  {formatDuration(video.duration)}
                </div>
              )}

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-primary ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Video Info */}
            <div className="p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {video.title}
              </h3>

              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                {video.source && (
                  <span className="font-medium">{video.source}</span>
                )}
                {video.date && (
                  <>
                    <span>•</span>
                    <time dateTime={video.date}>
                      {new Intl.DateTimeFormat('fa-IR').format(new Date(video.date))}
                    </time>
                  </>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                {video.views && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {formatViews(video.views)} بازدید
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {onLoadMore && (
        <div className="text-center mt-8">
          <button
            onClick={onLoadMore}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            نمایش بیشتر
          </button>
        </div>
      )}
    </div>
  );
}
