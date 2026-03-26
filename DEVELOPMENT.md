# LifeManager Development Guide

## Quick Reference

This guide helps you understand and work with the LifeManager codebase.

## Architecture Overview

### Backend (Django REST)

**Key Files:**
- `lifemanager/settings.py` — Django configuration (database, apps, middleware)
- `lifemanager/urls.py` — URL routing to app endpoints
- `lifemanager/asgi.py` — WebSocket configuration
- `apps/*/models.py` — Database models
- `apps/*/serializers.py` — API request/response validation
- `apps/*/views.py` — API business logic
- `apps/*/urls.py` — App-specific routes

**Adding a New Feature:**
1. Create model in `apps/xyz/models.py`
2. Create serializer in `apps/xyz/serializers.py`
3. Create viewset in `apps/xyz/views.py`
4. Add router to `apps/xyz/urls.py`
5. Include in main `lifemanager/urls.py`
6. Run `python manage.py makemigrations` & `migrate`

### Frontend (Next.js)

**Key Files:**
- `src/app/layout.tsx` — Root layout
- `src/app/page.tsx` — Landing page
- `src/lib/api.ts` — API client (Axios instance with JWT handling)
- `src/lib/websocket.ts` — WebSocket manager
- `src/hooks/useAuth.ts` — Auth store (Zustand)

**Adding a New Page:**
1. Create `src/app/newfeature/page.tsx`
2. Use `useLoadUser()` to ensure auth
3. Use `apiClient.getXyz()` to fetch data
4. Create UI components in `src/components/xyz/`

## Common Workflows

### Running Backend Migrations
```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

### Testing Backend
```bash
cd backend
pytest                    # Run all
pytest -k task           # Run specific module
pytest --cov             # With coverage
```

### Testing Frontend
```bash
cd frontend
npm test                  # Run tests
npm run test:ui          # Open UI
```

### Adding API Client Method
Edit `frontend/src/lib/api.ts` in the `ApiClient` class:
```typescript
async getNewFeature(id: number) {
  try {
    const response = await this.instance.get(`/yourfeature/${id}/`);
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
}
```

### Creating a New Django App
```bash
cd backend
python manage.py startapp appname apps/appname
# Add to INSTALLED_APPS in settings.py
```

### Running Celery Tasks Locally
```bash
cd backend
celery -A lifemanager worker -l info
# In another terminal for periodic tasks:
celery -A lifemanager beat -l info
```

## Database Schema

Use `python manage.py dbshell` to explore the database:
```sql
\dt              -- List tables
SELECT * FROM auth_user;  -- Check users
SELECT * FROM tasks_task;  -- Check tasks
```

## Environment Setup

**For development**, copy `.env.example` to `.env` and ensure:
- `DEBUG=True`
- `DB_*` values match docker-compose
- `CORS_ALLOWED_ORIGINS=http://localhost:3000`

**For production**, use:
- `DEBUG=False`
- Strong `DJANGO_SECRET_KEY`
- Proper `ALLOWED_HOSTS`
- Database credentials from managed service
- S3 bucket for storage
- Email service credentials

## WebSocket Debugging

Check WebSocket connection in browser:
1. Open DevTools → Network tab
2. Filter by "WS" (WebSocket)
3. Connect to `/ws/reminders/`
4. Check frames for messages

## API Testing

Using `curl`:
```bash
# Get token
TOKEN=$(curl -X POST http://localhost:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"pass"}' | jq -r '.access')

# Use token
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/tasks/
```

Or use Postman/Insomnia and set `Authorization: Bearer {token}`

## Performance Tips

1. **Database queries**: Use `select_related()` and `prefetch_related()` in views
2. **Caching**: Redis is configured for Celery, can use for API caching
3. **Frontend**: Use Next.js image optimization, lazy load components
4. **API**: Pagination is enabled (50 items/page)

## Deployment Checklist

- [ ] Set `DEBUG=False`
- [ ] Use strong `DJANGO_SECRET_KEY`
- [ ] Configure PostgreSQL URL
- [ ] Set up Redis instance
- [ ] Configure S3 bucket
- [ ] Set email service credentials
- [ ] Run migrations on production: `python manage.py migrate`
- [ ] Create superuser: `python manage.py createsuperuser`
- [ ] Run `collectstatic` for static files
- [ ] Set up HTTPS/SSL certificate
- [ ] Configure domain DNS
- [ ] Test WebSocket connection
- [ ] Set up monitoring/logging
