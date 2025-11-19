## Backend Setup

- Python 3.13+
- Optional PostgreSQL (SQLite used by default)

### Install dependencies

```
cd /home/mastard/WebProjects/codeyard
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

### Environment

Create `.env` next to this README:

```
DJANGO_SECRET_KEY=change-me
DJANGO_DEBUG=true
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
DJANGO_CSRF_TRUSTED_ORIGINS=http://localhost:8000
DJANGO_CORS_ALLOWED_ORIGINS=http://localhost:3000
DJANGO_DB_ENGINE=django.db.backends.sqlite3
DJANGO_DB_NAME=/home/mastard/WebProjects/codeyard/backend/db.sqlite3
DJANGO_DB_USER=
DJANGO_DB_PASSWORD=
DJANGO_DB_HOST=
DJANGO_DB_PORT=
DJANGO_SECURE_COOKIES=false
DJANGO_REFRESH_COOKIE_SAMESITE=Lax
DJANGO_CACHE_BACKEND=django.core.cache.backends.filebased.FileBasedCache
DJANGO_CACHE_LOCATION=/home/mastard/WebProjects/codeyard/backend/cache-data
```

### Run migrations & dev server

```
cd backend
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000
```

### URLs

- `GET /api/` core API
- `GET /api/docs/` Swagger
- `POST /api/auth/login/` JWT access + refresh (refresh in HttpOnly cookie)
- `POST /api/auth/refresh/` refresh via cookie
- `POST /api/auth/logout/` clears cookie

### Features

- CRUD for categories/difficulties/languages/tasks/solutions with filtering/search
- Publish endpoint `POST /api/solutions/<id>/publish/`
- Reviews `/api/reviews/` (one review per solution per user)
- JWT auth with SimpleJWT + rate limiting, CORS, CSRF protections
- drf-spectacular docs, business logic in `catalog/services.py`
- Tests in `catalog/tests.py` (`python manage.py test`)
