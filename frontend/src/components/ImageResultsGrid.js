import { useState } from 'react';
import Image from 'next/image';
import { FaExpand, FaDownload, FaExternalLinkAlt, FaTimes } from 'react-icons/fa';

export default function ImageResultsGrid({ images }) {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        هیچ تصویری یافت نشد.
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            className="group relative aspect-square bg-gray-100 dark:bg-dark-card rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200"
            onClick={() => setSelectedImage(image)}
          >
            {image.thumbnail ? (
              <img
                src={image.thumbnail}
                alt={image.alt || image.title || 'تصویر'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <span className="text-sm">بدون تصویر</span>
              </div>
            )}
            
            {/* Overlay on Hover */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-3">
              <div className="w-full text-white">
                <p className="text-xs line-clamp-2 mb-2">
                  {image.title || 'بدون عنوان'}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs opacity-80 truncate max-w-[70%]">
                    {image.source}
                  </span>
                  <FaExpand className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative max-w-5xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
              aria-label="بستن"
            >
              <FaTimes className="w-6 h-6" />
            </button>

            {/* Image */}
            <div className="bg-white dark:bg-dark-card rounded-lg overflow-hidden">
              {selectedImage.url ? (
                <img
                  src={selectedImage.url}
                  alt={selectedImage.alt || selectedImage.title || 'تصویر'}
                  className="w-full max-h-[70vh] object-contain"
                />
              ) : (
                <div className="w-full h-64 flex items-center justify-center text-gray-400">
                  <span>تصویر موجود نیست</span>
                </div>
              )}

              {/* Image Details */}
              <div className="p-4 border-t border-gray-200 dark:border-dark-border">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-2">
                  {selectedImage.title || 'بدون عنوان'}
                </h3>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                  {selectedImage.source && (
                    <div className="flex items-center gap-2">
                      <span>منبع:</span>
                      <a 
                        href={selectedImage.sourceUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline flex items-center gap-1"
                      >
                        {selectedImage.source}
                        <FaExternalLinkAlt className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  
                  {selectedImage.width && selectedImage.height && (
                    <div>
                      ابعاد: {selectedImage.width} × {selectedImage.height}
                    </div>
                  )}
                  
                  {selectedImage.size && (
                    <div>حجم: {selectedImage.size}</div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-4">
                  {selectedImage.url && (
                    <a
                      href={selectedImage.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <FaExternalLinkAlt className="w-4 h-4" />
                      بازدید از تصویر
                    </a>
                  )}
                  
                  {selectedImage.url && (
                    <a
                      href={selectedImage.url}
                      download
                      className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-dark-border text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-dark-card transition-colors"
                    >
                      <FaDownload className="w-4 h-4" />
                      دانلود
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Related Images (placeholder) */}
            {selectedImage.related && selectedImage.related.length > 0 && (
              <div className="mt-6">
                <h4 className="text-white mb-3">تصاویر مرتبط</h4>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                  {selectedImage.related.slice(0, 6).map((img, idx) => (
                    <div
                      key={idx}
                      className="aspect-square bg-gray-800 rounded cursor-pointer hover:opacity-80"
                      onClick={() => setSelectedImage(img)}
                    >
                      <img
                        src={img.thumbnail || img.url}
                        alt=""
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Infinite Scroll Loader */}
      <div className="flex justify-center py-8">
        <div className="loading-spinner"></div>
      </div>
    </div>
  );
}
