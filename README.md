# BSearch - Iranian Search Engine

موتور جستجوی ایرانی با هوش مصنوعی

## تکنولوژی‌ها

- **Frontend**: JavaScript خالص (Next.js 14, React 18, TailwindCSS)
- **Backend**: PHP 8.3 خالص (بدون فریم‌ورک)
- **AI Service**: Python (FastAPI)
- **Database**: PostgreSQL
- **Cache**: Redis
- **Search Engine**: OpenSearch

## ساختار پروژه

```
/workspace
├── frontend/          # فرانت‌اند Next.js
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── styles/
│   └── package.json
├── backend/           # بک‌اند PHP خالص
│   ├── controllers/
│   │   ├── SearchController.php
│   │   └── SeoController.php
│   ├── config.php
│   ├── Database.php
│   ├── Router.php
│   ├── Security.php
│   ├── RedisClient.php
│   ├── OpenSearchClient.php
│   ├── AiClient.php
│   ├── index.php
│   └── schema.sql
├── ai_service/        # سرویس هوش مصنوعی Python
│   └── main.py
└── README.md
```

## نصب و راه‌اندازی

### پیش‌نیازها

- PHP 8.3+
- Node.js 18+
- Python 3.10+
- PostgreSQL 15+
- Redis 7+
- OpenSearch 2+

### 1. راه‌اندازی پایگاه داده

```bash
# ایجاد پایگاه داده
createdb bsearch_db

# اجرای اسکیما
psql -d bsearch_db -f backend/schema.sql
```

### 2. راه‌اندازی Backend

```bash
cd backend

# ایجاد پوشه لاگ
mkdir -p logs

# تنظیم فایل config.php
# ویرایش مقادیر database، redis، opensearch

# شروع سرور PHP
php -S localhost:8000
```

### 3. راه‌اندازی Frontend

```bash
cd frontend

# نصب وابستگی‌ها
npm install

# شروع توسعه
npm run dev
```

### 4. راه‌اندازی AI Service

```bash
cd ai_service

# نصب وابستگی‌ها
pip install fastapi uvicorn transformers torch langchain

# شروع سرویس
uvicorn main:app --host 0.0.0.0 --port 8001
```

## API Endpoints

### جستجو

- `GET /api/search?q=query` - جستجوی اصلی
- `GET /api/search/suggest?q=query` - پیشنهادات جستجو
- `GET /api/search/advanced` - جستجوی پیشرفته

### سئو

- `POST /api/seo/analyze` - تحلیل سئو صفحه
- `POST /api/seo/generate` - تولید محتوای سئو
- `POST /api/seo/titles` - پیشنهاد عنوان
- `POST /api/seo/meta-description` - تولید متا دیسکریپشن
- `POST /api/seo/schema` - تولید اسکیما

### سلامت

- `GET /api/health` - بررسی سلامت سیستم

## ویژگی‌ها

✅ جستجوی وب، تصاویر، ویدیوها، اخبار
✅ پاسخ هوش مصنوعی (AI Answer)
✅ تصحیح املایی فارسی
✅ تشخیص نیت کاربر
✅ تحلیلگر سئو خودکار
✅ تولید محتوای سئو با AI
✅ Dark/Light Mode
✅ پشتیبانی کامل RTL
✅ طراحی Responsive
✅ Rate Limiting
✅ کشینگ با Redis
✅ امنیت کامل (CSRF, XSS, SQL Injection Protection)

## پیکربندی

فایل `backend/config.php` را برای تنظیم موارد زیر ویرایش کنید:

- اطلاعات پایگاه داده
- تنظیمات Redis
- تنظیمات OpenSearch
- URL سرویس AI
- کلیدهای امنیتی

## مجوز

MIT License
