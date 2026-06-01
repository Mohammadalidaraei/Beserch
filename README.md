# BSearch - موتور جستجوی ایرانی

یک موتور جستجوی مدرن مبتنی بر هوش مصنوعی مشابه Google با تمرکز بر وب فارسی و کاربران ایرانی.

## 🚀 تکنولوژی‌ها

### Frontend
- **JavaScript** خالص (بدون TypeScript)
- Next.js 14
- React 18
- TailwindCSS
- PWA Support

### Backend
- **PHP 8.3** خالص (بدون فریم‌ورک)
- PostgreSQL
- Redis
- OpenSearch

### AI Service
- **Python** 3.11
- FastAPI
- PyTorch (برای مدل‌های پیشرفته)

## 📦 ساختار پروژه

```
bsearch/
├── frontend/          # Next.js frontend (JavaScript)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── lib/
│   └── package.json
├── backend/           # PHP 8.3 backend (Pure PHP)
│   ├── public/
│   │   ├── index.php
│   │   ├── Database.php
│   │   ├── SearchEngine.php
│   │   ├── Crawler.php
│   │   └── AIConnector.php
│   ├── database/
│   │   └── schema.sql
│   └── Dockerfile
├── ai_service/        # Python AI service
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
├── docker/
│   └── nginx/
│       └── nginx.conf
├── docker-compose.yml
└── README.md
```

## 🔧 نصب و اجرا

### پیش‌نیازها
- Docker و Docker Compose
- Node.js 18+ (برای توسعه frontend)

### اجرای سریع با Docker

```bash
# کلون کردن پروژه
git clone <repository-url>
cd bsearch

# اجرای تمام سرویس‌ها
docker-compose up -d

# مشاهده لاگ‌ها
docker-compose logs -f

# توقف سرویس‌ها
docker-compose down
```

### دسترسی به سرویس‌ها

| سرویس | آدرس | توضیحات |
|-------|------|---------|
| Frontend | http://localhost:3000 | صفحه اصلی جستجو |
| Backend API | http://localhost:8000 | API موتور جستجو |
| AI Service | http://localhost:8001 | سرویس هوش مصنوعی |
| PostgreSQL | localhost:5432 | پایگاه داده |
| Redis | localhost:6379 | کش |
| OpenSearch | localhost:9200 | ایندکس جستجو |

## 📡 API Endpoints

### جستجو
```
GET /api/search?q=جستجو&type=web&page=1
```

### ثبت سایت جدید
```
POST /api/submit
{
  "url": "https://example.com",
  "sitemap": "https://example.com/sitemap.xml"
}
```

### پاسخ هوش مصنوعی
```
POST /api/ai/answer
{
  "q": "سوال شما"
}
```

### تحلیل سئو
```
POST /api/seo/analyze
{
  "url": "https://example.com"
}
```

## 🎯 ویژگی‌ها

### موتور جستجو
- جستجوی وب، تصاویر، ویدیوها، اخبار
- الگوریتم‌های BM25 و PageRank
- جستجوی معنایی با هوش مصنوعی
- پشتیبانی از فارسی، انگلیسی و عربی

### هوش مصنوعی
- تولید پاسخ خودکار
- اصلاح املای فارسی
- تشخیص نیت کاربر
- استخراج موجودیت‌ها

### ابزارهای وبمستر
- ثبت سایت و نقشه سایت
- تحلیل سئو خودکار
- گزارش عملکرد جستجو
- پیشنهاد اصلاحات

### UI/UX
- طراحی Responsive
- حالت تاریک/روشن
- پشتیبانی RTL
- جستجوی صوتی
- پیشنهادات خودکار

## 🔐 امنیت

- محافظت در برابر SQL Injection
- محافظت در برابر XSS
- محافظت در برابر CSRF
- Rate Limiting
- اعتبارسنجی ورودی‌ها

## 📊 Performance Goals

- LCP < 2s
- FID < 100ms
- Lighthouse Score > 95
- Mobile First Design

## 🛠 توسعه

### اجرای Frontend در حالت توسعه

```bash
cd frontend
npm install
npm run dev
```

### اجرای Backend به صورت مستقل

```bash
cd backend/public
php -S localhost:8000
```

### اجرای AI Service به صورت مستقل

```bash
cd ai_service
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

## 📝 لایسنس

این پروژه تحت لایسنس MIT منتشر شده است.

---

**BSearch** - ساخته شده با ❤️ برای جامعه فارسی‌زبان
