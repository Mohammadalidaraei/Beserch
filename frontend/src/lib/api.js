import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8001';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Search API
export const searchApi = {
  web: (query, page = 1, filters = {}) => 
    api.get('/search', { params: { q: query, page, ...filters } }),
  
  images: (query, page = 1, filters = {}) => 
    api.get('/search/images', { params: { q: query, page, ...filters } }),
  
  videos: (query, page = 1, filters = {}) => 
    api.get('/search/videos', { params: { q: query, page, ...filters } }),
  
  news: (query, page = 1, filters = {}) => 
    api.get('/search/news', { params: { q: query, page, ...filters } }),
  
  suggestions: (query) => 
    api.get('/search/suggestions', { params: { q: query } }),
};

// AI Search API
export const aiSearchApi = {
  answer: (query) => 
    api.post('/ai/search', { query }),
  
  chat: (messages) => 
    api.post('/ai/chat', { messages }),
};

// SEO Assistant API
export const seoApi = {
  analyze: (url) => 
    api.post('/seo/analyze', { url }),
  
  generateFixes: (url, issues) => 
    api.post('/seo/generate-fixes', { url, issues }),
  
  generateMeta: (url) => 
    api.post('/seo/generate-meta', { url }),
};

// Webmaster API
export const webmasterApi = {
  submitSite: (siteData) => 
    api.post('/webmaster/sites', siteData),
  
  getSites: () => 
    api.get('/webmaster/sites'),
  
  getSiteStats: (siteId) => 
    api.get(`/webmaster/sites/${siteId}/stats`),
  
  getCrawlJobs: (siteId) => 
    api.get(`/webmaster/sites/${siteId}/crawls`),
  
  getIndexStatus: (siteId) => 
    api.get(`/webmaster/sites/${siteId}/index`),
};

// Auth API
export const authApi = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  register: (userData) => 
    api.post('/auth/register', userData),
  
  logout: () => 
    api.post('/auth/logout'),
  
  me: () => 
    api.get('/auth/me'),
};

// Crawler API
export const crawlerApi = {
  startCrawl: (siteId) => 
    api.post(`/crawler/start/${siteId}`),
  
  stopCrawl: (siteId) => 
    api.post(`/crawler/stop/${siteId}`),
  
  getCrawlStatus: (siteId) => 
    api.get(`/crawler/status/${siteId}`),
};

export default api;
