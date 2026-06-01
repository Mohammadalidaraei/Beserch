import React, { useState } from 'react';

type Language = 'fa' | 'en' | 'ar';

interface LanguageSelectorProps {
  onLanguageChange?: (lang: Language) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onLanguageChange }) => {
  const [currentLang, setCurrentLang] = useState<Language>('fa');
  const [isOpen, setIsOpen] = useState(false);

  const languages: { code: Language; name: string; label: string }[] = [
    { code: 'fa', name: 'فارسی', label: 'FA' },
    { code: 'en', name: 'English', label: 'EN' },
    { code: 'ar', name: 'العربية', label: 'AR' },
  ];

  const handleSelect = (lang: Language) => {
    setCurrentLang(lang);
    setIsOpen(false);
    onLanguageChange?.(lang);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label="انتخاب زبان"
      >
        {languages.find((l) => l.code === currentLang)?.label}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 mt-2 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 overflow-hidden">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`w-full px-4 py-2.5 text-right text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  currentLang === lang.code
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelector;
