# 🚀 Deployment Guide - Render.com (FREE)

**Deploy Namma Nurse to the internet in under 15 minutes!**

---

## 🎯 Why Render.com?

- ✅ **FREE tier** (no credit card required for start)
- ✅ Supports full Node.js/Express apps
- ✅ Easy deployment from GitHub
- ✅ Automatic HTTPS
- ✅ Connects to MongoDB Atlas (also free)
- ✅ Perfect for demos and portfolios

**NOT Vercel** because:
- ❌ Vercel is for serverless/static sites
- ❌ No persistent file storage for uploads
- ❌ No long-running Node.js servers

---

## 📋 Prerequisites

1. **GitHub account** (to store code)
2. **Render.com account** (free signup)
3. **MongoDB Atlas account** (free tier, 512MB)

---

## 🔧 Step 1: Prepare Project for Deployment

### 1.1 Add Environment Variable Handling

Your `.env` file won't be deployed. Create `.env.example` with placeholder values:

**File:** `.env.example`
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=your_mongodb_atlas_connection_string_here
JWT_SECRET=your_random_jwt_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
```

### 1.2 Update server.js to Use PORT from Environment

Verify this is in `server/server.js`:
```javascript
const PORT = process.env.PORT || 3000;
```

### 1.3 Create `.gitignore` (if not exists)

**File:** `.gitignore`
```
node_modules/
.env
uploads/
*.log
.DS_Store
```

---

## 📦 Step 2: Push Code to GitHub

### 2.1 Initialize Git (if not already)

```bash
cd /Users/bhuvan/Desktop/DTL_main
git init
```

### 2.2 Add All Files

```bash
git add .
git commit -m "Initial commit - Namma Nurse Healthcare System"
```

### 2.3 Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: `namma-nurse` (or your choice)
3. Make it **Public** (for free Render deployment)
4. **Don't** initialize with README (you already have code)
5. Click "Create repository"

### 2.4 Push to GitHub

```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/namma-nurse.git
git branch -M main
git push -u origin main
```

---

## 🗄️ Step 3: Set Up MongoDB Atlas (FREE Database)

### 3.1 Sign Up for MongoDB Atlas

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up (free, no credit card needed)
3. Choose **FREE M0 tier** (512MB)

### 3.2 Create a Cluster

1. Click "Build a Cluster"
2. Choose **FREE M0 Sandbox**
3. Select **AWS** provider
4. Choose region closest to you (e.g., Mumbai for India)
5. Cluster name: `namma-nurse`
6. Click "Create Cluster" (takes 3-5 minutes)

### 3.3 Create Database User

1. Go to "Database Access" (left sidebar)
2. Click "Add New Database User"
3. Authentication: **Password**
4. Username: `admin`
5. Password: **Auto-generate** (copy it!)
6. Database User Privileges: **Read and write to any database**
7. Click "Add User"

### 3.4 Whitelist IP Address

1. Go to "Network Access" (left sidebar)
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
   - ⚠️ This is fine for demo, for production use specific IPs
4. Click "Confirm"

### 3.5 Get Connection String

1. Go to "Databases" (left sidebar)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Driver: **Node.js**, Version: **4.1 or later**
5. Copy the connection string:
   ```
   mongodb+srv://admin:<password>@namma-nurse.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual password
7. Add database name: `/namma_nurse` after `.net`
   ```
   mongodb+srv://admin:YOUR_PASSWORD@namma-nurse.xxxxx.mongodb.net/namma_nurse?retryWrites=true&w=majority
   ```

**Save this connection string!** You'll need it for Render.

---

## 🌐 Step 4: Deploy to Render

###4.1 Sign Up for Render

1. Go to: https://render.com
2. Click "Get Started"
3. Sign up with **GitHub** (easiest)

### 4.2 Create New Web Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository (`namma-nurse`)
3. Click "Connect"

### 4.3 Configure Web Service

**Basic Settings:**
- **Name:** `namma-nurse` (this will be your URL subdomain)
- **Region:** Choose closest region (Singapore for India)
- **Branch:** `main`
- **Root Directory:** Leave blank
- **Environment:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

**Instance Type:**
- Choose **Free** tier

### 4.4 Add Environment Variables

Click "Advanced" → "Add Environment Variable"

Add these 4 variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | `your_mongodb_atlas_connection_string` |
| `JWT_SECRET` | `your-super-secret-random-string-here` |
| `GEMINI_API_KEY` | `your_gemini_api_key` |

**To generate JWT_SECRET:**
```bash
# Run this in terminal to get random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4.5 Deploy!

1. Click "Create Web Service"
2. Wait 5-10 minutes for deployment
3. You'll see logs in real-time

**When you see:**
```
✅ Server running on http://0.0.0.0:10000
```

**Your app is LIVE!** 🎉

---

## 🎉 Step 5: Access Your Live App

Your app will be at:
```
https://namma-nurse.onrender.com
```

**Test URLs:**
- Dashboard: `https://namma-nurse.onrender.com/caretaker/login.html`
- Voice Interface: `https://namma-nurse.onrender.com/elderly/voice.html`

