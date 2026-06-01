import { useState } from 'react';

export default function LanguageSelector() {
  const [lang, setLang] = useState('fa');

  const languages = [
    { code: 'fa', name: 'فارسی', dir: 'rtl' },
    { code: 'en', name: 'English', dir: 'ltr' },
    { code: 'ar', name: 'العربية', dir: 'rtl' },
  ];

  const changeLanguage = (code, dir) => {
    setLang(code);
    localStorage.setItem('language', code);
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', code);
  };

  return (
    <div className="relative">
      <select
        value={lang}
        onChange={(e) => {
          const selected = languages.find(l => l.code === e.target.value);
          if (selected) changeLanguage(selected.code, selected.dir);
        }}
        className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
        aria-label="انتخاب زبان"
      >
        {languages.map((l) => (
          <option key={l.code} value={l.code}>
            {l.name}
          </option>
        ))}
      </select>
    </div>
  );
}
