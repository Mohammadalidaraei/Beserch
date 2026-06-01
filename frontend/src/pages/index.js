import Head from 'next/head';
import { useState } from 'react';
import SearchBox from '../components/SearchBox';
import useTheme from '../hooks/useTheme';

export default function Home() {
  const { theme, toggleTheme, mounted } = useTheme();
  const [language, setLanguage] = useState('fa');

  const handleSearch = (query) => {
    window.location.href = `/search?q=${encodeURIComponent(query)}`;
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      <Head>
        <title>BSearch - موتور جستجوی هوشمند ایرانی</title>
        <meta name="description" content="موتور جستجوی هوشمند ایرانی با قابلیت‌های پیشرفته هوش مصنوعی" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-dark-bg dark:to-dark-card transition-colors duration-300">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-md border-b border-gray-200 dark:border-dark-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">B</span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
                  BSearch
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                {/* Language Switcher */}
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  dir="ltr"
                >
                  <option value="fa">فارسی</option>
                  <option value="en">English</option>
                  <option value="ar">العربية</option>
                </select>

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
                  title={theme === 'dark' ? 'حالت روشن' : 'حالت تاریک'}
                >
                  {theme === 'dark' ? (
                    <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </button>

                {/* Login Button */}
                <a
                  href="/login"
                  className="btn-secondary text-sm hidden sm:inline-flex"
                >
                  ورود
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex flex-col items-center justify-center min-h-screen px-4 pt-16">
          {/* Logo */}
          <div className="mb-8 animate-fade-in">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl md:rounded-3xl bg-gradient-to-br from-primary via-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl">
              <span className="text-white font-bold text-5xl md:text-6xl">B</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-4 text-center">
              BSearch
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-center text-sm md:text-base">
              موتور جستجوی هوشمند ایرانی
            </p>
          </div>

          {/* Search Box */}
          <div className="w-full max-w-2xl animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <SearchBox 
              onSearch={handleSearch}
              placeholder="چه چیزی را می‌خواهید جستجو کنید؟"
              showButtons={true}
            />
          </div>

          {/* Quick Links */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <QuickLink 
              href="/search?type=images"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
              label="تصاویر"
            />
            
            <QuickLink 
              href="/search?type=videos"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              }
              label="ویدیوها"
            />
            
            <QuickLink 
              href="/search?type=news"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-9-11h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
                </svg>
              }
              label="اخبار"
            />
            
            <QuickLink 
              href="/seo"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              label="ابزار سئو"
            />
          </div>
        </main>

        {/* Footer */}
        <footer className="py-8 border-t border-gray-200 dark:border-dark-border">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              © ۱۴۰۳ BSearch - موتور جستجوی هوشمند ایرانی
            </p>
            <div className="flex justify-center gap-6 mt-4">
              <a href="/about" className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors text-sm">
                درباره ما
              </a>
              <a href="/privacy" className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors text-sm">
                حریم خصوصی
              </a>
              <a href="/terms" className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors text-sm">
                شرایط استفاده
              </a>
              <a href="/contact" className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors text-sm">
                تماس با ما
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

function QuickLink({ href, icon, label }) {
  return (
    <a
      href={href}
      className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border hover:border-primary hover:shadow-md transition-all duration-200 group"
    >
      <div className="text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors">
        {icon}
      </div>
      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">
        {label}
      </span>
    </a>
  );
}
