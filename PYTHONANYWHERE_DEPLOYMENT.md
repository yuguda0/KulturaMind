# KulturaMind Deployment Guide - PythonAnywhere

## Prerequisites
- PythonAnywhere account (free or paid)
- GitHub repository access (yuguda0/KulturaMind)
- Personal access token for GitHub

## Step 1: Create PythonAnywhere Account
1. Go to https://www.pythonanywhere.com
2. Sign up for a free or paid account
3. Verify your email

## Step 2: Clone Repository on PythonAnywhere

1. Open **Bash console** from the dashboard
2. Clone your repository:
```bash
cd ~
git clone https://github.com/yuguda0/KulturaMind.git
cd KulturaMind
```

3. Navigate to backend:
```bash
cd backend
```

## Step 3: Create Virtual Environment

```bash
mkvirtualenv --python=/usr/bin/python3.10 kulturamind
pip install -r requirements.txt
```

**Note:** PythonAnywhere provides Python 3.10 by default. Adjust if needed.

## Step 4: Configure Web App

1. Go to **Web** tab in PythonAnywhere dashboard
2. Click **Add a new web app**
3. Choose **Manual configuration**
4. Select **Python 3.10**
5. Click **Next**

## Step 5: Configure WSGI File

1. In the Web tab, find the **WSGI configuration file** section
2. Click on the WSGI file path (usually `/var/www/username_pythonanywhere_com_wsgi.py`)
3. Replace the content with:

```python
import sys
import os

# Add backend directory to path
path = '/home/username/KulturaMind/backend'
if path not in sys.path:
    sys.path.insert(0, path)

# Set environment variables
os.environ['PYTHONUNBUFFERED'] = '1'

# Import and configure the app
from api import app
application = app
```

**Replace `username` with your PythonAnywhere username**

## Step 6: Configure Virtual Environment

1. In the Web tab, find **Virtualenv** section
2. Enter the path: `/home/username/.virtualenvs/kulturamind`
3. Click the checkmark to confirm

## Step 7: Set Environment Variables

1. Create `.env` file in `/home/username/KulturaMind/backend/`:
```bash
cd ~/KulturaMind/backend
nano .env
```

2. Add your environment variables:
```
PYTHONUNBUFFERED=1
# Add any API keys or configuration here
```

3. Save (Ctrl+X, then Y, then Enter)

## Step 8: Configure Static Files (Optional)

If you want to serve static files:

1. In Web tab, add URL mapping:
   - URL: `/static/`
   - Directory: `/home/username/KulturaMind/frontend/dist`

## Step 9: Reload Web App

1. Go to **Web** tab
2. Click the green **Reload** button
3. Wait for it to complete

## Step 10: Test Your Deployment

1. Your app will be available at: `https://username.pythonanywhere.com`
2. Test the API:
   - Visit: `https://username.pythonanywhere.com/docs` (Swagger UI)
   - Or: `https://username.pythonanywhere.com/redoc` (ReDoc)

## Troubleshooting

### Check Error Logs
1. Go to **Web** tab
2. Scroll down to **Log files**
3. Click on **Error log** to see what went wrong

### Common Issues

**Issue: Module not found**
- Solution: Ensure virtual environment path is correct in Web tab
- Check that all dependencies are installed: `pip install -r requirements.txt`

**Issue: Permission denied**
- Solution: Check file permissions in bash console:
```bash
chmod -R 755 ~/KulturaMind
```

**Issue: CORS errors**
- Solution: Update CORS settings in `api.py` to include your domain:
```python
allow_origins=["https://username.pythonanywhere.com", "http://localhost:3000"]
```

**Issue: Database/Vector DB connection**
- Solution: Ensure Qdrant or other services are properly configured
- Use absolute paths for data storage

### View Live Logs
```bash
tail -f /var/log/username.pythonanywhere.com.error.log
```

## Updating Your Code

To deploy new changes:

```bash
cd ~/KulturaMind
git pull origin main
cd backend
pip install -r requirements.txt  # if dependencies changed
```

Then reload the web app from the Web tab.

## Frontend Deployment (Optional)

To serve your Vue.js frontend:

1. Build the frontend:
```bash
cd ~/KulturaMind/frontend
npm run build
```

2. Configure static files in Web tab to serve from `dist/` directory

3. Update API endpoints in frontend to point to your PythonAnywhere domain

## Performance Tips

1. **Use paid account** for better performance and no CPU time limits
2. **Enable caching** in your API responses
3. **Optimize database queries** for Qdrant
4. **Use CDN** for static assets
5. **Monitor CPU usage** in the Web tab

## Security Considerations

1. Never commit `.env` files with secrets
2. Use environment variables for API keys
3. Enable HTTPS (automatic on PythonAnywhere)
4. Restrict CORS origins to your domain
5. Use strong database passwords

## Support

- PythonAnywhere Help: https://help.pythonanywhere.com
- FastAPI Docs: https://fastapi.tiangolo.com
- GitHub Issues: https://github.com/yuguda0/KulturaMind/issues

