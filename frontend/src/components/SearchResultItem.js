import { FaExternalLinkAlt, FaStar } from 'react-icons/fa';

export default function SearchResultItem({ result }) {
  const {
    title,
    url,
    description,
    snippet,
    date,
    breadcrumbs,
    richSnippets,
    score,
  } = result;

  const displayUrl = url.replace(/^https?:\/\//, '').split('/')[0];

  return (
    <div className="result-card bg-white dark:bg-dark-card rounded-xl p-4 md:p-6 mb-4 border border-gray-100 dark:border-dark-border hover:shadow-lg transition-all duration-200">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2" dir="ltr">
          {breadcrumbs.map((crumb, index) => (
            <span key={index} className="flex items-center gap-2">
              {index > 0 && <span>/</span>}
              <span>{crumb}</span>
            </span>
          ))}
        </div>
      )}

      {/* Title & URL */}
      <div className="mb-3">
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="group block"
        >
          <h3 className="text-xl md:text-2xl text-primary-600 dark:text-primary-400 font-medium group-hover:underline line-clamp-2 mb-1">
            {title || 'بدون عنوان'}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="truncate">{displayUrl}</span>
            <FaExternalLinkAlt className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </a>
      </div>

      {/* Description/Snippet */}
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3 mb-3" dir="rtl">
        {snippet || description || 'توضیحات موجود نیست'}
      </p>

      {/* Rich Snippets */}
      {richSnippets && Object.keys(richSnippets).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {richSnippets.rating && (
            <div className="flex items-center gap-1 text-yellow-500">
              {[...Array(5)].map((_, i) => (
                <FaStar 
                  key={i} 
                  className={`w-4 h-4 ${i < Math.floor(richSnippets.rating) ? 'fill-current' : 'text-gray-300 dark:text-gray-600'}`}
                />
              ))}
              <span className="text-xs text-gray-500 mr-1">
                ({richSnippets.rating})
              </span>
            </div>
          )}
          
          {richSnippets.price && (
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              {richSnippets.price}
            </span>
          )}
          
          {richSnippets.availability && (
            <span className={`
              text-xs px-2 py-1 rounded-full
              ${richSnippets.availability === 'InStock' 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }
            `}>
              {richSnippets.availability === 'InStock' ? 'موجود' : 'ناموجود'}
            </span>
          )}
        </div>
      )}

      {/* Date & Score */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        {date && (
          <span>{new Date(date).toLocaleDateString('fa-IR')}</span>
        )}
        {score && (
          <span className="text-gray-300 dark:text-gray-600">
            امتیاز: {(score * 100).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}
