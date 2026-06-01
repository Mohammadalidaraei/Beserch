import React from 'react';

interface VoiceSearchButtonProps {
  isActive: boolean;
  onClick: () => void;
}

const VoiceSearchButton: React.FC<VoiceSearchButtonProps> = ({ isActive, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-2.5 rounded-full transition-all ${
        isActive
          ? 'bg-red-500 text-white animate-pulse'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
      title="جستجوی صوتی"
      aria-label="جستجوی صوتی"
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
      </svg>
    </button>
  );
};

export default VoiceSearchButton;
