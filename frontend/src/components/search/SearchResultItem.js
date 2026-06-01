export default function SearchResultItem({ result }) {
  const { title, url, description, date, breadcrumbs, richSnippet } = result;

  return (
    <div className="card animate-fade-in mb-4">
      {/* Breadcrumbs */}
      {breadcrumbs && (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
          {breadcrumbs.map((crumb, index) => (
            <span key={index} className="flex items-center gap-2">
              {index > 0 && <span>/</span>}
              <span>{crumb}</span>
            </span>
          ))}
        </div>
      )}

      {/* Title & URL */}
      <a href={url} className="group" target="_blank" rel="noopener noreferrer">
        <h3 className="text-xl text-primary-600 dark:text-primary-400 hover:underline font-medium mb-1 line-clamp-1">
          {title}
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <span className="truncate">{url}</span>
        </div>
      </a>

      {/* Description */}
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3">
        {description}
      </p>

      {/* Date */}
      {date && (
        <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          {new Date(date).toLocaleDateString('fa-IR')}
        </div>
      )}

      {/* Rich Snippet */}
      {richSnippet && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-dark-border">
          {richSnippet.rating && (
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <svg 
                  key={i} 
                  className={`w-4 h-4 ${i < Math.floor(richSnippet.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="text-sm text-gray-600 dark:text-gray-400 mr-1">
                ({richSnippet.rating})
              </span>
            </div>
          )}
          
          {richSnippet.image && (
            <img 
              src={richSnippet.image} 
              alt={title} 
              className="mt-2 w-32 h-20 object-cover rounded-lg"
            />
          )}
        </div>
      )}
    </div>
  );
}
