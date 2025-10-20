# 🚀 Deploy to Render in 3 Minutes

## Step 1: Create Account
Go to https://render.com and sign up with GitHub

## Step 2: Create Web Service
1. Click **New +** → **Web Service**
2. Click **Connect a repository**
3. Select `yuguda0/KulturaMind`
4. Click **Connect**

## Step 3: Configure & Deploy

Fill in these fields:

```
Name:           kulturamind-api
Environment:    Python 3
Region:         (choose closest)
Branch:         main
Build Command:  cd backend && pip install -r requirements.txt
Start Command:  cd backend && uvicorn api:app --host 0.0.0.0 --port $PORT
Plan:           Free
```

Click **Create Web Service** and wait 2-5 minutes!

## Step 4: Test Your API

Your app will be live at: `https://kulturamind-api.onrender.com`

Visit:
- **API Docs**: https://kulturamind-api.onrender.com/docs
- **ReDoc**: https://kulturamind-api.onrender.com/redoc

---

## 📋 What Happens Automatically

✅ Clones your GitHub repo  
✅ Installs dependencies from `requirements.txt`  
✅ Starts FastAPI with Uvicorn  
✅ Assigns a free domain  
✅ Enables HTTPS  
✅ Auto-redeploys on git push  

---

## 🔄 Update Your Code

Just push to GitHub:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

Render automatically redeploys! 🎉

---

## 🔧 Add Environment Variables

1. Go to your service on Render dashboard
2. Click **Environment**
3. Add variables (e.g., API keys)
4. Click **Save**

---

## ⚠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Check logs, verify `requirements.txt` |
| App crashes | Check logs, verify `api.py` location |
| 404 errors | Ensure endpoints are correct |

Check **Logs** tab for detailed error messages.

---

## 📚 Full Documentation
See `RENDER_DEPLOYMENT.md` for detailed instructions

## 🔗 Useful Links
- Render: https://render.com
- Your App: https://kulturamind-api.onrender.com
- API Docs: https://kulturamind-api.onrender.com/docs
- GitHub: https://github.com/yuguda0/KulturaMind

