# KulturaMind Deployment Guide - Render

Render is a modern cloud platform that makes deploying FastAPI applications simple and free!

## Prerequisites
- Render account (free tier available)
- GitHub repository (yuguda0/KulturaMind)
- GitHub personal access token (already have it)

## Step 1: Create Render Account

1. Go to https://render.com
2. Click **Sign up**
3. Choose **Sign up with GitHub** (recommended)
4. Authorize Render to access your GitHub account
5. Verify your email

## Step 2: Connect GitHub Repository

1. After signing in, go to **Dashboard**
2. Click **New +** → **Web Service**
3. Click **Connect a repository**
4. Search for `KulturaMind`
5. Click **Connect** next to your repository

## Step 3: Configure Web Service

Fill in the following details:

| Field | Value |
|-------|-------|
| **Name** | `kulturamind-api` |
| **Environment** | `Python 3` |
| **Region** | Choose closest to you |
| **Branch** | `main` |
| **Build Command** | `cd backend && pip install -r requirements.txt` |
| **Start Command** | `cd backend && uvicorn api:app --host 0.0.0.0 --port $PORT` |
| **Plan** | `Free` (or Starter for better performance) |

## Step 4: Add Environment Variables

1. Scroll down to **Environment**
2. Click **Add Environment Variable**
3. Add the following:

```
PYTHONUNBUFFERED=true
```

4. If you have API keys, add them here:
```
API_KEY=your_key_here
```

## Step 5: Deploy

1. Click **Create Web Service**
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Start your application
3. Wait for deployment to complete (2-5 minutes)

## Step 6: Access Your API

Once deployed, you'll get a URL like: `https://kulturamind-api.onrender.com`

Test your API:
- **Swagger UI**: `https://kulturamind-api.onrender.com/docs`
- **ReDoc**: `https://kulturamind-api.onrender.com/redoc`
- **Health Check**: `https://kulturamind-api.onrender.com/health`

## Automatic Deployments

Render automatically redeploys when you:
1. Push to the `main` branch
2. Update environment variables
3. Manually trigger a redeploy

## Monitoring & Logs

1. Go to your service dashboard
2. Click **Logs** to see real-time logs
3. Check **Metrics** for performance data

## Troubleshooting

### Deployment Failed
1. Check **Logs** tab for error messages
2. Verify `requirements.txt` has all dependencies
3. Ensure `api.py` is in the `backend/` directory

### Application Crashes
1. Check logs for error messages
2. Verify environment variables are set correctly
3. Check if dependencies are compatible

### Slow Performance
- Upgrade to **Starter** plan (paid)
- Optimize database queries
- Add caching

## Updating Your Code

Simply push to GitHub:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

Render will automatically redeploy!

## Environment Variables

Add sensitive data via Render dashboard:

1. Go to your service
2. Click **Environment**
3. Add variables (never commit secrets to GitHub)

Example:
```
DATABASE_URL=postgresql://...
API_KEY=sk-...
```

## Custom Domain (Optional)

1. Go to your service settings
2. Click **Custom Domain**
3. Add your domain
4. Follow DNS configuration instructions

## Performance Tips

1. **Use Starter plan** for production (free tier has limitations)
2. **Enable caching** in your API
3. **Optimize queries** for Qdrant
4. **Use CDN** for static assets
5. **Monitor logs** regularly

## Scaling

As your app grows:
- Upgrade from **Free** → **Starter** → **Standard** plan
- Add background workers for long-running tasks
- Use PostgreSQL for persistent data

## Security

1. Never commit `.env` files
2. Use environment variables for secrets
3. Enable HTTPS (automatic on Render)
4. Restrict CORS origins to your domain
5. Use strong API keys

## Useful Links

- Render Docs: https://render.com/docs
- FastAPI Docs: https://fastapi.tiangolo.com
- Your Repository: https://github.com/yuguda0/KulturaMind
- Render Dashboard: https://dashboard.render.com

## Support

- Render Support: https://render.com/support
- GitHub Issues: https://github.com/yuguda0/KulturaMind/issues

