# LifeManager – Your Personal Life Admin Tool

A full-stack web application to manage tasks, finances, documents, reminders, and notes—all in one place.

## Features

### Core Modules (MVP)
- **Tasks** — To-do items with due dates, priorities, and categories
- **Finances** — Monthly budget tracker with income vs. expense tracking
- **Documents** — Upload and tag important files (S3 or local storage)
- **Reminders** — Date-based reminders with email notifications
- **Notes** — Freeform markdown notes with tagging

## Architecture

### Tech Stack

**Backend:**
- Django 4.2 + Django REST Framework
- PostgreSQL (production) / SQLite (development)
- Celery + Redis (async tasks, reminders)
- Django Channels (WebSockets for real-time reminders)
- JWT Authentication (djangorestframework-simplejwt)

**Frontend:**
- Next.js 14 (React 18, TypeScript)
- Zustand (state management)
- Axios (API client)
- Tailwind CSS + shadcn/ui
- Recharts (data visualization)
- Vitest (testing)

**Infrastructure:**
- Docker & Docker Compose (local development)
- PostgreSQL 15 (database)
- Redis 7 (cache & message broker)
- Daphne (ASGI server for WebSockets)

### Project Structure

```
LifeManager/
├── backend/                    # Django REST API
│   ├── lifemanager/           # Project settings
│   │   ├── settings.py        # Django configuration
│   │   ├── urls.py            # URL routing
│   │   ├── asgi.py            # WebSocket support
│   │   └── celery.py          # Celery configuration
│   ├── apps/                  # Django applications
│   │   ├── auth/              # User registration & authentication
│   │   ├── tasks/             # Task management
│   │   ├── finances/          # Budget & transaction tracking
│   │   ├── documents/         # File uploads & storage
│   │   ├── reminders/         # Reminder & email notifications
│   │   └── notes/             # Notes & markdown
│   ├── tests/                 # Pytest test suite
│   ├── requirements.txt        # Python dependencies
│   ├── manage.py              # Django CLI
│   ├── Dockerfile             # Backend container
│   └── pytest.ini             # Pytest configuration
│
├── frontend/                  # Next.js React app
│   ├── src/
│   │   ├── app/               # Next.js pages (App Router)
│   │   │   ├── page.tsx       # Landing page
│   │   │   ├── auth/          # Login/Register pages
│   │   │   ├── dashboard/     # Main dashboard
│   │   │   ├── tasks/         # Task pages
│   │   │   ├── finances/      # Finance pages
│   │   │   ├── documents/     # Document pages
│   │   │   ├── reminders/     # Reminder pages
│   │   │   └── notes/         # Note pages
│   │   ├── components/        # Reusable React components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utilities & helpers
│   │   │   ├── api.ts         # API client
│   │   │   └── websocket.ts   # WebSocket manager
│   │   └── styles/            # Global CSS & Tailwind
│   ├── package.json           # Dependencies
│   ├── tsconfig.json          # TypeScript config
│   ├── next.config.js         # Next.js config
│   ├── tailwind.config.js     # Tailwind config
│   ├── vitest.config.ts       # Vitest config
│   ├── Dockerfile             # Frontend container
│   └── __tests__/             # Vitest test suite
│
├── docker-compose.yml         # Development environment
├── .env.example               # Environment template
└── README.md                  # This file
```

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (or use Docker)
- Python 3.11+ (or use Docker)

### Quick Start with Docker

1. **Clone and setup:**
```bash
git clone <repo>
cd LifeManager
cp .env.example .env  # Customize if needed
```

2. **Start all services:**
```bash
docker-compose up --build
```

This will start:
- Backend API on `http://localhost:8000`
- Frontend on `http://localhost:3000`
- PostgreSQL on port 5432
- Redis on port 6379
- Celery worker for async tasks

3. **Access the app:**
- Frontend: http://localhost:3000
- API: http://localhost:8000/api
- Admin: http://localhost:8000/admin (username: admin, auto-created)

### Local Development (without Docker)

**Backend Setup:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

**Frontend Setup:**
```bash
cd frontend
npm install
npm run dev
```

**Background Tasks (Celery):**
```bash
cd backend
celery -A lifemanager worker -l info
```

## API Documentation

All endpoints require JWT authentication (Bearer token in Authorization header).

