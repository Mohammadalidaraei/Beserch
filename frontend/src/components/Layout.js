import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTheme } from '../hooks/useTheme';

export default function Layout({ children, title = 'BSearch - موتور جستجوی ایرانی' }) {
  const { theme } = useTheme();

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="موتور جستجوی مدرن ایرانی با هوش مصنوعی - جستجو در وب فارسی، تصاویر، ویدیوها و اخبار" />
        <meta name="keywords" content="جستجو, موتور جستجو, ایران, فارسی, هوش مصنوعی, BSearch" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3b82f6" />
        
        {/* Open Graph */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content="موتور جستجوی مدرن ایرانی با هوش مصنوعی" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="fa_IR" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content="موتور جستجوی مدرن ایرانی با هوش مصنوعی" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* Preconnect to fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
      </Head>

      <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'dark' : ''}`}>
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}
