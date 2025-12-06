# Deployment Guide for Billing Software

This guide covers deploying both the frontend (React/Vite) and backend (Express/Node.js) of the billing application.

## Deployment Options

### Option 1: Vercel (Frontend) + Railway/Render (Backend) - Recommended
- **Frontend**: Deploy to Vercel (free, easy, automatic deployments)
- **Backend**: Deploy to Railway or Render (free tier available)

### Option 2: Render (Full Stack)
- Deploy both frontend and backend on Render (simpler, single platform)

### Option 3: Netlify (Frontend) + Railway (Backend)
- **Frontend**: Netlify
- **Backend**: Railway

---

## Prerequisites

1. **GitHub Account** (for code hosting)
2. **Vercel/Render/Railway Account** (free tier available)
3. **Node.js** installed locally (for building)

---

## Step-by-Step Deployment

### Part 1: Prepare Your Code

1. **Create a `.env` file** in the `server` directory:
   ```
   PORT=4000
   NODE_ENV=production
   ```

2. **Update API URL** in production (see below)

3. **Build the project**:
   ```bash
   # Build server
   cd server
   npm install
   npm run build
   
   # Build client
   cd ../client
   npm install
   npm run build
   ```

---

### Part 2: Deploy Backend (Server)

#### Option A: Deploy to Railway

1. Go to [railway.app](https://railway.app) and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect Node.js
5. Set these in Railway dashboard:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Port**: Railway auto-assigns (use `PORT` env var)
6. Railway will give you a URL like: `https://your-app.railway.app`
7. Copy this URL - you'll need it for the frontend

#### Option B: Deploy to Render

1. Go to [render.com](https://render.com) and sign up
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: billing-server
   - **Root Directory**: `server`
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Render will give you a URL like: `https://billing-server.onrender.com`
6. Copy this URL for the frontend

---

### Part 3: Deploy Frontend (Client)

#### Option A: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up
2. Click "Add New Project" → Import your GitHub repo
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - **Name**: `VITE_API_URL`
   - **Value**: Your backend URL (from Railway/Render)
5. Click "Deploy"
6. Vercel will give you a URL like: `https://your-app.vercel.app`

#### Option B: Deploy to Netlify

1. Go to [netlify.com](https://netlify.com) and sign up
2. Click "Add new site" → "Import an existing project"
3. Connect GitHub and select your repo
4. Configure:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/dist`
5. Add Environment Variable:
   - **Key**: `VITE_API_URL`
   - **Value**: Your backend URL
6. Click "Deploy site"

---

## Environment Variables

### Backend (Server)
- `PORT`: Server port (default: 4000)
- `NODE_ENV`: Set to `production`

### Frontend (Client)
- `VITE_API_URL`: Your backend API URL (e.g., `https://your-backend.railway.app`)

---

## Important Notes

1. **Data Persistence**: The server stores data in `server/data/invoices.json`. 
   - On Railway/Render, this file persists between deployments
   - For production, consider using a database (MongoDB, PostgreSQL)

2. **CORS**: The server already has CORS enabled, so it should work with any frontend URL

3. **API Proxy**: In production, the frontend will call the backend directly (no proxy needed)

---

## Post-Deployment Checklist

- [ ] Backend is accessible (test: `https://your-backend.railway.app/health`)
- [ ] Frontend can connect to backend
- [ ] Test creating a bill
- [ ] Test saving a bill
- [ ] Test viewing saved bills
- [ ] Test PDF generation
- [ ] Test deleting bills

---

## Troubleshooting

### Backend not accessible
- Check if CORS is enabled (it is in the code)
- Verify the PORT environment variable
- Check Railway/Render logs

### Frontend can't connect to backend
- Verify `VITE_API_URL` is set correctly
- Check browser console for CORS errors
- Ensure backend URL doesn't have trailing slash

### PDF generation not working
- Check browser console for errors
- Ensure all assets (logo.png) are accessible
- Test in different browsers

---

## Alternative: Single Platform Deployment (Render)

You can deploy both frontend and backend on Render:

1. Deploy backend as a Web Service (as above)
2. Deploy frontend as a Static Site:
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/dist`
   - Add `VITE_API_URL` environment variable

---

## Need Help?

- Check deployment platform documentation
- Review error logs in deployment dashboard
- Test locally first: `npm run build` in both directories