### Authentication
- `POST /api/auth/register/` — Register new user
- `POST /api/auth/token/` — Login & get JWT tokens
- `POST /api/auth/token/refresh/` — Refresh access token
- `GET /api/auth/users/me/` — Get current user profile

### Tasks
- `GET/POST /api/tasks/` — List/create tasks
- `GET/PATCH/DELETE /api/tasks/{id}/` — Task details/update/delete
- `POST /api/tasks/{id}/complete/` — Toggle task completion
- `GET /api/tasks/upcoming/` — Get upcoming tasks
- `GET /api/tasks/categories/` — Get all task categories

### Finances
- `GET/POST /api/finances/transactions/` — List/create transactions
- `GET /api/finances/transactions/summary/` — Get income/expense summary
- `GET /api/finances/transactions/by_category/` — Spending by category
- `GET/POST /api/finances/budgets/` — Manage monthly budgets

### Documents
- `GET/POST /api/documents/` — List/upload documents
- `DELETE /api/documents/{id}/` — Delete document
- `GET /api/documents/file_types/` — Get all file types
- `GET /api/documents/tags/` — Get all tags
- `GET /api/documents/{id}/download/` — Download file

### Reminders
- `GET/POST /api/reminders/` — List/create reminders
- `PATCH/DELETE /api/reminders/{id}/` — Update/delete reminder
- `GET /api/reminders/upcoming/` — Get upcoming reminders
- `POST /api/reminders/{id}/mark_as_sent/` — Mark as sent

### Notes
- `GET/POST /api/notes/` — List/create notes
- `PATCH/DELETE /api/notes/{id}/` — Update/delete note
- `GET /api/notes/tags/` — Get all tags
- `GET /api/notes/recent/` — Get recently updated notes

## WebSocket Events

Connect to `ws://localhost:8000/ws/reminders/` (with JWT token query param)

**Server → Client:**
- `reminder_notification` — New reminder triggered
- `pong` — Response to ping

**Client → Server:**
- `{ "type": "ping" }` — Keep-alive ping

## Testing

**Backend (pytest):**
```bash
cd backend
pytest                    # Run all tests
pytest --cov             # With coverage report
pytest -v                # Verbose output
```

**Frontend (Vitest):**
```bash
cd frontend
npm test                  # Run tests
npm run test:ui          # UI dashboard
npm run test:coverage    # Coverage report
```

## Environment Variables

Copy `.env.example` to `.env` and customize:

```env
# Django
DEBUG=True
DJANGO_SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=lifemanager_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=db
DB_PORT=5432

# Redis/Celery
CELERY_BROKER_URL=redis://redis:6379/0
REDIS_HOST=redis
REDIS_PORT=6379

# Storage
STORAGE_TYPE=local  # or 's3'
# AWS_STORAGE_BUCKET_NAME=...
# AWS_S3_REGION_NAME=...

# Email
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
# For production, use: django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=...
EMAIL_HOST_PASSWORD=...

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

## Database Migrations

```bash
# Create migrations for model changes
python backend/manage.py makemigrations

# Apply migrations
python backend/manage.py migrate

# Check migration status
python backend/manage.py showmigrations
```

## Deployment

### Docker Build & Push
```bash
docker build -t yourusername/lifemanager-backend ./backend
docker build -t yourusername/lifemanager-frontend ./frontend
docker push yourusername/lifemanager-backend
docker push yourusername/lifemanager-frontend
```

### Cloud Deployment (Example: DigitalOcean, Heroku, AWS)
1. Set up PostgreSQL managed database
2. Set up Redis instance
3. Configure environment variables in cloud platform
4. Deploy Docker images to container platform
5. Set up domain and SSL certificate
6. Configure S3 bucket for document storage (if using)

## Common Issues & Troubleshooting

**Database connection error?**
```bash
docker-compose down -v  # Reset volumes
docker-compose up --build
```

**Port already in use?**
```bash
docker-compose down  # Stop containers
# Or change ports in docker-compose.yml
```

**WebSocket connection failing?**
- Check Daphne is running: `docker-compose logs backend`
- Verify token is passed in connection
- Check browser console for errors

## Contributing

1. Create a feature branch: `git checkout -b feature/xyz`
2. Make changes and test: `pytest`, `npm test`
3. Commit with clear messages: `git commit -m "feat: add xyz"`
4. Push and create pull request

## License

MIT License - see LICENSE file

## Support

For issues and questions, create a GitHub issue or contact the maintainers. 