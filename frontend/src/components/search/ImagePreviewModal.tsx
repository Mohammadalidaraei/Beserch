import React from 'react';
import type { ImageResult } from '@/types';

interface ImagePreviewModalProps {
  image: ImageResult;
  onClose: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ image, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full transition-colors z-10"
        aria-label="بستن"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Image Container */}
      <div
        className="relative max-w-5xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Main Image */}
        <img
          src={image.imageUrl}
          alt={image.title}
          className="w-full h-auto object-contain max-h-[75vh] rounded-lg"
        />

        {/* Info Bar */}
        <div className="mt-4 bg-gray-900/90 backdrop-blur-sm rounded-lg p-4">
          <h3 className="text-white font-medium text-lg mb-2 line-clamp-2">{image.title}</h3>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
            {image.width && image.height && (
              <span>{image.width} × {image.height}</span>
            )}
            {image.fileSize && <span>{image.fileSize}</span>}
            {image.source && <span>{image.source}</span>}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-4">
            <a
              href={image.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              مشاهده صفحه منبع
            </a>
            <a
              href={image.imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              دانلود تصویر
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImagePreviewModal;
