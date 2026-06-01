export default function SearchResultItem({ result, type = 'web' }) {
  const { title, url, description, snippet, date, domain, breadcrumbs } = result;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR').format(date);
  };

  return (
    <div className="search-result-item bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-4">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
          {breadcrumbs.map((crumb, index) => (
            <span key={index} className="flex items-center gap-2">
              {index > 0 && <span>/</span>}
              <span>{crumb}</span>
            </span>
          ))}
        </div>
      )}

      {/* Domain & Date */}
      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-2">
        {domain && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">
                {domain.charAt(0).toUpperCase()}
              </span>
            </div>
            <span>{domain}</span>
          </div>
        )}
        {date && <span>•</span>}
        {date && <time dateTime={date}>{formatDate(date)}</time>}
      </div>

      {/* Title */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-xl text-primary hover:underline font-medium mb-2"
      >
        {title || snippet?.substring(0, 100)}
      </a>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
        {description || snippet}
      </p>

      {/* Rich Snippets for specific types */}
      {type === 'video' && result.duration && (
        <div className="mt-3 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {result.duration}
          </span>
          {result.views && (
            <span>{new Intl.NumberFormat('fa-IR').format(result.views)} بازدید</span>
          )}
        </div>
      )}

      {type === 'image' && result.width && result.height && (
        <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          {result.width} × {result.height}
        </div>
      )}

      {type === 'news' && result.source && (
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span className="font-medium">{result.source}</span>
        </div>
      )}
    </div>
  );
}
