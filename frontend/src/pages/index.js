import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import SearchBox from '../components/search/SearchBox';
import ThemeToggle from '../components/common/ThemeToggle';
import LanguageSelector from '../components/common/LanguageSelector';

export default function Home() {
  const router = useRouter();
  const [searchType, setSearchType] = useState('web');

  const handleSearch = (query) => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}&type=${searchType}`);
    }
  };

  return (
    <>
      <Head>
        <title>BSearch - موتور جستجوی هوشمند ایرانی</title>
        <meta name="description" content="موتور جستجوی هوشمند ایرانی با پشتیبانی از هوش مصنوعی، جستجوی وب، تصاویر، ویدیوها و اخبار" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
      </Head>

      <div className="min-h-screen flex flex-col" dir="rtl">
        {/* Header */}
        <header className="flex justify-end items-center gap-4 p-4">
          <LanguageSelector />
          <ThemeToggle />
          <a href="/login" className="btn-secondary text-sm">
            ورود
          </a>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          {/* Logo */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-7xl md:text-8xl font-bold text-primary-600 dark:text-primary-400 tracking-tight">
              BSearch
            </h1>
            <p className="text-center text-gray-500 dark:text-gray-400 mt-2 text-lg">
              موتور جستجوی هوشمند ایرانی
            </p>
          </div>

          {/* Search Box */}
          <div className="w-full max-w-2xl mb-8 animate-slide-up">
            <SearchBox onSearch={handleSearch} />
          </div>

          {/* Search Type Buttons */}
          <div className="flex flex-wrap justify-center gap-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {[
              { id: 'web', label: 'وب', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
              { id: 'images', label: 'تصاویر', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
              { id: 'videos', label: 'ویدیوها', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
              { id: 'news', label: 'اخبار', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' },
              { id: 'ai', label: 'پاسخ هوشمند', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setSearchType(type.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200
                  ${searchType === type.id 
                    ? 'bg-primary-600 text-white shadow-lg scale-105' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}
                `}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={type.icon} />
                </svg>
                <span className="font-medium">{type.label}</span>
              </button>
            ))}
          </div>

          {/* Quick Links */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {[
              { href: '/seo', label: 'دستیار سئو', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
              { href: '/webmaster', label: 'ابزار وبمستر', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
              { href: '/submit', label: 'ثبت سایت', icon: 'M12 4v16m8-8H4' },
              { href: '/about', label: 'درباره ما', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
            ].map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="card flex flex-col items-center gap-2 p-4 hover:scale-105 transition-transform"
              >
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                </svg>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{link.label}</span>
              </a>
            ))}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 dark:border-dark-border py-6 px-4">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © ۱۴۰۳ BSearch - موتور جستجوی ایرانی
            </p>
            <div className="flex gap-6">
              <a href="/privacy" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600">
                حریم خصوصی
              </a>
              <a href="/terms" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600">
                شرایط استفاده
              </a>
              <a href="/contact" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600">
                تماس با ما
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
