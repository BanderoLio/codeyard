## Backend Setup

- Python 3.10+
- Django 5.2.8
- Django REST Framework 3.15.2
- PostgreSQL recommended (SQLite for development)
- Redis for caching (required for multiple instances)

## Docker Deployment (Recommended)

### Prerequisites

- Docker and Docker Compose installed
- Docker network and volume created

### Quick Start

**Step 1: Create Docker Network and Volume**

```bash
docker network create web_network
docker volume create django_static
docker volume create django_media
```

**Step 2: Configure Environment**

Copy the example environment file and configure it:

```bash
cd backend
cp env.example .env
# Edit .env with your settings
```

For production, use `env.production.example`:

```bash
cp env.production.example .env
# Edit .env with production settings
```

**Step 3: Start Backend Services**

```bash
cd backend
docker compose up -d --build
```

This will start:

- PostgreSQL database
- Redis cache
- Django application (with Gunicorn)

**Step 4: Run Migrations**

```bash
docker compose exec web python manage.py migrate
docker compose exec web python manage.py createsuperuser
docker compose exec web python manage.py collectstatic --noinput
```

**Step 5: View Logs**

```bash
docker compose logs -f web
```

### Docker Services

- **db**: PostgreSQL 16 database
- **redis**: Redis 7 cache server
- **web**: Django application with Gunicorn

### Environment Variables for Docker

See `env.example` for development and `env.production.example` for production.

Key variables:

- `DJANGO_DB_HOST=db` (Docker service name)
- `DJANGO_CACHE_LOCATION=redis://redis:6379/1` (Docker service name)
- `DJANGO_DB_ENGINE=django.db.backends.postgresql`

### Docker Volumes

- `postgres_data`: PostgreSQL data persistence
- `redis_data`: Redis data persistence
- `django_static`: Static files (shared with frontend)
- `django_media`: Media files (shared with frontend)

### Manual Setup (Without Docker)

### Install dependencies

```bash
cd /home/milofon/progr_2_0/py_rpm/pr/codeyard
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r backend/requirements.txt
```

### Environment Configuration

Create `.env` file in the `backend` directory. Use `env.example` as a template:

**Development (Local):**

```env
# Security
DJANGO_SECRET_KEY=your-secret-key-change-in-production
DJANGO_DEBUG=true
# Allow LAN access: set to true to enable access from any IP in local network
# When enabled, ALLOWED_HOSTS, CSRF_TRUSTED_ORIGINS, and CORS will allow all hosts
DJANGO_ALLOW_LAN_ACCESS=true
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0
DJANGO_CSRF_TRUSTED_ORIGINS=http://localhost:8000,http://localhost:3000

# Database (SQLite for local development)
DJANGO_DB_ENGINE=django.db.backends.sqlite3
DJANGO_DB_NAME=db.sqlite3
DJANGO_DB_USER=
DJANGO_DB_PASSWORD=
DJANGO_DB_HOST=
DJANGO_DB_PORT=

# Cache (Redis for local development)
DJANGO_CACHE_BACKEND=django_redis.cache.RedisCache
DJANGO_CACHE_LOCATION=redis://127.0.0.1:6379/1

# Security Cookies
DJANGO_SECURE_COOKIES=false
DJANGO_REFRESH_COOKIE_SAMESITE=Lax

# CORS
DJANGO_CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

**Docker (Development/Production):**
See `env.example` for Docker development setup or `env.production.example` for production.

Key differences for Docker:

- `DJANGO_DB_HOST=db` (Docker service name)
- `DJANGO_CACHE_LOCATION=redis://redis:6379/1` (Docker service name)
- `DJANGO_DB_ENGINE=django.db.backends.postgresql`

### Database Setup

```bash
cd backend
python manage.py migrate
python manage.py createsuperuser
```

### Running the Development Server

```bash
cd backend
python manage.py runserver 0.0.0.0:8000
```

Server will be available at `http://localhost:8000`

