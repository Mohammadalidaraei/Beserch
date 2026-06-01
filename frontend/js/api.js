/**
 * BSearch - API Client
 * ارتباط با سرور بک‌اند
 */

const API = {
    baseURL: 'http://localhost:8000',
    aiURL: 'http://localhost:8001',
    
    /**
     * Get auth token from localStorage
     */
    getToken() {
        return localStorage.getItem('authToken');
    },

    /**
     * Set auth token
     */
    setToken(token) {
        localStorage.setItem('authToken', token);
    },

    /**
     * Remove auth token
     */
    removeToken() {
        localStorage.removeItem('authToken');
    },

    /**
     * Make HTTP request
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const token = this.getToken();
        
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);
            
            if (response.status === 401) {
                this.removeToken();
                window.location.href = '/login.html';
                throw new Error('Unauthorized');
            }

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    /**
     * GET request
     */
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    },

    /**
     * POST request
     */
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    /**
     * PUT request
     */
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    /**
     * DELETE request
     */
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    },

    // ==================== Search APIs ====================

    /**
     * Web search
     */
    async search(query, options = {}) {
        return this.get('/api/search', {
            q: query,
            type: 'web',
            ...options
        });
    },

    /**
     * Image search
     */
    async searchImages(query, options = {}) {
        return this.get('/api/search', {
            q: query,
            type: 'image',
            ...options
        });
    },

    /**
     * Video search
     */
    async searchVideos(query, options = {}) {
        return this.get('/api/search', {
            q: query,
            type: 'video',
            ...options
        });
    },

    /**
     * News search
     */
    async searchNews(query, options = {}) {
        return this.get('/api/search', {
            q: query,
            type: 'news',
            ...options
        });
    },

    /**
     * AI-powered search
     */
    async aiSearch(query) {
        return this.post(`${this.aiURL}/api/ai-search`, { query });
    },

    /**
     * Get search suggestions
     */
    async getSuggestions(query) {
        return this.get('/api/suggestions', { q: query });
    },

    /**
     * Voice search (speech to text)
     */
    async voiceSearch(audioBlob) {
        const formData = new FormData();
        formData.append('audio', audioBlob);
        
        return this.request('/api/voice-search', {
            method: 'POST',
            body: formData
        });
    },

    // ==================== Auth APIs ====================

    /**
     * Login
     */
    async login(email, password) {
        const data = await this.post('/api/auth/login', { email, password });
        if (data.token) {
            this.setToken(data.token);
        }
        return data;
    },

    /**
     * Register
     */
    async register(name, email, password) {
        return this.post('/api/auth/register', { name, email, password });
    },

    /**
     * Logout
     */
    async logout() {
        await this.post('/api/auth/logout');
        this.removeToken();
    },

    /**
     * Get current user
     */
    async getCurrentUser() {
        return this.get('/api/auth/me');
    },

    // ==================== Webmaster APIs ====================

    /**
     * Submit website
     */
    async submitWebsite(url, sitemap, email) {
        return this.post('/api/webmaster/submit', { url, sitemap, email });
    },

    /**
     * Get website stats
     */
    async getWebsiteStats(siteId) {
        return this.get(`/api/webmaster/stats/${siteId}`);
    },

    /**
     * Get indexed pages
     */
    async getIndexedPages(siteId) {
        return this.get(`/api/webmaster/pages/${siteId}`);
    },

    /**
     * Get crawl errors
     */
    async getCrawlErrors(siteId) {
        return this.get(`/api/webmaster/errors/${siteId}`);
    },

    /**
     * Submit sitemap
     */
    async submitSitemap(siteId, sitemapUrl) {
        return this.post(`/api/webmaster/sitemap/${siteId}`, { sitemapUrl });
    },

    // ==================== SEO Tool APIs ====================

    /**
     * Analyze website SEO
     */
    async analyzeSEO(url) {
        return this.post('/api/seo/analyze', { url });
    },

    /**
     * Generate SEO fixes
     */
    async generateSEOFixes(issues) {
        return this.post('/api/seo/generate-fixes', { issues });
    },

    /**
     * Generate meta tags
     */
    async generateMetaTags(url) {
        return this.post('/api/seo/generate-meta', { url });
    },

    /**
     * Check Core Web Vitals
     */
    async checkWebVitals(url) {
        return this.get('/api/seo/web-vitals', { url });
    },

    // ==================== Admin APIs ====================

    /**
     * Get dashboard stats
     */
    async getAdminStats() {
        return this.get('/api/admin/stats');
    },

    /**
     * Manage crawl jobs
     */
    async manageCrawl(action, jobId = null) {
        return this.post('/api/admin/crawl', { action, jobId });
    },

    /**
     * Manage index
     */
    async manageIndex(action, docId = null) {
        return this.post('/api/admin/index', { action, docId });
    },

    /**
     * Get system logs
     */
    async getLogs(type = 'all', limit = 100) {
        return this.get('/api/admin/logs', { type, limit });
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}
