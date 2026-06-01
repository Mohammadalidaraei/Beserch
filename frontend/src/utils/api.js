const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const AI_API_URL = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:8001';

class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Search Endpoints
  async search(query, params = {}) {
    const queryParams = new URLSearchParams({ q: query, ...params });
    return this.request(`/api/search?${queryParams}`);
  }

  async imageSearch(query, params = {}) {
    const queryParams = new URLSearchParams({ q: query, ...params });
    return this.request(`/api/search/images?${queryParams}`);
  }

  async videoSearch(query, params = {}) {
    const queryParams = new URLSearchParams({ q: query, ...params });
    return this.request(`/api/search/videos?${queryParams}`);
  }

  async newsSearch(query, params = {}) {
    const queryParams = new URLSearchParams({ q: query, ...params });
    return this.request(`/api/search/news?${queryParams}`);
  }

  async aiSearch(query) {
    return this.request('/api/ai/search', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }

  async getSuggestions(query) {
    const queryParams = new URLSearchParams({ q: query });
    return this.request(`/api/search/suggestions?${queryParams}`);
  }

  // SEO Assistant
  async analyzeSEO(url) {
    return this.request('/api/seo/analyze', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  }

  async generateSEOFixes(url, issues) {
    return this.request('/api/seo/generate-fixes', {
      method: 'POST',
      body: JSON.stringify({ url, issues }),
    });
  }

  // Webmaster
  async submitWebsite(data) {
    return this.request('/api/webmaster/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getWebmasterStats(websiteId) {
    return this.request(`/api/webmaster/stats/${websiteId}`);
  }

  // Authentication
  async login(email, password) {
    const result = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (result.token) {
      this.setToken(result.token);
    }
    return result;
  }

  async register(name, email, password) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  async logout() {
    this.token = null;
    return this.request('/api/auth/logout', { method: 'POST' });
  }

  async getCurrentUser() {
    return this.request('/api/auth/me');
  }
}

// Export instances
export const api = new ApiClient(API_BASE_URL);
export const aiApi = new ApiClient(AI_API_URL);

export default ApiClient;
