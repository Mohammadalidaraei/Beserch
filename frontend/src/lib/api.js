const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8001';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.aiServiceURL = AI_SERVICE_URL;
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept-Language': 'fa',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
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
    const queryParams = new URLSearchParams({
      q: query,
      ...params,
    });
    return this.request(`/api/search?${queryParams}`);
  }

  async searchImages(query, params = {}) {
    const queryParams = new URLSearchParams({
      q: query,
      ...params,
    });
    return this.request(`/api/search/images?${queryParams}`);
  }

  async searchVideos(query, params = {}) {
    const queryParams = new URLSearchParams({
      q: query,
      ...params,
    });
    return this.request(`/api/search/videos?${queryParams}`);
  }

  async searchNews(query, params = {}) {
    const queryParams = new URLSearchParams({
      q: query,
      ...params,
    });
    return this.request(`/api/search/news?${queryParams}`);
  }

  async aiSearch(query, params = {}) {
    const queryParams = new URLSearchParams({
      q: query,
      ...params,
    });
    return this.request(`/api/ai/search?${queryParams}`);
  }

  async getSuggestions(query) {
    return this.request(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
  }

  // Webmaster Endpoints
  async submitWebsite(data) {
    return this.request('/api/webmaster/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getWebsiteStats(websiteId) {
    return this.request(`/api/webmaster/${websiteId}/stats`);
  }

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

  // Auth Endpoints
  async login(email, password) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (data.token) {
      this.setToken(data.token);
      localStorage.setItem('token', data.token);
    }
    
    return data;
  }

  async register(name, email, password) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  async logout() {
    this.token = null;
    localStorage.removeItem('token');
    return this.request('/api/auth/logout', { method: 'POST' });
  }

  // AI Service Endpoints
  async askAI(question, context = []) {
    return fetch(`${this.aiServiceURL}/ask`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ question, context }),
    }).then(res => res.json());
  }

  async generateContent(prompt, type = 'article') {
    return fetch(`${this.aiServiceURL}/generate`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ prompt, type }),
    }).then(res => res.json());
  }
}

export const api = new ApiClient();
export default api;
