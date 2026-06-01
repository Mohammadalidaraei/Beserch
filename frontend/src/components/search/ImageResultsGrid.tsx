import React, { useState } from 'react';
import type { ImageResult } from '@/types';
import ImagePreviewModal from './ImagePreviewModal';

interface ImageResultsGridProps {
  images: ImageResult[];
}

const ImageResultsGrid: React.FC<ImageResultsGridProps> = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState<ImageResult | null>(null);
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());

  const handleImageLoad = (imageId: string) => {
    setLoadingImages((prev) => {
      const next = new Set(prev);
      next.delete(imageId);
      return next;
    });
  };

  const handleImageError = (imageId: string) => {
    setLoadingImages((prev) => {
      const next = new Set(prev);
      next.delete(imageId);
      return next;
    });
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="group relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedImage(image)}
          >
            {/* Loading State */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-300 dark:text-gray-600 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>

            {/* Image */}
            <img
              src={image.thumbnailUrl}
              alt={image.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onLoad={() => handleImageLoad(image.id)}
              onError={() => handleImageError(image.id)}
              loading="lazy"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="text-white text-sm font-medium line-clamp-2 mb-1">
                  {image.title}
                </h3>
                <p className="text-gray-300 text-xs truncate">{image.source}</p>
              </div>
            </div>

            {/* Size Badge */}
            {image.width && image.height && (
              <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                {image.width} × {image.height}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {selectedImage && (
        <ImagePreviewModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  );
};

export default ImageResultsGrid;
