# 🚀 DigitalOcean Deployment Instructions

## 📝 **Before You Deploy:**

### 1. **Generate your SECRET_KEY:**
```python
import secrets
print(secrets.token_urlsafe(64))
```
**Copy this output - you'll need it!**

### 2. **Get Gmail App Password:**
- Go to [Google Account Settings](https://myaccount.google.com/)
- Security → 2-Step Verification → App passwords
- Generate password for "Mail"
- **Copy the 16-character code** (not your regular password)

---

## 🎯 **Deployment Steps:**

### **Step 1: Create App from GitHub**
1. Go to [DigitalOcean Apps](https://cloud.digitalocean.com/apps)
2. Click **"Create App"**
3. Choose **"GitHub"** as source
4. Select your **`Gains_Trust_Unchained`** repository
5. Select **`Live`** branch
6. Click **"Next"**

### **Step 2: Import App Spec**
1. Click **"Edit Your App Spec"**
2. **Delete all existing configuration**
3. **Copy and paste the entire contents of `app.yaml`**
4. **Update these placeholders in the spec:**
   ```yaml
   repo: YOUR-GITHUB-USERNAME/Gains_Trust_Unchained  # Replace with your username
   SECRET_KEY: "YOUR-64-CHAR-SECRET-KEY"              # Use generated key
   EMAIL_HOST_USER: "your-email@gmail.com"           # Your Gmail
   EMAIL_HOST_PASSWORD: "your-16-char-app-password"  # Gmail app password
   DEFAULT_FROM_EMAIL: "your-email@gmail.com"        # Same as above
   ```

### **Step 3: Review Configuration**
Verify you see:
- ✅ **2 Services**: `backend` (Python) and `frontend` (Node.js)
- ✅ **1 Database**: PostgreSQL 
- ✅ **Environment Variables**: All secrets filled in

### **Step 4: Deploy**
1. Click **"Next"** → **"Next"** → **"Create Resources"**
2. **Wait 5-10 minutes** for deployment
3. Watch the build logs for any errors

---

## 🔍 **What to Expect:**

### **Build Process:**
```
✅ Clone repository from Live branch
✅ Build backend (Python/Django)
✅ Build frontend (Node.js/React)
✅ Create PostgreSQL database
✅ Run migrations
✅ Deploy services
```

### **Final Result:**
- **App URL**: `https://your-app-name.ondigitalocean.app`
- **Frontend**: Serves at root `/`
- **Backend API**: Available at `/api/`
- **Django Admin**: Available at `/admin/`

---

## 🚨 **Troubleshooting:**

### **Common Issues:**

1. **Build fails on "package-lock.json"**
   - ✅ **Fixed**: Using separate source directories

2. **Database connection errors**
   - ✅ **Fixed**: Using `${db.DATABASE_URL}` 

3. **Environment variable issues**
   - Make sure all placeholders are replaced with real values

### **Testing Your Deployment:**

Once deployed, test these URLs:
```bash
# Frontend
https://your-app.ondigitalocean.app/

# Backend API health
https://your-app.ondigitalocean.app/api/

# Django Admin
https://your-app.ondigitalocean.app/admin/

# Password reset API
https://your-app.ondigitalocean.app/api/password-reset/request/
```

---

## 📞 **Need Help?**

If deployment fails:
1. **Check build logs** in DigitalOcean dashboard
2. **Verify all placeholders** in app.yaml are replaced
3. **Ensure secrets are marked as "SECRET" type**
4. **Check that Live branch** has latest code

Your app is ready to deploy! 🎉 