import { useState } from 'react';

export default function ImageResultsGrid({ images, onLoadMore }) {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer bg-gray-100 dark:bg-gray-800 animate-fade-in"
            onClick={() => setSelectedImage(image)}
          >
            <img
              src={image.thumbnail || image.url}
              alt={image.alt || image.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white text-sm font-medium line-clamp-2">
                  {image.title}
                </p>
                <p className="text-gray-300 text-xs mt-1 line-clamp-1">
                  {image.source}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {onLoadMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={onLoadMore}
            className="btn-primary px-8 py-3"
          >
            نمایش بیشتر
          </button>
        </div>
      )}

      {/* Image Preview Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative max-w-4xl w-full max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
              aria-label="بستن"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image */}
            <img
              src={selectedImage.url || selectedImage.thumbnail}
              alt={selectedImage.alt || selectedImage.title}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />

            {/* Image Info */}
            <div className="mt-4 bg-white dark:bg-dark-card rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                {selectedImage.title}
              </h3>
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>{selectedImage.source}</span>
                {selectedImage.dimensions && (
                  <span>{selectedImage.dimensions}</span>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 mt-4">
                <a
                  href={selectedImage.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary flex-1 text-center py-2"
                >
                  مشاهده تصویر اصلی
                </a>
                <button
                  onClick={() => {
                    // Save image functionality
                  }}
                  className="btn-secondary flex-1 py-2"
                >
                  ذخیره تصویر
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
