/**
 * BSearch - Main Application
 * منطق اصلی برنامه
 */

const App = {
    /**
     * Initialize application
     */
    init() {
        this.setupTheme();
        this.setupProfileMenu();
        this.setupLanguageSwitcher();
        this.setupLuckyButton();
        this.registerServiceWorker();
    },

    /**
     * Setup dark/light theme toggle
     */
    setupTheme() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;

        // Load saved theme
        const savedTheme = Utils.retrieve('theme') || 'light';
        this.setTheme(savedTheme);

        themeToggle.addEventListener('click', () => {
            const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            this.setTheme(newTheme);
        });
    },

    /**
     * Set theme
     */
    setTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            document.body.classList.remove('light-mode');
        } else {
            document.body.classList.add('light-mode');
            document.body.classList.remove('dark-mode');
        }
        Utils.store('theme', theme);
    },

    /**
     * Setup profile dropdown menu
     */
    setupProfileMenu() {
        const profileBtn = document.getElementById('profileBtn');
        const dropdown = document.getElementById('profileDropdown');
        
        if (!profileBtn || !dropdown) return;

        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });

        // Close dropdown on click outside
        document.addEventListener('click', () => {
            dropdown.classList.remove('show');
        });
    },

    /**
     * Setup language switcher
     */
    setupLanguageSwitcher() {
        const langBtns = document.querySelectorAll('.lang-btn');
        
        langBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.dataset.lang;
                
                // Update active state
                langBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Save preference
                Utils.store('language', lang);
                
                // Update page direction and language
                if (lang === 'fa' || lang === 'ar') {
                    document.documentElement.dir = 'rtl';
                    document.documentElement.lang = lang;
                } else {
                    document.documentElement.dir = 'ltr';
                    document.documentElement.lang = 'en';
                }
                
                Utils.notify(`زبان به ${btn.textContent} تغییر کرد`, 'success');
            });
        });

        // Load saved language
        const savedLang = Utils.retrieve('language') || 'fa';
        const activeBtn = document.querySelector(`.lang-btn[data-lang="${savedLang}"]`);
        if (activeBtn) activeBtn.click();
    },

    /**
     * Setup "I'm Feeling Lucky" button
     */
    setupLuckyButton() {
        const luckyBtn = document.getElementById('luckyBtn');
        if (!luckyBtn) return;

        luckyBtn.addEventListener('click', async () => {
            const input = document.getElementById('searchInput');
            let query = input.value.trim();

            if (!query) {
                // Get random trending topic
                try {
                    const data = await API.getSuggestions('');
                    const trends = data.trends || [];
                    if (trends.length > 0) {
                        query = trends[Math.floor(Math.random() * trends.length)].text;
                        input.value = query;
                    }
                } catch (error) {
                    console.error('Failed to get trends:', error);
                }
            }

            if (query) {
                Utils.addToHistory(query);
                // Go directly to first result
                try {
                    const data = await API.search(query, { limit: 1 });
                    if (data.results && data.results.length > 0) {
                        window.location.href = data.results[0].url;
                    }
                } catch (error) {
                    console.error('Lucky search failed:', error);
                    window.location.href = `search.html?q=${encodeURIComponent(query)}`;
                }
            }
        });
    },

    /**
     * Register service worker for PWA
     */
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('ServiceWorker registered:', registration.scope);
                })
                .catch(error => {
                    console.error('ServiceWorker registration failed:', error);
                });
        }
    },

    /**
     * Check authentication status
     */
    async checkAuth() {
        const token = API.getToken();
        if (!token) return null;

        try {
            const user = await API.getCurrentUser();
            this.updateProfileUI(user);
            return user;
        } catch (error) {
            API.removeToken();
            return null;
        }
    },

    /**
     * Update profile UI with user info
     */
    updateProfileUI(user) {
        const profileBtn = document.getElementById('profileBtn');
        const dropdown = document.getElementById('profileDropdown');
        
        if (!profileBtn || !dropdown) return;

        const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';
        profileBtn.textContent = initial;

        dropdown.innerHTML = `
            <div class="user-info">
                <strong>${Utils.escapeHtml(user.name)}</strong>
                <small>${Utils.escapeHtml(user.email)}</small>
            </div>
            <a href="dashboard.html" class="dropdown-item">داشبورد</a>
            <a href="settings.html" class="dropdown-item">تنظیمات</a>
            <hr>
            <a href="#" class="dropdown-item" onclick="App.logout()">خروج</a>
        `;
    },

    /**
     * Logout user
     */
    async logout() {
        try {
            await API.logout();
        } catch (error) {
            console.error('Logout failed:', error);
        }
        window.location.reload();
    },

    /**
     * Show loading overlay
     */
    showLoading(message = 'در حال بارگذاری...') {
        const overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="spinner"></div>
                <p>${message}</p>
            </div>
        `;
        document.body.appendChild(overlay);
    },

    /**
     * Hide loading overlay
     */
    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) overlay.remove();
    }
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}

// Export for use in other pages
if (typeof module !== 'undefined' && module.exports) {
    module.exports = App;
}
