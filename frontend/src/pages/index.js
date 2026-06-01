import { useState } from 'react';
import Head from 'next/head';
import SearchBox from '../components/SearchBox';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  const [isAiMode, setIsAiMode] = useState(false);

  const handleSearch = (query) => {
    if (query.trim()) {
      const searchType = isAiMode ? 'ai' : 'web';
      router.push(`/search?q=${encodeURIComponent(query)}&type=${searchType}`);
    }
  };

  const handleAiSearch = (query) => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}&type=ai`);
    }
  };

  const toggleAiMode = () => {
    setIsAiMode(!isAiMode);
  };

  return (
    <>
      <Head>
        <title>BSearch - موتور جستجوی ایرانی با هوش مصنوعی</title>
        <meta name="description" content="موتور جستجوی مدرن ایرانی با هوش مصنوعی - جستجو در وب فارسی، تصاویر، ویدیوها و اخبار" />
      </Head>

      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
          {/* Logo Section */}
          <div className="mb-8 md:mb-12 text-center">
            <div className="inline-flex items-center gap-4 mb-4">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-primary-600 to-blue-400 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-4xl md:text-5xl">B</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-2">
              BSearch
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg md:text-xl">
              موتور جستجوی ایرانی با هوش مصنوعی
            </p>
          </div>

          {/* AI Mode Toggle */}
          <div className="mb-6">
            <button
              onClick={toggleAiMode}
              className={`
                px-6 py-3 rounded-full text-sm font-medium transition-all duration-200
                ${isAiMode 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
                  : 'bg-gray-200 dark:bg-dark-border text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-dark-card'
                }
              `}
            >
              {isAiMode ? '🤖 حالت جستجوی هوشمند فعال است' : '🔍 حالت جستجوی معمولی'}
            </button>
          </div>

          {/* Search Box */}
          <div className="w-full max-w-3xl mx-auto mb-8">
            <SearchBox
              onSearch={handleSearch}
              onAiSearch={handleAiSearch}
              placeholder={isAiMode ? 'سوال خود را بپرسید...' : 'جستجو کنید...'}
              size="large"
              showAiButton={true}
            />
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 mt-8">
            <a
              href="/images"
              className="px-4 py-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-full text-sm text-gray-700 dark:text-gray-300 hover:shadow-md hover:border-primary-500 transition-all"
            >
              🖼️ جستجوی تصاویر
            </a>
            <a
              href="/videos"
              className="px-4 py-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-full text-sm text-gray-700 dark:text-gray-300 hover:shadow-md hover:border-primary-500 transition-all"
            >
              🎥 جستجوی ویدیوها
            </a>
            <a
              href="/news"
              className="px-4 py-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-full text-sm text-gray-700 dark:text-gray-300 hover:shadow-md hover:border-primary-500 transition-all"
            >
              📰 جستجوی اخبار
            </a>
            <a
              href="/webmaster"
              className="px-4 py-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-full text-sm text-gray-700 dark:text-gray-300 hover:shadow-md hover:border-primary-500 transition-all"
            >
              🛠️ ابزار وبمستر
            </a>
            <a
              href="/seo"
              className="px-4 py-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-full text-sm text-gray-700 dark:text-gray-300 hover:shadow-md hover:border-primary-500 transition-all"
            >
              📊 دستیار سئو
            </a>
          </div>

          {/* Features Section */}
          <div className="mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto w-full">
            <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-200 dark:border-dark-border hover:shadow-lg transition-all">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
                جستجوی فوق‌سریع
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                نتایج جستجو در کمتر از ۱۰۰ میلی‌ثانیه با بهینه‌سازی پیشرفته
              </p>
            </div>

            <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-200 dark:border-dark-border hover:shadow-lg transition-all">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
                هوش مصنوعی
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                پاسخ‌های هوشمند و خلاصه مطالب با استفاده از AI پیشرفته
              </p>
            </div>

            <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-200 dark:border-dark-border hover:shadow-lg transition-all">
              <div className="text-4xl mb-4">🇮🇷</div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
                بهینه برای فارسی
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                پشتیبانی کامل از زبان فارسی، فینگلیش و عربی
              </p>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
