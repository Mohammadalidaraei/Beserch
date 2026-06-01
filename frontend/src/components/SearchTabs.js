import { FaGlobe, FaImage, FaVideo, FaNewspaper, FaRobot } from 'react-icons/fa';

export default function SearchTabs({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'web', label: 'همه', icon: FaGlobe },
    { id: 'images', label: 'تصاویر', icon: FaImage },
    { id: 'videos', label: 'ویدیوها', icon: FaVideo },
    { id: 'news', label: 'اخبار', icon: FaNewspaper },
    { id: 'ai', label: 'پاسخ هوشمند', icon: FaRobot },
  ];

  return (
    <div className="w-full border-b border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card sticky top-0 z-40">
      <nav className="flex items-center gap-1 px-4 md:px-8 overflow-x-auto" dir="rtl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap
                transition-all duration-200 border-b-2
                ${isActive 
                  ? 'text-primary-600 dark:text-primary-400 border-primary-600 dark:border-primary-400' 
                  : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