### Running Tests

```bash
# Run all tests with coverage
python manage.py test --verbosity 2

# Run specific app tests
python manage.py test catalog
python manage.py test accounts

# Run tests with coverage report
pip install coverage
coverage run --source='.' manage.py test
coverage report
coverage html  # Generate HTML report
```

### API Documentation

- **Swagger UI**: `http://localhost:8000/api/docs/`
- **ReDoc**: `http://localhost:8000/api/redoc/`
- **OpenAPI Schema**: `http://localhost:8000/api/schema/`

### API Endpoints

#### Authentication

- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login (returns access token, refresh token in cookie)
- `POST /api/auth/refresh/` - Refresh access token
- `GET /api/auth/me/` - Get current user info
- `POST /api/auth/logout/` - Logout user

#### Tasks

- `GET /api/tasks/` - List tasks (paginated, with filters)
- `POST /api/tasks/` - Create task (authenticated only)
- `GET /api/tasks/{id}/` - Get task details
- `PATCH /api/tasks/{id}/` - Update task (owner only)
- `DELETE /api/tasks/{id}/` - Delete task (owner only)

#### Solutions

- `GET /api/solutions/` - List solutions (public/own)
- `POST /api/solutions/` - Create solution
- `GET /api/solutions/{id}/` - Get solution details
- `PATCH /api/solutions/{id}/` - Update solution (owner only)
- `DELETE /api/solutions/{id}/` - Delete solution (owner only)
- `POST /api/solutions/{id}/publish/` - Publish/unpublish solution

#### Reviews

- `GET /api/reviews/` - List reviews
- `POST /api/reviews/` - Create/update review

#### References

- `GET /api/categories/` - List categories (cached 1 hour)
- `GET /api/difficulties/` - List difficulties (cached 1 hour)
- `GET /api/languages/` - List languages (cached 1 hour)

### Architecture

#### Project Structure

```
backend/
├── backend/              # Django project settings
│   ├── settings.py      # Project configuration
│   ├── urls.py          # Root URL configuration
│   ├── wsgi.py          # WSGI application
│   └── asgi.py          # ASGI application
├── catalog/             # Main application (tasks, solutions, reviews)
│   ├── models.py        # Database models
│   ├── serializers.py   # DRF serializers
│   ├── services.py      # Business logic
│   ├── views.py         # API ViewSets
│   ├── filters.py       # Query filters
│   ├── validators.py    # Field validators
│   ├── tests.py         # API tests
│   ├── test_services.py # Service unit tests
│   └── test_api.py      # Integration tests
├── accounts/            # Authentication app
│   ├── models.py        # User model (extended)
│   ├── serializers.py   # User serializers
│   ├── authentication.py # Auth views
│   ├── urls.py          # Auth URLs
│   └── tests.py         # Auth tests
├── common/              # Shared utilities
│   ├── models.py        # Base models (TimeStampedMixin)
│   ├── permissions.py   # Custom permissions
│   ├── mixins.py        # View mixins
│   ├── exception_handlers.py # Error handling
│   ├── cache_utils.py   # Caching utilities
│   ├── schema_examples.py # API documentation examples
│   └── services.py      # Shared services
├── requirements.txt     # Python dependencies
└── README.md           # This file
```

#### Key Design Patterns

1. **Separation of Concerns**: Business logic in services, API views handle HTTP
2. **Custom Permissions**: `IsOwnerOrReadOnly` for resource ownership
3. **Transaction Management**: Atomic operations for multi-step processes
4. **Rate Limiting**:
   - Login: 5 attempts/minute
   - Register: 3 attempts/minute
   - Token refresh: 10 attempts/minute
   - CRUD operations: 100 requests/minute

#### Security Features

- **Authentication**: JWT tokens with access/refresh separation
- **Authorization**: Role-based and ownership-based permissions
- **Rate Limiting**: Protects against brute force and DDoS
- **Input Validation**: XSS protection, field length validation
- **CORS**: Configurable cross-origin access
- **CSRF**: Token-based protection
- **Secure Cookies**: HttpOnly, Secure, SameSite attributes

