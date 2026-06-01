import { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import SearchBox from '@/components/search/SearchBox';
import VoiceSearchButton from '@/components/search/VoiceSearchButton';
import AISearchButton from '@/components/search/AISearchButton';
import ThemeToggle from '@/components/common/ThemeToggle';
import LanguageSelector from '@/components/common/LanguageSelector';

interface HomeProps {
  featured?: boolean;
}

const Home: NextPage<HomeProps> = () => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isVoiceSearchActive, setIsVoiceSearchActive] = useState(false);

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}&type=all`);
    }
  };

  const handleAISearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}&type=ai`);
    }
  };

  const handleVoiceSearch = () => {
    setIsVoiceSearchActive(true);
    // Web Speech API implementation
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'fa-IR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsVoiceSearchActive(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        handleSearch(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Voice search error:', event.error);
        setIsVoiceSearchActive(false);
      };

      recognition.onend = () => {
        setIsVoiceSearchActive(false);
      };

      recognition.start();
    } else {
      alert('مرورگر شما از جستجوی صوتی پشتیبانی نمی‌کند');
      setIsVoiceSearchActive(false);
    }
  };

  return (
    <>
      <Head>
        <title>BSearch - موتور جستجوی ایرانی</title>
        <meta name="description" content="موتور جستجوی مدرن و هوشمند فارسی با قابلیت‌های پیشرفته هوش مصنوعی" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4285f4" />
      </Head>

      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-300">
        {/* Header */}
        <header className="flex justify-end items-center p-4 gap-4">
          <a href="/webmaster" className="text-sm text-gray-600 dark:text-gray-300 hover:underline">
            ابزار وبمستر
          </a>
          <a href="/seo" className="text-sm text-gray-600 dark:text-gray-300 hover:underline">
            دستیار سئو
          </a>
          <LanguageSelector />
          <ThemeToggle />
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          {/* Logo */}
          <div className="mb-8 text-center">
            <h1 className="text-7xl md:text-8xl font-bold mb-2">
              <span className="text-blue-500">B</span>
              <span className="text-red-500">S</span>
              <span className="text-yellow-500">e</span>
              <span className="text-blue-500">a</span>
              <span className="text-green-500">r</span>
              <span className="text-red-500">c</span>
              <span className="text-yellow-500">h</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
              موتور جستجوی هوشمند فارسی
            </p>
          </div>

          {/* Search Box */}
          <div className="w-full max-w-2xl relative">
            <SearchBox
              value={query}
              onChange={setQuery}
              onSearch={handleSearch}
              placeholder="جستجو کنید..."
              className="shadow-lg hover:shadow-xl transition-shadow"
            />

            {/* Search Buttons */}
            <div className="flex justify-center items-center gap-3 mt-6">
              <button
                onClick={() => handleSearch(query)}
                className="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                جستجوی BSearch
              </button>
              <button
                onClick={() => handleAISearch(query)}
                className="px-6 py-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                جستجوی هوشمند
              </button>
              <VoiceSearchButton
                isActive={isVoiceSearchActive}
                onClick={handleVoiceSearch}
              />
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-12 flex flex-wrap justify-center gap-4 text-sm">
            <a href="/search?type=images" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
              تصاویر
            </a>
            <a href="/search?type=videos" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
              ویدیوها
            </a>
            <a href="/search?type=news" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
              اخبار
            </a>
            <a href="/search?type=ai" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
              پاسخ هوشمند
            </a>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 dark:border-gray-800 py-4 px-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex gap-6">
              <a href="/about" className="hover:underline">درباره ما</a>
              <a href="/privacy" className="hover:underline">حریم خصوصی</a>
              <a href="/terms" className="hover:underline">قوانین</a>
            </div>
            <div>
              © ۱۴۰۳ BSearch - تمام حقوق محفوظ است
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Home;
