# KulturaMind - Quick Deployment Guide

## 🚀 Deploy to PythonAnywhere in 5 Minutes

### Step 1: Create Account
- Go to https://www.pythonanywhere.com
- Sign up (free account available)

### Step 2: Open Bash Console
- Click **Bash console** from dashboard

### Step 3: Run Setup Script
```bash
cd ~
git clone https://github.com/yuguda0/KulturaMind.git
cd KulturaMind/backend
bash pythonanywhere_setup.sh
```

### Step 4: Configure Web App
1. Go to **Web** tab
2. Click **Add a new web app**
3. Choose **Manual configuration** → **Python 3.10**
4. In WSGI file, replace content with:
```python
import sys
import os
path = '/home/YOUR_USERNAME/KulturaMind/backend'
if path not in sys.path:
    sys.path.insert(0, path)
from api import app
application = app
```
5. Set Virtualenv: `/home/YOUR_USERNAME/.virtualenvs/kulturamind`
6. Click **Reload**

### Step 5: Test
Visit: `https://YOUR_USERNAME.pythonanywhere.com/docs`

---

## 📋 File Structure After Deployment

```
/home/username/
├── KulturaMind/
│   ├── backend/
│   │   ├── api.py (main FastAPI app)
│   │   ├── wsgi.py (PythonAnywhere entry point)
│   │   ├── requirements.txt
│   │   ├── .env (your config)
│   │   └── ... (other modules)
│   ├── frontend/
│   └── PYTHONANYWHERE_DEPLOYMENT.md
└── .virtualenvs/
    └── kulturamind/ (virtual environment)
```

---

## 🔧 Common Commands

### Update Code
```bash
cd ~/KulturaMind
git pull origin main
```

### Reinstall Dependencies
```bash
cd ~/KulturaMind/backend
pip install -r requirements.txt
```

### View Error Logs
```bash
tail -f /var/log/YOUR_USERNAME.pythonanywhere.com.error.log
```

### Reload App
- Go to Web tab → Click **Reload** button

---

## ⚠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| Module not found | Check virtualenv path in Web tab |
| 500 error | Check error log in Web tab |
| CORS errors | Update `allow_origins` in api.py |
| Permission denied | Run `chmod -R 755 ~/KulturaMind` |

---

## 📚 Full Documentation
See `PYTHONANYWHERE_DEPLOYMENT.md` for detailed instructions

## 🔗 Useful Links
- PythonAnywhere Help: https://help.pythonanywhere.com
- FastAPI Docs: https://fastapi.tiangolo.com
- Your App: https://YOUR_USERNAME.pythonanywhere.com
- API Docs: https://YOUR_USERNAME.pythonanywhere.com/docs