---

## 🌱 Step 6: Seed theDatabase

### Option 1: Via Terminal (if you have access)

Render gives you a shell:
1. Go to your service dashboard
2. Click "Shell" tab
3. Run:
```bash
npm run seed
npm run seed-history
```

### Option 2: Via Local Connection

Connect to your production MongoDB from your Mac:

```bash
# Export MongoDB URI
export MONGODB_URI="your_atlas_connection_string"

# Seed from local
npm run seed
npm run seed-history
```

### Option 3: Manual API Calls

Use Postman to call `/api/residents` POST endpoint with patient data.

---

## 🔒 Security - Production Best Practices

### 1. Change JWT Secret

Never use default. Generate strong random secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Restrict MongoDB IP Whitelist

Instead of "Allow from Anywhere", use Render's outbound IPs:
- Go to Render service → Settings → Outbound IPs
- Copy the IP addresses
- Add them to MongoDB Atlas Network Access

### 3. Add Rate Limiting

Install express-rate-limit:
```bash
npm install express-rate-limit
```

Add to `server/server.js`:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## 📊 Monitoring Your App

### Check Logs

1. Go to Render dashboard
2. Click your service
3. Click "Logs" tab
4. See real-time logs

### Check Health

Render automatically pings your app to keep it alive on free tier.

---

## ⚙️ Updating Your App

### When you make code changes:

```bash
# Make changes locally
git add .
git commit -m "Updated feature X"
git push origin main
```

**Render will automatically:**
1. Detect the push
2. Rebuild your app
3. Deploy new version
4. Zero downtime!

---

## 🆓 Free Tier Limits

**Render Free Tier:**
- ✅ 750 hours/month (enough for always-on)
- ⚠️ App sleeps after 15 min inactivity
- ⚠️ Cold start takes ~30 seconds
- ✅ 512MB RAM
- ✅ Shared CPU

**MongoDB Atlas Free Tier:**
- ✅ 512MB storage
- ✅ Shared cluster
- ✅ Perfect for demos

---

## 💡 Tips

### Keep App Awake (Prevent Sleep)

Use a service like **UptimeRobot**:
1. Sign up https://uptimerobot.com
2. Add monitor for `https://namma-nurse.onrender.com`
3. Ping interval: 5 minutes
4. Keeps your app warm!

### Custom Domain (Optional)

1. Buy domain from Namecheap/GoDaddy
2. Go to Render → Settings → Custom Domains
3. Follow instructions to add DNS records

---

## 🐛 Troubleshooting

### App Won't Start

**Check Logs:**
1. Go to Render dashboard → Logs
2. Look for errors

**Common Issues:**
- ❌ Missing environment variables
- ❌ Wrong MongoDB connection string
- ❌ Port hardcoded instead of `process.env.PORT`

### MongoDB Connection Failed

**Check:**
- ✅ Connection string is correct
- ✅ Password has no special characters (or is URL-encoded)
- ✅ IP whitelist includes 0.0.0.0/0 or Render's IPs
- ✅ Database name is in the connection string

### File Uploads Not Working

**Issue:** Render's free tier doesn't have persistent disk storage.

**Solutions:**
1. Use MongoDB GridFS to store files in database
2. Use AWS S3 / Cloudinary for file storage
3. For demo: Keep uploads in memory (they'll be lost on restart)

---

## 🎬 Demo Day Checklist

Before your demo:

- [ ] App is deployed and accessible
- [ ] Database is seeded with 10 patients
- [ ] All 30 historical reports are loaded
- [ ] Test login works
- [ ] Test voice interface works
- [ ] Test upload works
- [ ] UptimeRobot is pinging (no cold start during demo!)

---

## 🔗 Useful Links

- **Your Live App:** `https://namma-nurse.onrender.com`
- **Render Dashboard:** https://dashboard.render.com
- **MongoDB Atlas:** https://cloud.mongodb.com
- **GitHub Repo:** `https://github.com/YOUR_USERNAME/namma-nurse`

---

## 🎯 Alternative Deployment Options

If Render doesn't work for you:

### 1. Railway.app
- Similar to Render
- Built-in MongoDB (paid)
- Free tier: $5/month credit
- Deploy from GitHub

### 2. Heroku
- Classic choice
- Now PAID only ($7/month minimum)
- Easy deployment

### 3. DigitalOcean App Platform
- $5/month minimum
- More powerful
- Good for production

### 4. Vercel (NOT RECOMMENDED for this project)
- Only use if you convert to serverless
- Would need major code changes

---

**Recommendation:** Stick with **Render.com** - it's the easiest free option for full-stack Node.js apps!

🚀 **Good luck with your deployment!**
