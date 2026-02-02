# 🚀 Deploying Namma Nurse to Vercel

Complete step-by-step guide to deploy your Namma Nurse application to Vercel with MongoDB Atlas.

---

## 📋 Prerequisites Checklist

Before starting, you'll need accounts for:
- ✅ [GitHub](https://github.com) - Already have it
- ✅ [Vercel](https://vercel.com) - Sign up with GitHub (free)
- ✅ [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) - Free tier available
- ✅ [Google AI Studio](https://aistudio.google.com) - For Gemini API (free)
- ✅ Gmail account - For email alerts (optional but recommended)

---

## 🗄️ Step 1: Setup MongoDB Atlas (Cloud Database)

### 1.1 Create MongoDB Atlas Account
1. Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Sign up (free tier is sufficient)
3. Choose **M0 (Free)** cluster when prompted

### 1.2 Create a Cluster
1. After login, click **"Build a Database"** or **"Create"**
2. Choose **M0 FREE** tier
3. Select cloud provider: **AWS** (recommended)
4. Region: Choose closest to you (e.g., **Mumbai** for India)
5. Cluster Name: `NammaNurse` (or leave as default)
6. Click **"Create Cluster"** (takes 3-5 minutes)

### 1.3 Create Database User
1. Go to **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. Authentication: **Password**
4. **Username**: `namma_nurse_user` (remember this!)
5. **Password**: Click "Autogenerate Secure Password" and **COPY IT** (or create your own strong password)
6. Built-in Role: Select **"Read and write to any database"**
7. Click **"Add User"**

> **⚠️ IMPORTANT**: Save this password! You'll need it for the connection string.

### 1.4 Configure Network Access
1. Go to **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - This is needed for Vercel to connect
4. Click **"Confirm"**

### 1.5 Get Connection String
1. Go to **"Database"** in left sidebar
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. Driver: **Node.js**, Version: **5.5 or later**
5. **Copy the connection string** - it looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Replace**:
   - `<username>` with `namma_nurse_user`
   - `<password>` with the password you saved earlier
   - Add database name: `/namma_nurse` before the `?`
   
   Final format:
   ```
   mongodb+srv://namma_nurse_user:YOUR_PASSWORD_HERE@cluster0.xxxxx.mongodb.net/namma_nurse?retryWrites=true&w=majority
   ```

> **💡 Save this complete connection string** - you'll use it as `MONGODB_URI` in Vercel!

---

## 🤖 Step 2: Get Google Gemini API Key

### 2.1 Create API Key
1. Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Select **"Create API key in new project"** (or use existing project)
5. **Copy the API key** - it looks like: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

> **💡 Save this key** - you'll use it as `GEMINI_API_KEY` in Vercel!

---

## 📧 Step 3: Setup Gmail App Password (for Email Alerts)

### 3.1 Enable 2-Factor Authentication
1. Go to [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Find **"2-Step Verification"** and turn it ON if not already enabled
3. Follow the setup process

### 3.2 Generate App Password
1. Go to [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Or search for "App Passwords" in Google Account settings
2. **Select app**: Choose "Mail"
3. **Select device**: Choose "Other" and type "NammaNurse"
4. Click **"Generate"**
5. **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)
   - Remove spaces when using: `abcdefghijklmnop`

> **💡 Save this password** - you'll use it as `GMAIL_APP_PASSWORD` in Vercel!

---

## ☁️ Step 4: Deploy to Vercel

### 4.1 Push Latest Code to GitHub
1. Make sure all changes are committed:
   ```bash
   cd /Users/bhuvan/Desktop/DTL_main
   git add .
   git commit -m "Add Vercel configuration"
   git push origin main
   ```

### 4.2 Sign Up/Login to Vercel
1. Go to [https://vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub account

### 4.3 Import Project
1. After login, click **"Add New..."** → **"Project"**
2. Find **"bhuvanStark/NammaNurse_DTL"** repository
3. Click **"Import"**

### 4.4 Configure Project Settings
1. **Project Name**: `namma-nurse` (or your choice)
2. **Framework Preset**: Select **"Other"** (not Next.js!)
3. **Root Directory**: Leave as `./` (root)
4. **Build Command**: Leave EMPTY or set to: `echo "No build needed"`
5. **Output Directory**: Leave EMPTY
6. **Install Command**: `npm install`

### 4.5 Add Environment Variables ⚠️ **CRITICAL STEP**

Click **"Environment Variables"** section and add these **EXACTLY**:

| Variable Name | Value | Where to Get It |
|---------------|-------|-----------------|
| `NODE_ENV` | `production` | Just type this |
| `PORT` | `3000` | Just type this |
| `MONGODB_URI` | `mongodb+srv://namma_nurse_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/namma_nurse?retryWrites=true&w=majority` | From Step 1.5 (MongoDB Atlas) |
| `JWT_SECRET` | `namma-nurse-super-secret-jwt-key-2026` | Just type this (or any random string) |
| `GEMINI_API_KEY` | `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` | From Step 2.1 (Google AI Studio) |
| `CARETAKER_EMAIL` | `your-caretaker-email@gmail.com` | Email where alerts will be sent |
| `GMAIL_USER` | `your-email@gmail.com` | Your Gmail address |
| `GMAIL_APP_PASSWORD` | `abcdefghijklmnop` | From Step 3.2 (remove spaces) |

**How to add each variable:**
1. Type the **Variable Name** (e.g., `MONGODB_URI`)
2. Paste the **Value** in the value field
3. Click **"Add"**
4. Repeat for all 8 variables above

> **⚠️ WARNING**: Double-check all values! Wrong values = app won't work!

### 4.6 Deploy!
1. After adding all environment variables, click **"Deploy"**
2. Wait 1-3 minutes for deployment to complete
3. You'll see **"Congratulations!"** when done

### 4.7 Get Your Live URL
Your app will be live at:
```
https://namma-nurse.vercel.app
```
(or whatever project name you chose)

---

## 🌱 Step 5: Seed Database with Sample Patients

### Option A: Use Vercel CLI (Recommended)
1. Install Vercel CLI locally:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Link your project:
   ```bash
   cd /Users/bhuvan/Desktop/DTL_main
   vercel link
   ```

4. Pull environment variables:
   ```bash
   vercel env pull .env.production
   ```

5. Run seed script with production env:
   ```bash
   node server/seeds/seedData.js
   ```
   - This will connect to your MongoDB Atlas database and create 10 sample patients

### Option B: Manual API Call (If CLI doesn't work)
1. Open your browser
2. Go to: `https://your-app-name.vercel.app/api/seed`
   - You'll need to create this endpoint first (or I can add it)

### Option C: Seed from Local with Production Database
1. Update your local `.env` file temporarily:
   ```env
   MONGODB_URI=mongodb+srv://namma_nurse_user:PASSWORD@cluster0.xxxxx.mongodb.net/namma_nurse?retryWrites=true&w=majority
   ```
2. Run:
   ```bash
   npm run seed
   ```
3. Restore local `.env` to local MongoDB after

---

## ✅ Step 6: Test Your Deployment

### 6.1 Visit Your Live App
1. **Caretaker Login**: `https://your-app-name.vercel.app/caretaker/login.html`
   - Email: `admin@sandhyahome.org`
   - Password: `Admin@123`

2. **Elderly Interface**: `https://your-app-name.vercel.app/elderly/voice.html`

### 6.2 Test Database Connection
1. Login as caretaker
2. Check if you see the 10 seeded patients
3. Try clicking on a patient's profile
4. Upload a test medical report (PDF/image)
5. Check if biomarkers are parsed correctly

### 6.3 Test Email Alerts
1. Go to elderly interface
2. Select a patient
3. Click **"Call for Help"** button
4. Check if email arrives at `CARETAKER_EMAIL`

---

## 🔧 Troubleshooting

### ❌ "Cannot connect to database"
- Check `MONGODB_URI` in Vercel environment variables
- Verify Network Access allows 0.0.0.0/0 in MongoDB Atlas
- Check username/password are correct in connection string

### ❌ "Gemini API error"
- Verify `GEMINI_API_KEY` in Vercel environment variables
- Check API key is active at [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

### ❌ "Email not sending"
- Check `GMAIL_USER` and `GMAIL_APP_PASSWORD` are correct
- Verify 2FA is enabled on Gmail account
- Check spam folder for test emails
- If using console logs: Check Vercel logs at Dashboard → Deployments → Click deployment → "Runtime Logs"

### ❌ "Application Error" or 500 errors
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on your latest deployment
3. Go to **"Runtime Logs"** tab
4. Check error messages
5. Common fixes:
   - Re-deploy after fixing environment variables
   - Check `vercel.json` is in root directory

### 🔄 How to Update Environment Variables
1. Go to Vercel Dashboard → Your Project
2. Click **"Settings"** tab
3. Click **"Environment Variables"**
4. Find variable to update
5. Click **"..."** → **"Edit"**
6. Update value and save
7. **Redeploy**: Go to Deployments → Latest → **"..."** → **"Redeploy"**

---

## 📊 How Data Flow Works

### When You Add a Patient:
1. Caretaker adds patient via dashboard
2. Data is sent to Vercel server (your Express API)
3. Express API saves to **MongoDB Atlas** (cloud database)
4. All data is stored permanently in cloud
5. Available across all deployments

### When Patient Uses Elderly Interface:
1. Patient selects their name
2. Frontend fetches patient data from API
3. API queries MongoDB Atlas
4. Returns patient's medical history
5. Gemini AI generates personalized response
6. Response is spoken via text-to-speech

### When "Call for Help" is Pressed:
1. Frontend sends help request to API
2. API uses `emailService.js` with Gmail SMTP
3. Email sent to `CARETAKER_EMAIL`
4. Caretaker receives immediate alert

**✅ Yes, everything goes directly to MongoDB Atlas in the cloud!**

---

## 🎉 You're Done!

Your Namma Nurse application is now:
- ✅ Deployed globally on Vercel
- ✅ Connected to MongoDB Atlas cloud database
- ✅ Using Google Gemini AI for responses
- ✅ Sending email alerts to caretakers
- ✅ Accessible from anywhere with internet

### Your URLs:
- 🌐 **Live App**: `https://your-app-name.vercel.app`
- 👨‍⚕️ **Caretaker Login**: `/caretaker/login.html`
- 👴 **Elderly Interface**: `/elderly/voice.html`

### Vercel Dashboard:
- 📊 **Deployments**: View deploy history
- 📊 **Analytics**: See visitor stats (free tier)
- 🔧 **Settings**: Update environment variables
- 📜 **Logs**: Debug runtime errors

---

## 💰 Costs

All services are **100% FREE**:
- ✅ Vercel: Free tier (100GB bandwidth/month)
- ✅ MongoDB Atlas: Free M0 cluster (512MB storage)
- ✅ Google Gemini API: Free tier (60 requests/minute)
- ✅ Gmail SMTP: Free

**Total Monthly Cost: $0** 🎉
