# 🌊 DigitalOcean Deployment Guide

## 🚀 Option 1: DigitalOcean App Platform (Recommended - Easiest)

### Step 1: Prepare Your Repository

1. **Push your code to GitHub/GitLab** (App Platform deploys from Git)
2. **Create a `app.yaml` file** in your project root:

```yaml
name: gains-trust
services:
  - name: backend
    source_dir: /Gains_Trust
    github:
      repo: your-username/Gains_Trust_Unchained
      branch: main
    run_command: gunicorn --worker-tmp-dir /dev/shm Gains_Trust.wsgi:application
    environment_slug: python
    instance_count: 1
    instance_size_slug: basic-xxs
    routes:
      - path: /api
      - path: /admin
      - path: /static
    envs:
      - key: DEBUG
        value: "False"
      - key: SECRET_KEY
        value: "your-secret-key-here"
        type: SECRET
      - key: ALLOWED_HOSTS
        value: "your-app.ondigitalocean.app"
      - key: DATABASE_URL
        value: "${db.DATABASE_URL}"
      - key: EMAIL_HOST_USER
        value: "your-email@gmail.com"
        type: SECRET
      - key: EMAIL_HOST_PASSWORD
        value: "your-app-password"
        type: SECRET

  - name: frontend
    source_dir: /frontend
    github:
      repo: your-username/Gains_Trust_Unchained
      branch: main
    build_command: npm run build
    run_command: npx serve -s build -l ${PORT}
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
    routes:
      - path: /
    envs:
      - key: REACT_APP_API_BASE_URL
        value: "https://your-app.ondigitalocean.app"

databases:
  - name: db
    engine: PG
    version: "13"
    size: basic-xs
```

### Step 2: Setup Environment Variables in App Platform

**Instead of `.env` files, set these in the DigitalOcean App Platform dashboard:**

**Backend Environment Variables:**
```
DEBUG=False
SECRET_KEY=your-64-character-secret-key
ALLOWED_HOSTS=your-app.ondigitalocean.app
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-16-char-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
DEFAULT_FROM_EMAIL=your-email@gmail.com
PASSWORD_RESET_TIMEOUT=3600
```

**Frontend Environment Variables:**
```
REACT_APP_API_BASE_URL=https://your-app.ondigitalocean.app
```

### Step 3: Database Setup

App Platform will create PostgreSQL database automatically. You'll need to:

1. **Update Django settings for DATABASE_URL**:

```python
# Add this to settings.py
import dj_database_url

# Use DATABASE_URL if available (App Platform provides this)
if 'DATABASE_URL' in os.environ:
    DATABASES = {
        'default': dj_database_url.parse(os.environ.get('DATABASE_URL'))
    }
```

2. **Add to requirements.txt**:
```
dj-database-url==1.3.0
```

### Step 4: Deploy

1. **Connect your GitHub repo to DigitalOcean App Platform**
2. **Upload the `app.yaml` file**
3. **Set environment variables in the dashboard**
4. **Deploy!**

---

## 🖥️ Option 2: DigitalOcean Droplet (More Control)

### Step 1: Create Droplet

1. **Create Ubuntu 22.04 Droplet** (2GB RAM minimum)
2. **Add your SSH key**
3. **Connect via SSH**

### Step 2: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y python3 python3-pip python3-venv nginx postgresql postgresql-contrib supervisor curl

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Create app user
sudo adduser --system --group --home /home/gains gains
```

### Step 3: Database Setup

```bash
# Setup PostgreSQL
sudo -u postgres createuser gains
sudo -u postgres createdb gains_trust
sudo -u postgres psql -c "ALTER USER gains PASSWORD 'your-secure-password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE gains_trust TO gains;"
```

### Step 4: Application Setup

```bash
# Clone repository
sudo -u gains git clone https://github.com/your-username/Gains_Trust_Unchained.git /home/gains/app
cd /home/gains/app

# Backend setup
cd Gains_Trust
sudo -u gains python3 -m venv venv
sudo -u gains venv/bin/pip install -r requirements.txt
sudo -u gains venv/bin/pip install gunicorn

# Create environment file
sudo -u gains tee /home/gains/app/Gains_Trust/.env << EOF
DEBUG=False
SECRET_KEY=your-64-character-secret-key
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
DATABASE_NAME=gains_trust
DATABASE_USER=gains
DATABASE_PASSWORD=your-secure-password
DATABASE_HOST=localhost
DATABASE_PORT=5432
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
DEFAULT_FROM_EMAIL=your-email@gmail.com
PASSWORD_RESET_TIMEOUT=3600
EOF

# Run migrations
sudo -u gains venv/bin/python manage.py migrate
sudo -u gains venv/bin/python manage.py collectstatic --noinput

# Frontend setup
cd ../frontend
sudo -u gains npm install
sudo -u gains npm run build
```

### Step 5: Configure Services

**Gunicorn Service** (`/etc/supervisor/conf.d/gains-backend.conf`):
```ini
[program:gains-backend]
command=/home/gains/app/Gains_Trust/venv/bin/gunicorn --workers 3 --bind 127.0.0.1:8000 Gains_Trust.wsgi:application
directory=/home/gains/app/Gains_Trust
user=gains
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/gains-backend.log
```

**Nginx Configuration** (`/etc/nginx/sites-available/gains`):
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL configuration (use Certbot for free SSL)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # Frontend (React build)
    location / {
        root /home/gains/app/frontend/build;
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
    
    # Django Admin
    location /admin/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static files
    location /static/ {
        alias /home/gains/app/Gains_Trust/staticfiles/;
    }
}
```

### Step 6: SSL Certificate

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### Step 7: Start Services

```bash
# Enable and start services
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start gains-backend

sudo ln -s /etc/nginx/sites-available/gains /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Enable automatic startup
sudo systemctl enable supervisor
sudo systemctl enable nginx
```

---

## ✅ Pre-Deployment Checklist

### 1. Generate Secure SECRET_KEY
```python
import secrets
print(secrets.token_urlsafe(64))
```

### 2. Update CORS Settings for Production
In `settings.py`, update:
```python
CORS_ALLOWED_ORIGINS = [
    "https://your-domain.com",
    "https://www.your-domain.com",
]
```

### 3. Email Setup
- Create Gmail App Password (not your regular password)
- Test email functionality

### 4. Domain Configuration
- Point your domain to DigitalOcean IP
- Configure DNS A records

---

## 🚨 Key Differences for DigitalOcean:

### ❌ **DON'T create .env files manually**
- App Platform: Use environment variables in dashboard
- Droplet: Create .env during setup script

### ✅ **DO set environment variables in:**
- **App Platform**: Dashboard → Settings → Environment Variables
- **Droplet**: Create `/home/gains/app/Gains_Trust/.env` file

### 🔧 **Additional Requirements:**
```bash
# Add to requirements.txt for App Platform
dj-database-url==1.3.0
gunicorn==21.2.0
```

### 🌐 **Frontend/Backend Communication:**
- Both will be served from the same domain
- Frontend build is served as static files
- API requests go to `/api/` paths
- No CORS issues since same-origin

---

## 💡 Recommendations:

1. **Start with App Platform** - Much easier, handles scaling automatically
2. **Use Droplet** if you need more control or custom configurations
3. **Setup monitoring** with DigitalOcean's built-in tools
4. **Regular backups** - App Platform does this automatically
5. **Use CDN** for static files (optional but recommended)

Your app is production-ready! 🚀 