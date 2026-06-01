import { useState, useEffect } from 'react';
import { FaSearch, FaMicrophone, FaTimes, FaSparkles } from 'react-icons/fa';
import { useVoiceSearch } from '../hooks/useVoiceSearch';

export default function SearchBox({ 
  onSearch, 
  initialValue = '', 
  placeholder = 'جستجو کنید...',
  showAiButton = true,
  onAiSearch,
  size = 'large' // small, medium, large
}) {
  const [query, setQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  
  const handleVoiceResult = (result) => {
    setQuery(result);
    if (onSearch) {
      onSearch(result);
    }
  };

  const { 
    isListening, 
    toggleListening, 
    isSupported: voiceSupported 
  } = useVoiceSearch(handleVoiceResult);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && onSearch) {
      onSearch(query.trim());
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    if (onSearch) {
      onSearch('');
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    // Fetch suggestions (debounced in real app)
    if (value.length > 2) {
      // TODO: Implement debounced suggestion fetch
      // For now, just clear suggestions
      setSuggestions([]);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setSuggestions([]);
    if (onSearch) {
      onSearch(suggestion);
    }
  };

  const sizeClasses = {
    small: 'h-10 px-3 text-sm',
    medium: 'h-12 px-4 text-base',
    large: 'h-16 px-6 text-lg md:h-20 md:px-8 md:text-xl'
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div 
          className={`
            relative flex items-center bg-white dark:bg-dark-card 
            border border-gray-200 dark:border-dark-border 
            rounded-full shadow-sm transition-all duration-200
            ${isFocused ? 'ring-2 ring-primary-500 shadow-lg' : ''}
            ${sizeClasses[size]}
          `}
        >
          {/* Search Icon */}
          <div className="flex-shrink-0 text-gray-400">
            <FaSearch className="w-5 h-5 md:w-6 md:h-6" />
          </div>

          {/* Input Field */}
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder={placeholder}
            className="flex-1 mx-3 bg-transparent outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400"
            dir="rtl"
          />

          {/* Clear Button */}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              aria-label="پاک کردن"
            >
              <FaTimes className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          )}

          {/* Voice Search Button */}
          {voiceSupported && (
            <button
              type="button"
              onClick={toggleListening}
              className={`
                flex-shrink-0 p-2 rounded-full transition-all duration-200
                ${isListening 
                  ? 'text-red-500 bg-red-50 dark:bg-red-900/20 animate-pulse' 
                  : 'text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                }
              `}
              aria-label={isListening ? 'توقف جستجوی صوتی' : 'جستجوی صوتی'}
              title={isListening ? 'در حال گوش دادن...' : 'جستجوی صوتی'}
            >
              {isListening ? (
                <FaMicrophoneSlash className="w-5 h-5 md:w-6 md:h-6" />
              ) : (
                <FaMicrophone className="w-5 h-5 md:w-6 md:h-6" />
              )}
            </button>
          )}

          {/* AI Search Button */}
          {showAiButton && onAiSearch && (
            <button
              type="button"
              onClick={() => onAiSearch(query)}
              className="flex-shrink-0 p-2 mr-2 text-purple-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-full transition-all duration-200"
              aria-label="جستجوی هوشمند با هوش مصنوعی"
              title="جستجوی هوشمند با هوش مصنوعی"
            >
              <FaSparkles className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {suggestions.length > 0 && isFocused && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl shadow-lg overflow-hidden z-50">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-3 text-right hover:bg-gray-50 dark:hover:bg-dark-border transition-colors flex items-center gap-3"
            >
              <FaSearch className="text-gray-400 text-sm" />
              <span className="text-gray-700 dark:text-gray-200">{suggestion}</span>
            </button>
          ))}
        </div>
      )}

      {/* Voice Listening Indicator */}
      {isListening && (
        <div className="absolute -bottom-8 left-0 right-0 text-center">
          <span className="text-sm text-red-500 animate-pulse">
            در حال گوش دادن... بگویید
          </span>
        </div>
      )}
    </div>
  );
}
