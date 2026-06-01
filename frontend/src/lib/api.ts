import axios from 'axios';
import type {
  SearchQuery,
  SearchResponse,
  ImageResult,
  VideoResult,
  AIAnswer,
  SEOAnalysis,
  WebmasterStats,
  WebsiteSubmission,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8001';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

const aiClient = axios.create({
  baseURL: AI_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const searchApi = {
  /**
   * Perform a web search
   */
  async search(query: SearchQuery): Promise<SearchResponse> {
    const response = await apiClient.get('/search', { params: query });
    return response.data;
  },

  /**
   * Search images
   */
  async searchImages(query: SearchQuery): Promise<{ results: ImageResult[]; totalResults: number }> {
    const response = await apiClient.get('/search/images', { params: query });
    return response.data;
  },

  /**
   * Search videos
   */
  async searchVideos(query: SearchQuery): Promise<{ results: VideoResult[]; totalResults: number }> {
    const response = await apiClient.get('/search/videos', { params: query });
    return response.data;
  },

  /**
   * Get AI-powered answer
   */
  async getAIAnswer(question: string): Promise<AIAnswer> {
    const response = await aiClient.post('/ai/search', { query: question });
    return response.data;
  },

  /**
   * Get search suggestions
   */
  async getSuggestions(query: string): Promise<string[]> {
    const response = await apiClient.get('/search/suggestions', { params: { q: query } });
    return response.data.suggestions;
  },
};

export const seoApi = {
  /**
   * Analyze a website for SEO
   */
  async analyze(url: string): Promise<SEOAnalysis> {
    const response = await apiClient.post('/seo/analyze', { url });
    return response.data;
  },

  /**
   * Generate SEO fixes
   */
  async generateFixes(url: string): Promise<{ title: string; metaDescription: string; keywords: string[] }> {
    const response = await aiClient.post('/ai/seo/generate', { url });
    return response.data;
  },

  /**
   * Generate structured data
   */
  async generateSchema(url: string, type: 'article' | 'faq' | 'product'): Promise<object> {
    const response = await aiClient.post('/ai/seo/schema', { url, type });
    return response.data;
  },
};

export const webmasterApi = {
  /**
   * Submit a website for indexing
   */
  async submitWebsite(data: Omit<WebsiteSubmission, 'status' | 'submittedAt'>): Promise<WebsiteSubmission> {
    const response = await apiClient.post('/webmaster/submit', data);
    return response.data;
  },

  /**
   * Get webmaster statistics
   */
  async getStats(domain: string): Promise<WebmasterStats> {
    const response = await apiClient.get(`/webmaster/stats/${encodeURIComponent(domain)}`);
    return response.data;
  },

  /**
   * Get indexed pages
   */
  async getIndexedPages(domain: string, page = 1, limit = 50): Promise<{ pages: any[]; total: number }> {
    const response = await apiClient.get(`/webmaster/pages/${encodeURIComponent(domain)}`, {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Get crawl errors
   */
  async getCrawlErrors(domain: string): Promise<any[]> {
    const response = await apiClient.get(`/webmaster/errors/${encodeURIComponent(domain)}`);
    return response.data;
  },

  /**
   * Submit sitemap
   */
  async submitSitemap(domain: string, sitemapUrl: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(`/webmaster/sitemap/${encodeURIComponent(domain)}`, {
      sitemap_url: sitemapUrl,
    });
    return response.data;
  },
};

export const authApi = {
  /**
   * Login user
   */
  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  /**
   * Register user
   */
  async register(email: string, password: string, name: string): Promise<{ token: string; user: any }> {
    const response = await apiClient.post('/auth/register', { email, password, name });
    return response.data;
  },

  /**
   * Get current user
   */
  async me(): Promise<any> {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },
};

export default apiClient;
