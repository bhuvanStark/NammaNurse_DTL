# 🚀 Quick Setup Guide - Namma Nurse Server

**Last Updated:** January 23, 2026

This guide will help you get the Namma Nurse server running on your Mac in under 5 minutes.

---

## ✅ Current Status

Your system is ready! Here's what's already configured:

- ✅ **MongoDB**: Running on port 27017
- ✅ **Node.js**: Installed
- ✅ **Dependencies**: Installed (node_modules exists)
- ✅ **Environment Variables**: Configured in `.env`
- ✅ **Gemini API Key**: Set up

---

## 🎯 Steps to Start the Server

### Option 1: Quick Start (Server Only)

```bash
# Navigate to project directory
cd /Users/bhuvan/Desktop/DTL_main

# Start the server
npm start
```

The server will start on **http://localhost:3000**

### Option 2: Start Everything (Server + Seed Database)

```bash
# Navigate to project directory
cd /Users/bhuvan/Desktop/DTL_main

# Seed the database with sample patients (ONLY NEEDED ONCE)
npm run seed

# Start the server
npm start
```

---

## 🌐 Access the Application

Once the server is running, open these URLs in your browser:

### For Caretakers (Dashboard)
```
http://localhost:3000/caretaker/login.html
```
**Login Credentials:**
- Email: `admin@sandhyahome.org`
- Password: `Admin@123`

### For Elderly (Voice Interface)
```
http://localhost:3000/elderly/voice.html
```

---

## 📋 Available Commands

| Command | Purpose |
|---------|---------|
| `npm start` | Start the production server |
| `npm run dev` | Start with auto-reload (development mode) |
| `npm run seed` | Seed database with 10 sample patients |
| `npm run add-reports` | Add medical reports to patients |
| `npm run seed-history` | Add monthly health history |

---

## 🛑 How to Stop the Server

Press **`Ctrl + C`** in the terminal where the server is running.

---

## 🔧 Troubleshooting

### Problem: Port Already in Use

**Error:** `Port 3000 is already in use`

**Solution:**
```bash
# Find what's using port 3000
lsof -i :3000

# Kill the process (replace PID with the actual number)
kill -9 <PID>

# Or change the port in .env file
PORT=5000
```

### Problem: MongoDB Connection Error

**Error:** `MongoError: connect ECONNREFUSED`

**Solution:**
```bash
# Check if MongoDB is running
brew services list | grep mongodb

# If not running, start it
brew services start mongodb-community@7.0

# Verify it's running
brew services list | grep mongodb
```

### Problem: Gemini API Error

**Error:** `Invalid API key` or `API key not found`

**Solution:**
1. Get a new API key from: https://aistudio.google.com/apikey
2. Open `.env` file
3. Replace line 5:
   ```
   GEMINI_API_KEY=your_new_key_here
   ```
4. Restart the server

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `.env` | Environment variables (API keys, ports) |
| `server/server.js` | Main server entry point |
| `package.json` | Project dependencies and scripts |
| `alerts.log` | Critical health alerts log |

---

## 🎤 Testing the Voice Interface

1. Start the server: `npm start`
2. Open: http://localhost:3000/elderly/voice.html
3. Select a patient from the dropdown
4. Click the microphone button 🎤
5. Say: "How is my health?"
6. Listen to the AI response

**Supported Browsers:** Chrome or Edge (for Web Speech API)

---

## 📊 Testing the Caretaker Dashboard

1. Start the server: `npm start`
2. Open: http://localhost:3000/caretaker/login.html
3. Login with:
   - Email: `admin@sandhyahome.org`
   - Password: `Admin@123`
4. You'll see 10 sample patients
5. Click any patient to view details
6. Upload a medical report (PDF/JPG/PNG)

---

## 🔄 Fresh Start (Reset Everything)

If you want to start from scratch:

```bash
# Stop the server (Ctrl+C)

# Drop the MongoDB database
mongosh namma_nurse --eval "db.dropDatabase()"

# Re-seed with fresh data
npm run seed

# Start the server
npm start
```

---

## 🆘 Quick Reference

### Server Status Check
```bash
# Check if server is running
lsof -i :3000
```

### MongoDB Status Check
```bash
# Check MongoDB status
brew services list | grep mongodb

# Connect to MongoDB shell
mongosh namma_nurse
```

### View Logs
```bash
# View critical alerts
cat alerts.log

# View real-time server logs
npm start
```

---

## 📞 Common Support Questions

**Q: Where do uploaded reports go?**  
A: `uploads/` folder in the project directory

**Q: How do I add more patients?**  
A: Edit `server/seeds/seedData.js` and run `npm run seed`

**Q: Can I use a different port?**  
A: Yes! Change `PORT=3000` to `PORT=5000` (or any port) in `.env`

**Q: How do I update the Gemini API key?**  
A: See [HOW_TO_SWAP_API_KEY.md](./HOW_TO_SWAP_API_KEY.md)

---

## 🎯 Next Steps After Server is Running

1. **Test Voice Interface**: http://localhost:3000/elderly/voice.html
2. **Login to Dashboard**: http://localhost:3000/caretaker/login.html
3. **Upload a Medical Report**: Try with a sample PDF/image
4. **Check Alerts**: Look at `alerts.log` for critical health events

---

**Built with ❤️ for elderly care in Karnataka**

🏥 **Namma Nurse** - "Your health, our care"
