# 🚀 Production Deployment Guide

This guide provides step-by-step instructions for deploying Gains Trust to production.

## 📋 Pre-Deployment Checklist

### ✅ Security Configuration Complete
- [x] Django SECRET_KEY uses environment variable
- [x] DEBUG set to False by default
- [x] ALLOWED_HOSTS configured for production domains
- [x] HTTPS security headers enabled
- [x] CORS properly configured
- [x] Debug code removed from codebase

### ✅ Production Features Ready
- [x] Database migrations applied
- [x] Static files configured
- [x] Email system configured
- [x] JWT authentication working
- [x] Password reset functionality
- [x] Comprehensive test coverage (97%)

## 🔧 Environment Configuration

### 1. Backend Environment Variables (.env)

Create a `.env` file in the `Gains_Trust/` directory:

```env
# ======================
# DJANGO SETTINGS
# ======================
DEBUG=False
SECRET_KEY=your-super-secret-production-key-min-50-characters-long
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,api.yourdomain.com

# ======================
# DATABASE CONFIGURATION
# ======================
DATABASE_NAME=gains_trust_production
DATABASE_USER=your_db_user
DATABASE_PASSWORD=your_secure_db_password
DATABASE_HOST=localhost
DATABASE_PORT=5432

# ======================
# EMAIL CONFIGURATION
# ======================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-16-character-app-password
DEFAULT_FROM_EMAIL=your-email@gmail.com

# ======================
# SECURITY SETTINGS
# ======================
PASSWORD_RESET_TIMEOUT=3600
```

### 2. Frontend Environment Variables

**Optional:** Create a `frontend/.env` file if you want to override the default:

```env
# Development (defaults to this if not set)
REACT_APP_API_BASE_URL=http://localhost:8000

# Production
REACT_APP_API_BASE_URL=https://api.yourdomain.com
```

**Note:** The frontend now has fallback defaults, so this file is optional for development.

## 🛠 Deployment Steps

### 1. Generate Secure SECRET_KEY

```python
# Run this in Python to generate a secure key
import secrets
print(secrets.token_urlsafe(64))
```

### 2. Database Setup

```bash
# Create production database
createdb gains_trust_production

# Run migrations
cd Gains_Trust
python manage.py migrate
python manage.py collectstatic --noinput
```

### 3. Frontend Build

```bash
cd frontend
npm install
npm run build
```

### 4. Update CORS Settings

In `settings.py`, update the production CORS settings:

```python
CORS_ALLOWED_ORIGINS = [
    "https://yourdomain.com",
    "https://www.yourdomain.com",
]
```

## 🌐 Server Configuration

### Nginx Configuration Example

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # Frontend (React build)
    location / {
        root /path/to/frontend/build;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static files
    location /static/ {
        alias /path/to/Gains_Trust/staticfiles/;
    }
}
```

### Gunicorn Configuration

```bash
# Install Gunicorn
pip install gunicorn

# Run with Gunicorn
gunicorn --bind 127.0.0.1:8000 Gains_Trust.wsgi:application
```

## 🔒 Security Checklist

### SSL/HTTPS Setup
- [ ] SSL certificate installed
- [ ] HTTP redirects to HTTPS
- [ ] HSTS headers configured
- [ ] Secure cookies enabled

### Database Security
- [ ] Database user has minimal required permissions
- [ ] Database password is strong and unique
- [ ] Database access restricted by IP if possible

### Application Security
- [ ] All secret keys are unique and secure
- [ ] Debug mode disabled
- [ ] Error pages don't reveal sensitive information
- [ ] Static files served securely

## 📊 Monitoring & Maintenance

### Health Checks

```bash
# Test API endpoints
curl https://api.yourdomain.com/health/
curl https://api.yourdomain.com/api/users/check-availability/?username=test

# Check database connections
python manage.py dbshell
```

### Log Monitoring

Logs are stored in:
- Application logs: `Gains_Trust/gains_trust.log`
- Server logs: Check your server's log directory
- Database logs: Check PostgreSQL logs

### Backup Strategy

```bash
# Database backup
pg_dump gains_trust_production > backup_$(date +%Y%m%d).sql

# Application backup
tar -czf app_backup_$(date +%Y%m%d).tar.gz /path/to/Gains_Trust/
```

## 🚨 Troubleshooting

### Common Issues

1. **Static files not loading**: Run `python manage.py collectstatic`
2. **CORS errors**: Check CORS_ALLOWED_ORIGINS in settings
3. **Database connection issues**: Verify DATABASE_* environment variables
4. **Email not sending**: Check EMAIL_HOST_* credentials

### Performance Optimization

1. **Enable database connection pooling**
2. **Use Redis for caching** (optional)
3. **Configure CDN for static files** (optional)
4. **Enable Gzip compression**

## 📞 Support

For deployment issues:
1. Check application logs first
2. Verify all environment variables are set
3. Ensure database migrations are applied
4. Test API endpoints individually

---

**✅ Your application is now production-ready!**

The codebase includes:
- Comprehensive security configurations
- Environment-based settings
- Proper error handling
- 97% test coverage
- Production logging
- Clean, debug-free code 