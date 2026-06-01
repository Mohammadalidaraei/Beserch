/**
 * BSearch - Utility Functions
 * توابع کمکی موتور جستجو
 */

const Utils = {
    /**
     * Debounce function for search input
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Encode Persian characters for URL
     */
    encodePersian(str) {
        return encodeURIComponent(str).replace(/%20/g, '+');
    },

    /**
     * Get URL parameter
     */
    getParam(name) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    },

    /**
     * Format number with Persian digits
     */
    toPersianDigits(num) {
        const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        return num.toString().replace(/\d/g, x => farsiDigits[x]);
    },

    /**
     * Format date to Persian
     */
    formatDate(date) {
        return new Intl.DateTimeFormat('fa-IR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(new Date(date));
    },

    /**
     * Format number with commas
     */
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    /**
     * Truncate text
     */
    truncate(text, length) {
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    },

    /**
     * Highlight search terms in text
     */
    highlightTerms(text, terms) {
        if (!terms || terms.length === 0) return text;
        const regex = new RegExp(`(${terms.join('|')})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    },

    /**
     * Detect language of text
     */
    detectLanguage(text) {
        const persianPattern = /[\u0600-\u06FF]/;
        const arabicPattern = /[\u0600-\u06FF\u0750-\u077F]/;
        const englishPattern = /[a-zA-Z]/;

        if (persianPattern.test(text)) return 'fa';
        if (arabicPattern.test(text)) return 'ar';
        if (englishPattern.test(text)) return 'en';
        return 'unknown';
    },

    /**
     * Normalize Persian text
     */
    normalizePersian(text) {
        return text
            .replace(/ي/g, 'ی')
            .replace(/ك/g, 'ک')
            .replace(/دِ/g, 'د')
            .replace(/بِ/g, 'ب')
            .replace(/زِ/g, 'ز')
            .replace(/[\u064B-\u065F]/g, '') // Remove Arabic diacritics
            .trim();
    },

    /**
     * Convert Finglish to Persian (basic)
     */
    finglishToPersian(text) {
        const map = {
            'a': 'ا', 'b': 'ب', 'p': 'پ', 't': 'ت', 's': 'س',
            'j': 'ج', 'ch': 'چ', 'h': 'ح', 'kh': 'خ', 'd': 'د',
            'r': 'ر', 'z': 'ز', 'zh': 'ژ', 'e': 'ع', 'gh': 'غ',
            'f': 'ف', 'q': 'ق', 'k': 'ک', 'g': 'گ', 'l': 'ل',
            'm': 'م', 'n': 'ن', 'v': 'و', 'w': 'و', 'y': 'ی'
        };
        
        let result = text.toLowerCase();
        Object.entries(map).forEach(([key, value]) => {
            result = result.replace(new RegExp(key, 'g'), value);
        });
        return result;
    },

    /**
     * Store data in localStorage
     */
    store(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Storage error:', e);
            return false;
        }
    },

    /**
     * Retrieve data from localStorage
     */
    retrieve(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Storage error:', e);
            return null;
        }
    },

    /**
     * Clear search history
     */
    clearHistory() {
        localStorage.removeItem('searchHistory');
    },

    /**
     * Add to search history
     */
    addToHistory(query) {
        const history = this.retrieve('searchHistory') || [];
        const normalized = this.normalizePersian(query.toLowerCase());
        
        // Remove if already exists
        const filtered = history.filter(item => 
            this.normalizePersian(item.toLowerCase()) !== normalized
        );
        
        // Add to beginning
        filtered.unshift(query);
        
        // Keep only last 10
        this.store('searchHistory', filtered.slice(0, 10));
    },

    /**
     * Create element with attributes
     */
    createElement(tag, attributes = {}, children = []) {
        const el = document.createElement(tag);
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                el.className = value;
            } else if (key === 'innerHTML') {
                el.innerHTML = value;
            } else if (key.startsWith('on')) {
                el.addEventListener(key.substring(2).toLowerCase(), value);
            } else {
                el.setAttribute(key, value);
            }
        });
        children.forEach(child => {
            if (typeof child === 'string') {
                el.appendChild(document.createTextNode(child));
            } else {
                el.appendChild(child);
            }
        });
        return el;
    },

    /**
     * Show notification
     */
    notify(message, type = 'info') {
        const colors = {
            info: '#4285f4',
            success: '#34a853',
            warning: '#fbbc05',
            error: '#ea4335'
        };

        const notification = this.createElement('div', {
            className: `notification notification-${type}`,
            style: `background: ${colors[type]}; color: white; padding: 1rem; border-radius: 8px; margin: 1rem; position: fixed; top: 0; left: 50%; transform: translateX(-50%); z-index: 9999;`
        }, [message]);

        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.3s';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    /**
     * Check if element is in viewport
     */
    isInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    /**
     * Infinite scroll handler
     */
    onScrollToBottom(callback) {
        window.addEventListener('scroll', Utils.debounce(() => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
                callback();
            }
        }, 200));
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
