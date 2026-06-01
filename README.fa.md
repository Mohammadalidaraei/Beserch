# BSearch - موتور جستجوی هوشمند فارسی

## معرفی پروژه

BSearch یک موتور جستجوی مدرن و هوشمند است که با تمرکز بر وب فارسی و کاربران ایرانی طراحی شده است. این پروژه از آخرین فناوری‌های روز دنیا استفاده می‌کند و قابلیت‌های پیشرفته‌ای مانند جستجوی معنایی، پاسخ‌های هوشمند AI، و ابزارهای سئو را ارائه می‌دهد.

## ویژگی‌های اصلی

### 🔍 موتور جستجو
- جستجوی وب، تصاویر، ویدیوها و اخبار
- ایندکسینگ پیشرفته با OpenSearch
- رتبه‌بندی BM25 و PageRank
- جستجوی معنایی با هوش مصنوعی
- پشتیبانی از زبان‌های فارسی، انگلیسی و عربی

### 🤖 هوش مصنوعی
- پاسخ‌های هوشمند به سوالات کاربران
- تولید خودکار محتوای سئو
- تشخیص نیت کاربر
- تصحیح املایی
- شناسایی موجودیت‌ها

### 🛠️ ابزار وبمستر
- ثبت سایت برای ایندکس
- مشاهده عملکرد جستجو
- مدیریت sitemap
- گزارش خطاهای crawl
- آمار کلیک و نمایش

### 📊 دستیار سئو
- تحلیل کامل صفحات وب
- بررسی Title و Meta Description
- آنالیز ساختار هدینگ‌ها
- بررسی تصاویر و Alt Text
- تحلیل لینک‌های داخلی و خارجی
- Core Web Vitals
- پیشنهادات بهبود خودکار

## ساختار پروژه

```
/workspace
├── frontend/          # Next.js 14 + TypeScript
│   ├── src/
│   │   ├── pages/     # صفحات اصلی
│   │   ├── components/# کامپوننت‌های React
│   │   ├── hooks/     # Custom Hooks
│   │   ├── lib/       # کتابخانه‌ها و API clients
│   │   ├── types/     # TypeScript types
│   │   └── styles/    # استایل‌های جهانی
│   └── public/        # فایل‌های استاتیک
├── backend/           # Laravel 12 + PHP 8.3
│   ├── app/
│   │   ├── Http/      # Controllers, Middleware
│   │   ├── Models/    # Eloquent Models
│   │   ├── Services/  # Business Logic
│   │   └── Jobs/      # Queue Jobs
│   ├── database/      # Migrations, Seeders
│   └── routes/        # API Routes
├── ai_service/        # Python FastAPI
│   ├── app/
│   │   ├── api/       # API Endpoints
│   │   ├── models/    # Pydantic Models
│   │   ├── services/  # AI Services
│   │   └── utils/     # Utilities
│   └── data/          # Training Data
├── infrastructure/    # Docker, K8s, Nginx
│   ├── docker/        # Docker Configs
│   ├── k8s/           # Kubernetes Manifests
│   └── nginx/         # Nginx Configs
└── docs/              # مستندات
```

## تکنولوژی‌ها

### Frontend
- **Next.js 14** - React Framework با SSR
- **TypeScript** - Type Safety
- **TailwindCSS** - Styling
- **PWA** - Progressive Web App

### Backend
- **Laravel 12** - PHP Framework
- **PHP 8.3** - Latest PHP Version
- **PostgreSQL** - Primary Database
- **Redis** - Caching & Sessions
- **OpenSearch** - Search Engine

### AI Services
- **FastAPI** - Python API Framework
- **PyTorch** - Deep Learning
- **Transformers** - NLP Models
- **LangChain** - LLM Orchestration

### Infrastructure
- **Docker** - Containerization
- **Kubernetes** - Orchestration
- **Nginx** - Reverse Proxy
- **CDN** - Content Delivery

## نصب و راه‌اندازی

### پیش‌نیازها
- Docker & Docker Compose
- Node.js 18+
- PHP 8.3+
- Python 3.10+

### راه‌اندازی سریع با Docker

```bash
# کلون کردن پروژه
git clone <repository-url>
cd BSearch

# اجرای سرویس‌ها
docker-compose up -d

# اجرای миграция‌ها
docker-compose exec backend php artisan migrate --seed

# نصب dependencies فرانت‌اند
cd frontend
npm install
npm run dev
```

### دسترسی به سرویس‌ها
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **AI Service**: http://localhost:8001
- **OpenSearch**: http://localhost:9200
- **PostgreSQL**: localhost:5432

## مستندات

- [معماری سیستم](docs/architecture.md)
- [API Documentation](docs/api.md)
- [راهنمای Deployment](docs/deployment.md)

## API Endpoints

### جستجو
```
GET /api/search?q=query&type=all|images|videos|news|ai
GET /api/search/images?q=query
GET /api/search/videos?q=query
GET /api/search/suggestions?q=query
```

### سئو
```
POST /api/seo/analyze
{
  "url": "https://example.com"
}

POST /api/ai/seo/generate
{
  "url": "https://example.com"
}
```

### وبمستر
```
POST /api/webmaster/submit
GET /api/webmaster/stats/{domain}
GET /api/webmaster/pages/{domain}
POST /api/webmaster/sitemap/{domain}
```

### احراز هویت
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me
```

## امنیت

- محافظت در برابر CSRF
- محافظت در برابر XSS
- محافظت در برابر SQL Injection
- Rate Limiting
- WAF Support
- DDoS Protection

## عملکرد

هدف‌های عملکردی:
- **LCP**: کمتر از 2 ثانیه
- **FID**: کمتر از 100 میلی‌ثانیه
- **Lighthouse Score**: بالای 95
- **Mobile First**: کاملاً واکنش‌گرا

## نقشه راه

### فاز ۱ (فعالی)
- ✅ موتور جستجوی پایه
- ✅ جستجوی تصاویر و ویدیوها
- ✅ پنل وبمستر
- ✅ دستیار سئو

### فاز ۲
- [ ] سرویس نقشه
- [ ] سرویس ایمیل
- [ ] ذخیره‌سازی ابری
- [ ] چت هوشمند

### فاز ۳
- [ ] مرورگر اختصاصی
- [ ] سرویس ترجمه
- [ ] جستجوی خرید
- [ ] دایرکتوری کسب‌وکارها
- [ ] جستجوی شغل
- [ ] جستجوی علمی

## مشارکت

برای مشارکت در پروژه، لطفاً راهنمای CONTRIBUTING.md را مطالعه کنید.

## لایسنس

این پروژه تحت لایسنس MIT منتشر شده است.

---

© ۱۴۰۳ BSearch - تمام حقوق محفوظ است
