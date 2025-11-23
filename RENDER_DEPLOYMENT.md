# PHUNTROO Backend - Render Deployment Guide

## 🎯 Quick Overview

This guide will help you deploy the PHUNTROO backend to Render's free tier, enabling full AI features for your GitHub Pages frontend.

**Estimated Time:** 15-20 minutes

---

## ✅ Prerequisites

- [x] Backend folder structure verified
- [x] CORS configuration updated for GitHub Pages
- [x] `.gitignore` created
- [x] `render.yaml` configuration created

---

## 📋 Step 1: Create GitHub Repository for Backend

### Option A: Using GitHub Web Interface (Recommended)

1. Go to https://github.com/new
2. Repository name: `phuntroo-backend`
3. Description: "Backend server for PHUNTROO AI Assistant"
4. Visibility: **Public** (required for Render free tier)
5. **DO NOT** initialize with README, .gitignore, or license
6. Click **Create repository**

### Option B: Using GitHub CLI

```powershell
gh repo create phuntroo-backend --public --description "Backend server for PHUNTROO AI Assistant"
```

---

## 📋 Step 2: Push Backend to GitHub

Open PowerShell in VS Code and run these commands:

```powershell
# Navigate to server folder
cd d:\Jarvis-main\server

# Initialize git repository
git init

# Set main branch
git branch -M main

# Add all files (respects .gitignore)
git add .

# Commit files
git commit -m "Initial PHUNTROO backend commit"

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/phuntroo-backend.git

# Push to GitHub
git push -u origin main
```

**⚠️ Important:** Replace `YOUR_USERNAME` with your actual GitHub username!

---

## 📋 Step 3: Deploy to Render

### 3.1 Create Render Account

1. Go to https://render.com
2. Click **Get Started for Free**
3. Sign up with GitHub (recommended) or email
4. Verify your email if required

### 3.2 Create New Web Service

1. Click **New +** → **Web Service**
2. Connect your GitHub account if not already connected
3. Find and select `phuntroo-backend` repository
4. Click **Connect**

### 3.3 Configure Service Settings

Fill in the following settings:

| Setting | Value |
|---------|-------|
| **Name** | `phuntroo-backend` |
| **Region** | `Singapore` (closest to India) |
| **Branch** | `main` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Instance Type** | **Free** |

### 3.4 Add Environment Variables

Click **Advanced** → **Add Environment Variable** and add these:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Required |
| `PORT` | `10000` | Render default port |
| `GROK_API_KEY` | `your_grok_key` | From your .env file |
| `COHERE_API_KEY` | `your_cohere_key` | From your .env file |
| `HUGGINGFACE_API_KEY` | `your_hf_key` | From your .env file |

**⚠️ Security Note:** 
- Get the actual API keys from your local `d:\Jarvis-main\server\.env` file
- **NEVER** commit `.env` to GitHub
- Render stores these securely

### 3.5 Deploy

1. Click **Create Web Service**
2. Wait for deployment (usually 2-5 minutes)
3. Watch the logs for any errors

---

## 📋 Step 4: Verify Deployment

### 4.1 Check Health Endpoint

Once deployed, Render will give you a URL like:
```
https://phuntroo-backend.onrender.com
```

Test the health endpoint:
```
https://phuntroo-backend.onrender.com/health
```

You should see:
```json
{
  "status": "ok",
  "timestamp": "2024-...",
  "services": {
    "grok": true,
    "cohere": true,
    "huggingface": true
  }
}
```

### 4.2 Check Logs

In Render dashboard:
1. Click on your service
2. Go to **Logs** tab
3. Look for:
   - ✅ `🚀 Jarvis Backend Server running on port 10000`
   - ✅ `📡 WebSocket server ready`
   - ✅ `🔑 API Keys loaded: Grok, Cohere, HuggingFace`

---

## 📋 Step 5: Update Frontend to Use Backend

### 5.1 Copy Your Render URL

