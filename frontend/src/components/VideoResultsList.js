import { FaPlay, FaClock, FaExternalLinkAlt } from 'react-icons/fa';

export default function VideoResultsList({ videos }) {
  if (!videos || videos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        هیچ ویدیویی یافت نشد.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {videos.map((video, index) => (
        <div
          key={index}
          className="result-card bg-white dark:bg-dark-card rounded-xl overflow-hidden border border-gray-100 dark:border-dark-border hover:shadow-lg transition-all duration-200"
        >
          {/* Thumbnail */}
          <div className="relative aspect-video bg-gray-100 dark:bg-dark-card cursor-pointer group">
            {video.thumbnail ? (
              <img
                src={video.thumbnail}
                alt={video.title || 'ویدیو'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <FaPlay className="w-12 h-12 opacity-50" />
              </div>
            )}
            
            {/* Play Button Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                <FaPlay className="w-6 h-6 text-primary-600 ml-1" />
              </div>
            </div>

            {/* Duration Badge */}
            {video.duration && (
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs rounded">
                {formatDuration(video.duration)}
              </div>
            )}
          </div>

          {/* Video Info */}
          <div className="p-4">
            <h3 className="font-medium text-gray-800 dark:text-gray-100 mb-2 line-clamp-2 h-12">
              {video.title || 'بدون عنوان'}
            </h3>

            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
              {video.source && (
                <span className="truncate">{video.source}</span>
              )}
              {video.duration && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <FaClock className="w-3 h-3" />
                    <span>{formatDuration(video.duration)}</span>
                  </div>
                </>
              )}
              {video.date && (
                <>
                  <span>•</span>
                  <span>{new Date(video.date).toLocaleDateString('fa-IR')}</span>
                </>
              )}
            </div>

            {video.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                {video.description}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              {video.url && (
                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <FaPlay className="w-3 h-3" />
                  تماشای ویدیو
                </a>
              )}
              
              {video.previewUrl && (
                <button
                  className="px-3 py-2 bg-gray-200 dark:bg-dark-border text-gray-700 dark:text-gray-200 text-sm rounded-lg hover:bg-gray-300 dark:hover:bg-dark-card transition-colors"
                  title="پیش‌نمایش"
                >
                  پیش‌نمایش
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatDuration(seconds) {
  if (!seconds) return '';
  
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
