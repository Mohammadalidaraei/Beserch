import React from 'react';

interface AISearchButtonProps {
  onClick?: () => void;
  className?: string;
}

const AISearchButton: React.FC<AISearchButtonProps> = ({ onClick, className = '' }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 ${className}`}
      title="جستجوی هوشمند با AI"
      aria-label="جستجوی هوشمند با AI"
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
      </svg>
      <span className="font-medium">هوشمند</span>
    </button>
  );
};

export default AISearchButton;