From Render dashboard, copy your service URL:
```
https://phuntroo-backend.onrender.com
```

### 5.2 Update Frontend API Configuration

Edit `d:\Jarvis-main\web\src\services\api.js`:

Find the line:
```javascript
const API_BASE_URL = 'http://localhost:3000';
```

Replace with:
```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://phuntroo-backend.onrender.com'
  : 'http://localhost:3000';
```

### 5.3 Commit and Push Frontend Changes

```powershell
cd d:\Jarvis-main
git add web/src/services/api.js
git commit -m "Update API URL to use Render backend"
git push origin main
```

GitHub Actions will automatically redeploy your frontend!

---

## 📋 Step 6: Test Full Integration

### 6.1 Wait for Frontend Deployment

1. Go to https://github.com/sudhir-bahadure/phuntroo/actions
2. Wait for the latest workflow to complete (green checkmark)

### 6.2 Test Your Live Site

Visit: https://sudhir-bahadure.github.io/phuntroo/

Test these features:
- ✅ **Chat:** Type a message and get AI response
- ✅ **Voice:** Click microphone and speak
- ✅ **TTS:** Avatar should speak responses
- ✅ **Emotions:** Avatar should show emotions
- ✅ **Animations:** Avatar should animate while talking

### 6.3 Check Browser Console

Press F12 → Console tab

You should see:
- ✅ No 404 errors for `/api/health`
- ✅ Successful API responses
- ✅ WebSocket connection established

---

## 🔧 Troubleshooting

### Backend Won't Start

**Check Render Logs:**
- Missing environment variables?
- Port binding errors?
- Dependency installation failures?

**Solution:** Verify all environment variables are set correctly

### CORS Errors in Frontend

**Error:** `Access to fetch at 'https://phuntroo-backend.onrender.com' from origin 'https://sudhir-bahadure.github.io' has been blocked by CORS policy`

**Solution:** The CORS configuration has already been updated in `server.js`. If you still see this error:
1. Check that `NODE_ENV=production` is set in Render
2. Verify the frontend URL matches exactly in the CORS config

### Cold Start Delays

**Issue:** First request after 15 minutes of inactivity takes 30-60 seconds

**Solution:** This is expected on Render's free tier. The service "spins down" after inactivity and "spins up" on the next request. This is normal and acceptable for personal projects.

### API Keys Not Working

**Check:**
1. Environment variables are set in Render dashboard
2. No extra spaces in API keys
3. Keys are valid and not expired

---

## 🎉 Success Checklist

- [ ] Backend deployed to Render
- [ ] Health endpoint returns `status: ok`
- [ ] All API keys loaded (check logs)
- [ ] Frontend updated with Render URL
- [ ] Frontend redeployed via GitHub Actions
- [ ] Chat feature works
- [ ] Voice input works
- [ ] TTS/avatar speech works
- [ ] No console errors

---

## 📊 Render Free Tier Limits

| Resource | Limit | Notes |
|----------|-------|-------|
| **Instance Hours** | 750/month | Enough for 24/7 uptime |
| **Bandwidth** | 100 GB/month | Plenty for personal use |
| **Build Minutes** | 500/month | More than enough |
| **Cold Starts** | After 15min idle | 30-60s delay |
| **Database** | 1 GB Postgres | Optional, expires in 30 days |

---

## 🚀 Next Steps

Once everything is working:

1. **Add Conversation Memory**
   - Set up Postgres database on Render
   - Store chat history
   - Implement context awareness

2. **Improve Avatar**
   - Add more realistic VRM model
   - Implement lip-sync with visemes
   - Add more emotion states

3. **Add Features**
   - Voice cloning
   - Multi-language support
   - Custom wake word
   - Offline mode

---

## 📞 Need Help?

If you encounter any issues:
1. Check Render logs first
2. Verify environment variables
3. Test health endpoint
4. Check browser console for errors

Share any error messages and I'll help you fix them!
