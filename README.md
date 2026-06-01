# BSearch - موتور جستجوی ایرانی با هوش مصنوعی

## معرفی پروژه

BSearch یک موتور جستجوی مدرن و پیشرفته مشابه Google است که با تمرکز بر وب فارسی و کاربران ایرانی طراحی شده است. این سیستم کاملاً Responsive بوده و روی موبایل، تبلت و دسکتاپ بدون نقص کار می‌کند.

## تکنولوژی‌های استفاده‌شده

### Frontend
- **JavaScript** (ES6+)
- **Next.js 14** - فریم‌ورک React با SSR
- **React 18** - کتابخانه UI
- **TailwindCSS** - استایل‌دهی
- **PWA** - اپلیکیشن وب پیش‌رونده

### Backend
- **PHP 8.3** (خالص - بدون فریم‌ورک)
- **PostgreSQL** - پایگاه داده
- **Redis** - کش
- **OpenSearch** - موتور جستجو

### AI Service
- **Python** 
- **FastAPI** - فریم‌ورک وب
- **Transformers** - مدل‌های هوش مصنوعی
- **PyTorch** - یادگیری عمیق

### Infrastructure
- **Docker** - کانتینریزاسیون
- **Nginx** - وب سرور
- **Kubernetes** - ارکستراسیون (اختیاری)

## ساختار پروژه

```
bsearch/
├── frontend/              # فرانت‌اند Next.js
│   ├── src/
│   │   ├── components/    # کامپوننت‌های React
│   │   ├── pages/         # صفحات Next.js
│   │   ├── hooks/         # هوک‌های سفارشی
│   │   ├── styles/        # استایل‌ها
│   │   └── utils/         # توابع کمکی
│   ├── package.json
│   └── next.config.js
├── backend/               # بک‌اند PHP خالص
│   ├── config/            # فایل‌های پیکربندی
│   ├── controllers/       # کنترلرها
│   ├── models/            # مدل‌ها
│   ├── services/          # سرویس‌ها
│   ├── routes/            # مسیرهای API
│   ├── middleware/        # میان‌افزارها
│   ├── database/          # اسکریپت‌های دیتابیس
│   └── index.php          # نقطه ورود
├── ai_service/            # سرویس هوش مصنوعی Python
│   ├── app/               # کد اصلی
│   ├── models/            # مدل‌های ML
│   └── routers/           # مسیرهای API
├── docker/                # فایل‌های Docker
│   └── nginx/
├── docs/                  # مستندات
└── docker-compose.yml     # تنظیمات Docker
```

## قابلیت‌ها

### موتور جستجو
- جستجوی وب (Web Search)
- جستجوی تصاویر (Image Search)
- جستجوی ویدیوها (Video Search)
- جستجوی اخبار (News Search)
- پاسخ هوشمند با AI (AI Answer Search)

### ویژگی‌های کلیدی
- پشتیبانی کامل از زبان فارسی
- بهینه‌سازی برای فینگلیش و عربی
- اصلاح املایی خودکار
- تشخیص نیت کاربر (Intent Detection)
- شناسایی موجودیت‌ها (Entity Recognition)

### دستیار سئو
- تحلیل Title و Meta Description
- بررسی ساختار Heading
- بررسی تصاویر و Alt
- تحلیل لینک‌های داخلی و خارجی
- بررسی Mobile Friendly
- امتیاز سرعت و Core Web Vitals
- تولید خودکار پیشنهادات سئو

### ابزار وبمستر
- ثبت سایت برای ایندکس
- مشاهده عملکرد جستجو
- صفحات ایندکس‌شده
- خطاهای Crawl
- وضعیت Sitemap
- رتبه‌بندی کلمات کلیدی
- کلیک‌ها و Impression‌ها

### پنل مدیریت
- مدیریت کاربران
- مدیریت Crawl
- مدیریت Index
- مدیریت تبلیغات
- مدیریت گزارشات
- مدیریت مدل‌های AI

## نصب و راه‌اندازی

### پیش‌نیازها
- Docker و Docker Compose
- حداقل 8GB RAM
- 20GB فضای ذخیره‌سازی

### راه‌اندازی سریع

```bash
# کلون کردن پروژه
git clone https://github.com/your-org/bsearch.git
cd bsearch

# اجرای سرویس‌ها با Docker
docker-compose up -d

# مشاهده لاگ‌ها
docker-compose logs -f

# توقف سرویس‌ها
docker-compose down
```

### دسترسی به سرویس‌ها

| سرویس | آدرس | توضیحات |
|-------|------|---------|
| Frontend | http://localhost:3000 | رابط کاربری |
| Backend API | http://localhost:8000 | API بک‌اند |
| AI Service | http://localhost:8001 | سرویس هوش مصنوعی |
| OpenSearch | http://localhost:9200 | موتور جستجو |
| PostgreSQL | localhost:5432 | پایگاه داده |
| Redis | localhost:6379 | کش |

## مستندات API

### جستجو

```http
GET /api/search?q=جستجو&page=1&limit=10
```

**پاسخ:**
```json
{
  "success": true,
  "query": "جستجو",
  "page": 1,
  "total": 1000,
  "results": [...],
  "time": 45.2
}
```

### جستجوی تصاویر

```http
GET /api/search/images?q=تصویر&page=1&limit=20
```

### جستجوی هوشمند با AI

```http
POST /api/ai/search
Content-Type: application/json

{
  "query": "بهترین لپ تاپ برنامه نویسی چیست؟"
}
```

### تحلیل سئو

```http
POST /api/seo/analyze
Content-Type: application/json

{
  "url": "https://example.com"
}
```

### ثبت سایت

```http
POST /api/webmaster/submit
Content-Type: application/json

{
  "website_url": "https://example.com",
  "sitemap_url": "https://example.com/sitemap.xml",
  "email": "admin@example.com"
}
```

## امنیت

- محافظت در برابر CSRF
- محافظت در برابر XSS
- محافظت در برابر SQL Injection
- Rate Limiting
- پشتیبانی از WAF
- محافظت در برابر DDoS

## عملکرد

هدف‌های عملکردی:

- **Largest Contentful Paint**: کمتر از 2 ثانیه
- **First Input Delay**: کمتر از 100 میلی‌ثانیه
- **Lighthouse Score**: بالای 95
- **Mobile First**: طراحی اولویت با موبایل

## نقشه راه آینده

- سرویس نقشه (Map Service)
- سرویس ایمیل (Email Service)
- فضای ابری (Cloud Storage)
- چت هوشمند (AI Chat)
- مرورگر (Browser)
- سرویس ترجمه (Translation Service)
- جستجوی خرید (Shopping Search)
- دایرکتوری کسب‌وکار (Business Directory)
- جستجوی شغل (Job Search)
- جستجوی آکادمیک (Academic Search)

## مجوز

این پروژه تحت مجوز MIT منتشر شده است.

## تماس و پشتیبانی

برای گزارش مشکلات یا پیشنهاد ویژگی‌های جدید، لطفاً از بخش Issues گیت‌هاب استفاده کنید.

---

**BSearch** - موتور جستجوی ایرانی با هوش مصنوعی © 2024
