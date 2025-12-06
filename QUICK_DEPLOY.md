# Quick Deployment Guide

## 🚀 Fastest Way: Railway (Backend) + Vercel (Frontend)

### Step 1: Deploy Backend to Railway (5 minutes)

1. Go to [railway.app](https://railway.app) → Sign up with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Railway auto-detects Node.js
5. In project settings:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
6. Copy the generated URL (e.g., `https://billing-app.railway.app`)
7. ✅ Backend deployed!

### Step 2: Deploy Frontend to Vercel (3 minutes)

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Click **"Add New Project"** → Import your GitHub repo
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - **Key**: `VITE_API_URL`
   - **Value**: Your Railway backend URL (from Step 1)
5. Click **"Deploy"**
6. ✅ Frontend deployed!

### Step 3: Test

1. Open your Vercel URL
2. Create a test invoice
3. Save it (select "Yes" for Save)
4. Generate PDF
5. Check "View Saved Bills"

---

## 🎯 Alternative: Render (Everything in One Place)

### Deploy Both on Render

1. Go to [render.com](https://render.com) → Sign up
2. **Deploy Backend:**
   - Click **"New"** → **"Web Service"**
   - Connect GitHub repo
   - Settings:
     - **Name**: billing-server
     - **Root Directory**: `server`
     - **Build**: `npm install && npm run build`
     - **Start**: `npm start`
   - Copy the URL

3. **Deploy Frontend:**
   - Click **"New"** → **"Static Site"**
   - Connect GitHub repo
   - Settings:
     - **Name**: billing-client
     - **Root Directory**: `client`
     - **Build**: `npm install && npm run build`
     - **Publish Directory**: `dist`
   - Add Environment Variable:
     - **Key**: `VITE_API_URL`
     - **Value**: Your backend URL from step 2

4. ✅ Both deployed!

---

## 📝 Important Notes

- **Data Storage**: Bills are saved in `server/data/invoices.json`
- **Bill Numbers**: Auto-generated sequentially (1, 2, 3...)
- **CORS**: Already configured, works with any frontend URL
- **Free Tiers**: Both Railway and Vercel offer free tiers

---

## 🔧 Troubleshooting

**Backend not working?**
- Check Railway/Render logs
- Verify PORT is set correctly
- Test: `https://your-backend-url/health`

**Frontend can't connect?**
- Verify `VITE_API_URL` environment variable
- Check browser console for errors
- Ensure backend URL has no trailing slash

**PDF not generating?**
- Check browser console
- Ensure logo.png is accessible
- Try different browser

---

## 🎉 You're Done!

Your billing software is now live! Share the Vercel/Render URL with your team.