#### Performance Features

- **Database Optimization**:
  - Composite indexes for common queries
  - `select_related` and `prefetch_related` for N+1 prevention
  - Efficient pagination (default 20 items/page)
- **Caching**:
  - Redis-based caching (supports multiple server instances)
  - Reference data (categories, difficulties, languages): 1 hour
  - Task lists: 5 minutes
  - Automatic cache invalidation on data changes via Django signals
  - Cache versioning for efficient invalidation

#### Database Models

```
User (Django built-in)

Category
├── name: CharField(unique)
└── description: TextField

Difficulty
└── name: CharField(unique)

ProgrammingLanguage
└── name: CharField(unique)

ProgrammingTask
├── name: CharField
├── description: TextField
├── resource: URLField (optional)
├── difficulty: ForeignKey(Difficulty)
├── category: ForeignKey(Category)
├── added_by: ForeignKey(User)
├── status: CharField(choices: PRIVATE, PUBLIC, HIDDEN)
└── Unique constraint: (name, added_by)

Solution
├── task: ForeignKey(ProgrammingTask)
├── code: TextField
├── language: ForeignKey(ProgrammingLanguage)
├── explanation: TextField (optional)
├── user: ForeignKey(User)
├── is_public: BooleanField
└── published_at: DateTimeField (optional)

Review
├── solution: ForeignKey(Solution)
├── added_by: ForeignKey(User)
├── review_type: IntegerField(choices: NEGATIVE=0, POSITIVE=1)
└── Unique constraint: (solution, added_by)
```

### Type Checking

```bash
pip install mypy django-stubs
mypy backend --ignore-missing-imports
```

### Code Quality

The codebase follows these standards:

- **PEP 8**: Line length max 79 characters
- **Type Hints**: All functions have type annotations
- **Docstrings**: All public classes/methods documented
- **Comments**: Only for complex logic (avoid obvious comments)

### Production Deployment

Before deploying to production:

1. Set `DJANGO_DEBUG=false`
2. Generate a strong `DJANGO_SECRET_KEY`
3. Set `DJANGO_SECURE_COOKIES=true` (requires HTTPS)
4. Configure PostgreSQL or other production database
5. Set up Redis for caching (required for multiple instances)
6. Use gunicorn or similar WSGI server
7. Set up proper logging
8. Run `python manage.py collectstatic`

Example gunicorn command:

```bash
gunicorn backend.wsgi:application --bind 0.0.0.0:8000 --workers 4 --timeout 60
```

### Troubleshooting

**Import errors after installing packages**:

```bash
pip install -r requirements.txt --force-reinstall
```

**Database migration issues**:

```bash
python manage.py makemigrations
python manage.py migrate --fake-initial
```

**Cache issues**:

```bash
# For file-based cache (development only):
rm -rf cache-data/
mkdir cache-data/

# For Redis cache:
redis-cli FLUSHDB  # Clear Redis database (use with caution!)
```

### Contributing

When adding new features:

1. Create business logic in `services.py`
2. Add serializers for validation
3. Implement ViewSets for API
4. Add comprehensive tests (aim for 80%+ coverage)
5. Update this README with new endpoints/features
6. Ensure code passes `mypy` type checking

- `POST /api/auth/refresh/` refresh via cookie
- `POST /api/auth/logout/` clears cookie

### Features

- CRUD for categories/difficulties/languages/tasks/solutions with filtering/search
- Publish endpoint `POST /api/solutions/<id>/publish/`
- Reviews `/api/reviews/` (one review per solution per user)
- JWT auth with SimpleJWT + rate limiting, CORS, CSRF protections
- drf-spectacular docs, business logic in `catalog/services.py`
- Tests in `catalog/tests.py` (`python manage.py test`)
