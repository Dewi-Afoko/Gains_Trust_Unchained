# 🚀 Single Service Deployment Guide

## ✅ **What We've Done:**

1. **✅ Built React Frontend:** `npm run build` created static files
2. **✅ Configured Django:** To serve React build files at root `/`
3. **✅ Updated URLs:** All non-API routes serve React app
4. **✅ Static Files:** Configured to serve React assets

## 🎯 **DigitalOcean Deployment:**

### **Step 1: Use Auto-Detection**
1. Go to [DigitalOcean Apps](https://cloud.digitalocean.com/apps)
2. **Create App** → **GitHub** → Select `Gains_Trust_Unchained` → `Live` branch
3. **Click "Next"** - Let it auto-detect as Python app

### **Step 2: Configure the Single Service**
DigitalOcean should detect:
- **Source Directory:** `Gains_Trust` 
- **Environment:** Python
- **Build Command:** (leave empty)
- **Run Command:** `gunicorn --worker-tmp-dir /dev/shm Gains_Trust.wsgi:application`

### **Step 3: Add Environment Variables**
In the DigitalOcean UI, add:

```env
DEBUG=False
SECRET_KEY=your-64-character-secret-key
ALLOWED_HOSTS=*.ondigitalocean.app
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-16-char-app-password
DEFAULT_FROM_EMAIL=your-email@gmail.com
PASSWORD_RESET_TIMEOUT=3600
```

**Generate SECRET_KEY:**
```python
import secrets
print(secrets.token_urlsafe(64))
```

### **Step 4: Add Database**
- Click **"Add Database"** 
- Select **PostgreSQL**
- DigitalOcean will automatically set `DATABASE_URL`

## 🌐 **How It Works:**

- **Frontend:** `https://your-app.ondigitalocean.app/` → React app
- **API:** `https://your-app.ondigitalocean.app/api/` → Django API  
- **Admin:** `https://your-app.ondigitalocean.app/admin/` → Django admin

## ✅ **Benefits of Single Service:**

- ✅ **Simpler deployment** - One service instead of two
- ✅ **No CORS issues** - Same domain for frontend/backend
- ✅ **Cheaper** - Only one app instance
- ✅ **Auto-detection works** - No complex YAML needed

## 🎯 **Ready to Deploy!**

Just push your changes and follow the steps above. Much simpler than the two-service approach!

**Your app structure:**
```
Single Django Service
├── Serves React build files at /
├── API endpoints at /api/
├── Django admin at /admin/
└── All static files properly served
``` 