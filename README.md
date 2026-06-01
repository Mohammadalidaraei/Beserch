# BSearch - موتور جستجوی ایرانی

## تکنولوژی‌ها

- **Frontend**: HTML5, CSS3, JavaScript ES6+ (خالص - بدون فریم‌ورک)
- **Backend**: PHP 8.3 (خالص - بدون فریم‌ورک)
- **AI Service**: Python 3.11 + FastAPI
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Search Engine**: OpenSearch 2.x
- **Infrastructure**: Docker, Nginx

## ساختار پروژه

```
/workspace
├── frontend/           # JavaScript خالص
│   ├── index.html      # صفحه اصلی
│   ├── search.html     # نتایج جستجو
│   ├── images.html     # جستجوی تصاویر
│   ├── videos.html     # جستجوی ویدیوها
│   ├── ai-search.html  # جستجوی هوش مصنوعی
│   ├── webmaster.html  # پنل وبمستر
│   ├── seo-tool.html   # ابزار سئو
│   ├── admin.html      # پنل ادمین
│   ├── css/
│   │   └── style.css   # استایل‌ها
│   └── js/
│       ├── app.js      # منطق اصلی
│       ├── search.js   # جستجو
│       ├── api.js      # ارتباط با API
│       └── utils.js    # توابع کمکی
│
├── backend/            # PHP خام
│   ├── public/
│   │   └── index.php   # نقطه ورود API
│   ├── src/
│   │   ├── Config.php
│   │   ├── Database.php
│   │   ├── Router.php
│   │   ├── Request.php
│   │   ├── Response.php
│   │   ├── Auth.php
│   │   ├── Middleware/
│   │   ├── Controllers/
│   │   ├── Models/
│   │   ├── Services/
│   │   └── Helpers/
│   └── config/
│       └── config.php
│
├── ai_service/         # Python
│   ├── main.py
│   ├── search_engine.py
│   ├── nlp_processor.py
│   ├── ranking.py
│   └── requirements.txt
│
├── docker-compose.yml
└── docs/
    ├── architecture.md
    └── api.md
```

## راه‌اندازی

```bash
docker-compose up -d
```

## دسترسی‌ها

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- AI Service: http://localhost:8001
