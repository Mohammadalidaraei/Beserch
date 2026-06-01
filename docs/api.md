# BSearch API Documentation

## Base URL

- **Development**: `http://localhost:8000/api`
- **Production**: `https://api.bsearch.ir/api`

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer {token}
```

## Endpoints

### Search

#### Web Search
```
GET /api/search
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| q | string | Yes | Search query |
| type | string | No | Search type (all, images, videos, news) |
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Results per page (default: 10, max: 50) |
| sort | string | No | Sort order (relevance, date, popularity) |
| timeRange | string | No | Time filter (any, day, week, month, year) |
| language | string | No | Language filter (fa, en, ar) |

**Response:**
```json
{
  "results": [
    {
      "id": "uuid",
      "title": "Page Title",
      "url": "https://example.com/page",
      "displayUrl": "example.com/page",
      "description": "Page description...",
      "favicon": "https://example.com/favicon.ico",
      "type": "web",
      "score": 0.95
    }
  ],
  "totalResults": 1000,
  "currentPage": 1,
  "totalPages": 100,
  "query": "search query",
  "searchTime": 0.234,
  "suggestions": ["related query 1", "related query 2"],
  "relatedSearches": ["related search 1"]
}
```

#### Image Search
```
GET /api/search/images
```

**Parameters:** Same as web search

**Response:**
```json
{
  "results": [
    {
      "id": "uuid",
      "title": "Image Title",
      "imageUrl": "https://example.com/image.jpg",
      "thumbnailUrl": "https://example.com/thumb.jpg",
      "sourceUrl": "https://example.com/page",
      "width": 1920,
      "height": 1080,
      "fileSize": "245 KB",
      "source": "Example Site"
    }
  ],
  "totalResults": 5000
}
```

#### Video Search
```
GET /api/search/videos
```

**Response:**
```json
{
  "results": [
    {
      "id": "uuid",
      "title": "Video Title",
      "thumbnailUrl": "https://example.com/thumb.jpg",
      "videoUrl": "https://example.com/video.mp4",
      "sourceUrl": "https://example.com/page",
      "duration": "10:30",
      "source": "Example Channel",
      "publishedDate": "2024-01-15",
      "views": 10000
    }
  ],
  "totalResults": 2000
}
```

#### Search Suggestions
```
GET /api/search/suggestions?q=query
```

**Response:**
```json
{
  "suggestions": [
    "suggestion 1",
    "suggestion 2",
    "suggestion 3"
  ]
}
```

### AI Search

#### Get AI Answer
```
POST /api/ai/search
```

**Body:**
```json
{
  "query": "What is the best laptop for programming?"
}
```

**Response:**
```json
{
  "answer": "The best laptops for programming in 2024 include...",
  "sources": [
    {
      "title": "Best Programming Laptops 2024",
      "url": "https://example.com/article",
      "snippet": "Top laptops for developers..."
    }
  ],
  "confidence": 0.92,
  "generatedAt": "2024-01-20T10:30:00Z"
}
```

### SEO Tools

#### Analyze Website
```
POST /api/seo/analyze
```

**Body:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "url": "https://example.com",
  "score": 75,
  "title": {
    "value": "Example Site",
    "length": 12,
    "optimal": false,
    "issues": ["Title too short"]
  },
  "metaDescription": {
    "value": "Example description",
    "length": 19,
    "optimal": false,
    "issues": ["Meta description too short"]
  },
  "headings": {
    "h1": 1,
    "h2": 5,
    "h3": 10,
    "structure": ["H1 > H2 > H3"],
    "issues": []
  },
  "images": {
    "total": 20,
    "withAlt": 15,
    "withoutAlt": 5,
    "issues": ["5 images missing alt text"]
  },
  "links": {
    "internal": 50,
    "external": 10,
    "broken": 2,
    "issues": ["2 broken links found"]
  },
  "mobileFriendly": true,
  "speedScore": 85,
  "coreWebVitals": {
    "lcp": 2.1,
    "fid": 80,
    "cls": 0.05
  },
  "recommendations": [
    {
      "type": "critical",
      "title": "Improve Meta Description",
      "description": "Meta description is too short",
      "suggestion": "Expand to 150-160 characters"
    }
  ]
}
```

### Webmaster Tools

#### Submit Website
```
POST /api/webmaster/submit
```

**Body:**
```json
{
  "url": "https://example.com",
  "sitemapUrl": "https://example.com/sitemap.xml",
  "email": "admin@example.com"
}
```

**Response:**
```json
{
  "id": "uuid",
  "url": "https://example.com",
  "sitemapUrl": "https://example.com/sitemap.xml",
  "email": "admin@example.com",
  "status": "pending",
  "submittedAt": "2024-01-20T10:30:00Z"
}
```

#### Get Statistics
```
GET /api/webmaster/stats/{domain}
```

**Response:**
```json
{
  "totalClicks": 15000,
  "totalImpressions": 250000,
  "averagePosition": 12.5,
  "clickThroughRate": 0.06,
  "indexedPages": 450,
  "crawlErrors": 5,
  "topQueries": [
    {
      "query": "example keyword",
      "clicks": 500,
      "impressions": 8000,
      "position": 5,
      "ctr": 0.0625
    }
  ],
  "topPages": [
    {
      "url": "https://example.com/page",
      "clicks": 300,
      "impressions": 5000,
      "position": 8,
      "ctr": 0.06
    }
  ],
  "devices": [
    {
      "device": "mobile",
      "clicks": 9000,
      "impressions": 150000
    },
    {
      "device": "desktop",
      "clicks": 6000,
      "impressions": 100000
    }
  ],
  "countries": [
    {
      "country": "IR",
      "clicks": 12000,
      "impressions": 200000
    }
  ]
}
```

#### Get Indexed Pages
```
GET /api/webmaster/pages/{domain}?page=1&limit=50
```

#### Get Crawl Errors
```
GET /api/webmaster/errors/{domain}
```

#### Submit Sitemap
```
POST /api/webmaster/sitemap/{domain}
```

**Body:**
```json
{
  "sitemap_url": "https://example.com/sitemap.xml"
}
```

### Authentication

#### Register
```
POST /api/auth/register
```

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "password_confirmation": "securepassword"
}
```

**Response:**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### Login
```
POST /api/auth/login
```

**Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### Get Current User
```
GET /api/auth/me
```

#### Logout
```
POST /api/auth/logout
```

## Error Responses

### Standard Error Format
```json
{
  "message": "Error message",
  "errors": {
    "field": ["Validation error"]
  },
  "status_code": 422
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 429 | Too Many Requests |
| 500 | Server Error |

## Rate Limiting

- **Unauthenticated**: 60 requests per minute
- **Authenticated**: 300 requests per minute
- **Search API**: 30 requests per minute
- **AI API**: 10 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
Retry-After: 30
```

## Pagination

All list endpoints support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

**Response Format:**
```json
{
  "data": [],
  "meta": {
    "current_page": 1,
    "last_page": 10,
    "per_page": 10,
    "total": 100
  },
  "links": {
    "first": "/api/endpoint?page=1",
    "last": "/api/endpoint?page=10",
    "prev": null,
    "next": "/api/endpoint?page=2"
  }
}
```
