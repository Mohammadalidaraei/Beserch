export interface SearchResult {
  id: string;
  title: string;
  url: string;
  description: string;
  displayUrl: string;
  favicon?: string;
  type: 'web' | 'image' | 'video' | 'news';
  publishedDate?: string;
  source?: string;
  thumbnail?: string;
  duration?: string;
  score?: number;
}

export interface ImageResult {
  id: string;
  title: string;
  imageUrl: string;
  thumbnailUrl: string;
  sourceUrl: string;
  width: number;
  height: number;
  fileSize?: string;
  source?: string;
}

export interface VideoResult {
  id: string;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  sourceUrl: string;
  duration: string;
  source: string;
  publishedDate?: string;
  views?: number;
}

export interface AIAnswer {
  answer: string;
  sources: SearchSource[];
  confidence: number;
  generatedAt: string;
}

export interface SearchSource {
  title: string;
  url: string;
  snippet: string;
}

export interface SearchQuery {
  q: string;
  type?: 'all' | 'images' | 'videos' | 'news' | 'ai';
  page?: number;
  limit?: number;
  sort?: 'relevance' | 'date' | 'popularity';
  timeRange?: 'any' | 'day' | 'week' | 'month' | 'year';
  language?: 'fa' | 'en' | 'ar';
}

export interface SearchResponse {
  results: SearchResult[];
  totalResults: number;
  currentPage: number;
  totalPages: number;
  query: string;
  searchTime: number;
  aiAnswer?: AIAnswer;
  suggestions?: string[];
  relatedSearches?: string[];
}

export interface SEOAnalysis {
  url: string;
  score: number;
  title: {
    value: string;
    length: number;
    optimal: boolean;
    issues: string[];
  };
  metaDescription: {
    value: string;
    length: number;
    optimal: boolean;
    issues: string[];
  };
  headings: {
    h1: number;
    h2: number;
    h3: number;
    structure: string[];
    issues: string[];
  };
  images: {
    total: number;
    withAlt: number;
    withoutAlt: number;
    issues: string[];
  };
  links: {
    internal: number;
    external: number;
    broken: number;
    issues: string[];
  };
  mobileFriendly: boolean;
  speedScore: number;
  coreWebVitals: {
    lcp: number;
    fid: number;
    cls: number;
  };
  recommendations: SEORecommendation[];
}

export interface SEORecommendation {
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  suggestion: string;
}

export interface WebmasterStats {
  totalClicks: number;
  totalImpressions: number;
  averagePosition: number;
  clickThroughRate: number;
  indexedPages: number;
  crawlErrors: number;
  topQueries: QueryStat[];
  topPages: PageStat[];
  devices: DeviceStat[];
  countries: CountryStat[];
}

export interface QueryStat {
  query: string;
  clicks: number;
  impressions: number;
  position: number;
  ctr: number;
}

export interface PageStat {
  url: string;
  clicks: number;
  impressions: number;
  position: number;
  ctr: number;
}

export interface DeviceStat {
  device: 'mobile' | 'desktop' | 'tablet';
  clicks: number;
  impressions: number;
}

export interface CountryStat {
  country: string;
  clicks: number;
  impressions: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'webmaster' | 'admin';
  avatar?: string;
  createdAt: string;
}

export interface WebsiteSubmission {
  url: string;
  sitemapUrl?: string;
  email: string;
  status: 'pending' | 'processing' | 'indexed' | 'rejected';
  submittedAt: string;
  message?: string;
}
