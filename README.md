# BSearch - موتور جستجوی هوشمند ایرانی

یک موتور جستجوی مدرن و پیشرفته با قابلیت‌های هوش مصنوعی، مشابه Google، با تمرکز بر وب فارسی و کاربران ایرانی.

## ویژگی‌ها

### 🔍 موتور جستجو
- جستجوی وب (Web Search)
- جستجوی تصاویر (Image Search)
- جستجوی ویدیوها (Video Search)
- جستجوی اخبار (News Search)
- پاسخ هوش مصنوعی (AI Answer Search)

### 🎨 رابط کاربری
- طراحی مدرن مشابه Google
- کاملاً Responsive (موبایل، تبلت، دسکتاپ)
- حالت تاریک/روشن (Dark/Light Mode)
- پشتیبانی کامل از RTL برای فارسی
- چندزبانه (فارسی، انگلیسی، عربی)

### 🤖 هوش مصنوعی
- تولید پاسخ خودکار به سوالات
- تحلیل معنایی (Semantic Search)
- تشخیص نیت کاربر (Intent Detection)
- تصحیح املایی (Spell Correction)
- شناسایی موجودیت‌ها (Entity Recognition)

### 🛠 ابزارهای سئو
- تحلیلگر سئو صفحات وب
- پیشنهادات اصلاح خودکار
- تولید متا تگ‌ها توسط AI
- بررسی Core Web Vitals

### 📊 پنل وبمستر
- آمار عملکرد جستجو
- صفحات ایندکس‌شده
- خطاهای Crawl
- وضعیت Sitemap
- رتبه‌بندی کلمات کلیدی

## تکنولوژی‌ها

### Frontend
- **JavaScript** (ES6+)
- **Next.js 14** - React Framework
- **React 18** - UI Library
- **TailwindCSS** - Styling
- **PWA** - Progressive Web App

### Backend
- **PHP 8.3** - زبان اصلی بک‌اند
- **Native PHP** - بدون فریم‌ورک
- **PDO** - اتصال به دیتابیس
- **REST API** - API استاندارد

### AI Service
- **Python** - زبان سرویس هوش مصنوعی
- **FastAPI** - فریم‌ورک API
- **Transformers** - مدل‌های NLP
- **PyTorch** - یادگیری عمیق

### Search Engine
- **OpenSearch** - موتور جستجو (Elasticsearch Compatible)

### Databases
- **PostgreSQL** - دیتابیس اصلی
- **Redis** - کش و صف

### Infrastructure
- **Docker** - کانتینری‌سازی
- **Nginx** - Reverse Proxy
- **CDN Support** - پشتیبانی از CDN

## ساختار پروژه

```
bsearch/
├── frontend/          # Next.js Frontend
│   ├── src/
│   │   ├── components/    # کامپوننت‌های React
│   │   ├── pages/         # صفحات Next.js
│   │   ├── hooks/         # Custom Hooks
│   │   ├── styles/        # استایل‌ها
│   │   └── lib/           # کتابخانه‌ها
│   ├── package.json
│   └── next.config.js
│
├── backend/           # PHP Backend
│   ├── src/
│   │   ├── controllers/   # کنترلرها
│   │   ├── models/        # مدل‌ها
│   │   ├── services/      # سرویس‌ها
│   │   ├── config/        # تنظیمات
│   │   └── routes/        # مسیرها
│   └── public/
│
├── ai_service/        # Python AI Service
│   ├── src/
│   │   ├── main.py        # نقطه ورود
│   │   ├── search.py      # جستجوی معنایی
│   │   └── generator.py   # تولید محتوا
│   └── models/
│
├── docker/
│   └── nginx/
│       └── nginx.conf
│
├── docker-compose.yml
└── docs/
    ├── architecture.md
    ├── api.md
    └── deployment.md
```

## نصب و راه‌اندازی

### پیش‌نیازها
- Docker و Docker Compose
- Node.js 18+ (برای توسعه Frontend)
- PHP 8.3+ (برای توسعه Backend)
- Python 3.10+ (برای توسعه AI Service)

### راه‌اندازی سریع با Docker

```bash
# کلون کردن پروژه
git clone https://github.com/bsearch/bsearch.git
cd bsearch

# اجرای سرویس‌ها
docker-compose up -d

# مشاهده لاگ‌ها
docker-compose logs -f

# توقف سرویس‌ها
docker-compose down
```

### دسترسی به سرویس‌ها

| سرویس | آدرس | پورت |
|-------|------|------|
| Frontend | http://localhost:3000 | 3000 |
| Backend API | http://localhost:8000 | 8000 |
| AI Service | http://localhost:8001 | 8001 |
| PostgreSQL | localhost | 5432 |
| Redis | localhost | 6379 |
| OpenSearch | http://localhost:9200 | 9200 |

### توسعه محلی

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Backend
```bash
cd backend
# تنظیم فایل .env
cp .env.example .env
# اجرای سرور داخلی PHP
php -S localhost:8000 -t public
```

#### AI Service
```bash
cd ai_service
python -m venv venv
source venv/bin/activate  # یا venv\Scripts\activate در ویندوز
pip install -r requirements.txt
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

مستندات کامل API در فایل [docs/api.md](docs/api.md) موجود است.

### Endpointهای اصلی

#### جستجو
```
GET /api/search?q=query&type=web|images|videos|news&page=1
```

#### جستجوی هوش مصنوعی
```
GET /api/ai/search?q=question
```

#### تحلیل سئو
```
POST /api/seo/analyze
{
  "url": "https://example.com"
}
```

#### ثبت سایت
```
POST /api/webmaster/submit
{
  "website_url": "https://example.com",
  "sitemap_url": "https://example.com/sitemap.xml",
  "email": "user@example.com"
}
```

## امنیت

- محافظت در برابر CSRF
- محافظت در برابر XSS
- محافظت در برابر SQL Injection
- Rate Limiting
- WAF Support
- DDoS Protection

## Performance Goals

- Largest Contentful Paint < 2s
- First Input Delay < 100ms
- Lighthouse Score > 95
- Mobile First Design

## نقشه راه آینده

- [ ] سرویس نقشه (Map Service)
- [ ] سرویس ایمیل (Email Service)
- [ ] فضای ابری (Cloud Storage)
- [ ] چت هوش مصنوعی (AI Chat)
- [ ] مرورگر (Browser)
- [ ] سرویس ترجمه (Translation Service)
- [ ] جستجوی خرید (Shopping Search)
- [ ] دایرکتوری کسب‌وکار (Business Directory)
- [ ] جستجوی شغل (Job Search)
- [ ] جستجوی علمی (Academic Search)

## مجوز

این پروژه تحت مجوز MIT منتشر شده است.

## تماس و پشتیبانی

- وب‌سایت: https://bsearch.ir
- ایمیل: support@bsearch.ir
- تلگرام: @bsearch_support

---

© ۱۴۰۳ BSearch - موتور جستجوی هوشمند ایرانی
