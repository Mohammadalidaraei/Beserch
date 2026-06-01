import { useState } from 'react';

export default function ImageResultsGrid({ images, onLoadMore }) {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        هیچ تصویری یافت نشد.
      </div>
    );
  }

  return (
    <div>
      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div
            key={image.id || index}
            className="group relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200"
            onClick={() => setSelectedImage(image)}
          >
            <img
              src={image.thumbnail || image.url}
              alt={image.alt || image.title || 'Image'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-end p-3">
              <div className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 line-clamp-2">
                {image.title || image.alt}
              </div>
            </div>

            {/* Image info badge */}
            {image.width && image.height && (
              <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                {image.width} × {image.height}
              </div>
            )}
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

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] overflow-hidden rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 left-4 z-10 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image */}
            <img
              src={selectedImage.url || selectedImage.thumbnail}
              alt={selectedImage.alt || selectedImage.title || 'Image'}
              className="max-w-full max-h-[80vh] object-contain mx-auto"
            />

            {/* Image Details */}
            <div className="bg-white dark:bg-gray-800 p-4 mt-2 rounded-b-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                {selectedImage.title || selectedImage.alt}
              </h3>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                {selectedImage.source && (
                  <a
                    href={selectedImage.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    {selectedImage.source}
                  </a>
                )}
                
                {selectedImage.width && selectedImage.height && (
                  <span>{selectedImage.width} × {selectedImage.height}</span>
                )}
                
                {selectedImage.fileSize && (
                  <span>{selectedImage.fileSize}</span>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mt-4">
                <a
                  href={selectedImage.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary text-sm"
                >
                  مشاهده تصویر اصلی
                </a>
                <button
                  onClick={() => {
                    // Copy image URL to clipboard
                    navigator.clipboard.writeText(selectedImage.url);
                    alert('آدرس تصویر کپی شد');
                  }}
                  className="btn-secondary text-sm"
                >
                  کپی آدرس
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
