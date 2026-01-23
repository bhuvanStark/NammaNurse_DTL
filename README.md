# 🏥 Namma Nurse - Voice-First AI Healthcare Assistant

**A compassionate AI healthcare system for old-age homes in Karnataka, enabling elderly patients to interact hands-free in Kannada/English while caretakers manage patient data through a comprehensive dashboard.**

---

## ✨ Features

### 👴 **Elderly Voice Interface**
- 🎤 **Hands-free voice interaction** using Web Speech API
- 🗣️ **Bilingual support**: Kannada + English
- 🤖 **AI-powered responses** using Google Gemini 2.0 Flash
- 🔊 **Text-to-speech** for spoken responses
- 📱 **Large buttons** and high-contrast design for low vision

### 👨‍⚕️ **Caretaker Dashboard**
- 🔐 **Secure authentication** with JWT
- 📊 **Patient overview** with risk-level color coding
  - 🟢 Normal | 🟡 Attention | 🔴 Critical
- 🔍 **Search & filter** residents
- 📄 **Medical report upload** with automatic OCR
- 🧠 **AI-powered health summaries** in English + Kannada
- 🚨 **Critical health alerts** when biomarkers exceed thresholds

### 🔬 **Intelligent Report Processing**
- 📷 **OCR extraction** from PDF/image reports using Tesseract.js
- 🩺 **Biomarker parsing** (Glucose, HbA1c, Creatinine, BP, etc.)
- 🤖 **Gemini AI summaries** in plain language
- ⚠️ **Automatic risk assessment** and alerts

---

## 🛠️ Technology Stack

| Component | Technology | Why? |
|-----------|-----------|------|
| **Backend** | Node.js + Express | Fast, scalable API server |
| **Database** | MongoDB + Mongoose | Flexible document storage |
| **AI/LLM** | Google Gemini 2.0 Flash | FREE, Kannada-capable, fast |
| **OCR** | Tesseract.js | 100% free, browser-based |
| **Speech-to-Text** | Web Speech API | FREE, browser-native |
| **Text-to-Speech** | Web Speech Synthesis | FREE, works offline |
| **Authentication** | JWT | Secure, stateless |
| **Frontend** | HTML/CSS/JS + Tailwind | Responsive, accessible |

**💰 Total Cost: $0/month** (using free tiers)

---

## 📦 Installation

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (local or Atlas)
- **Google Gemini API Key** (free at [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey))
- **Chrome or Edge browser** (for Web Speech API)

### Setup Instructions

1. **Clone or navigate to project directory**
   ```bash
   cd /Users/bhuvan/Desktop/DTL_main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your-actual-gemini-key-here
   ```

4. **Start MongoDB** (if running locally)
   ```bash
   # macOS with Homebrew
   brew services start mongodb-community
   
   # Or using mongod directly
   mongod --dbpath=/path/to/your/data
   ```

5. **Seed the database** with 10 sample patients
   ```bash
   npm run seed
   ```
   
   This creates:
   - Organization: **Sandhya Old Age Home**
   - Login: `admin@sandhyahome.org` / `Admin@123`
   - 10 diverse patients (Ramesh, Lakshmi, Venkatesh, etc.)

6. **Start the server**
   ```bash
   npm start
   ```

7. **Open in browser**
   - Caretaker Login: `http://localhost:5000/caretaker/login.html`
   - Elderly Voice UI: `http://localhost:5000/elderly/voice.html`

---

## 📱 Usage Guide

### **For Caretakers**

1. **Login** at `/caretaker/login.html`
   - Email: `admin@sandhyahome.org`
   - Password: `Admin@123`

2. **Dashboard** shows all residents with risk levels
   - 🟢 Green = Normal
   - 🟡 Orange = Needs Attention
   - 🔴 Red = Critical (with blinking badge)

3. **Search patients** by name, room, or medical condition

4. **Click any patient card** to view full profile

5. **Upload medical reports** (PDF/JPG/PNG)
   - System automatically extracts text using OCR
   - Parses biomarkers (glucose, BP, creatinine, etc.)
   - Generates AI summaries in English + Kannada
   - Triggers critical alerts if needed

### **For Elderly Patients**

1. **Open** `/elderly/voice.html`

2. **Select language**: ಕನ್ನಡ or English

3. **Select your name** from the dropdown

4. **Tap the microphone button** 🎤

5. **Ask questions** like:
   - "How is my sugar?"
   - "Am I healthy?"
   - "ನನ್ನ ಆರೋಗ್ಯ ಹೇಗಿದೆ?" (How is my health?)

6. **Listen** to the AI response (spoken aloud)

---

## 👥 Sample Patients (Seed Data)

| Name | Age | Gender | Room | Conditions | Risk Level |
|------|-----|--------|------|------------|-----------|
| Ramesh Kumar | 72 | Male | A-101 | Diabetes, Hypertension | 🟡 Attention |
| Lakshmi Devi | 68 | Female | B-205 | Osteoarthritis | 🟢 Normal |
| Venkatesh Rao | 75 | Male | A-103 | Kidney Disease, Anemia | 🔴 Critical |
| Saraswati Bai | 70 | Female | C-304 | Glaucoma, Hypothyroidism | 🟡 Attention |
| Gopal Shetty | 77 | Male | A-102 | COPD, Diabetes | 🔴 Critical |
| Radha Hegde | 65 | Female | B-201 | Mild Dementia | 🟢 Normal |
| Krishnan Iyer | 80 | Male | C-301 | Heart Failure | 🔴 Critical |
| Sumitra Nair | 69 | Female | A-104 | Osteoporosis | 🟢 Normal |
| Manjunath Gowda | 73 | Male | B-203 | Prostate, Diabetes | 🟡 Attention |
| Parvati Amma | 71 | Female | C-302 | Cataract, Hypertension | 🟢 Normal |

---

## 🔬 Biomarkers Tracked

The system automatically extracts and monitors:

- **Glucose** (Normal: 70-100 mg/dL, Critical: >250 or <50)
- **HbA1c** (Normal: <5.7%, Critical: >9%)
- **Creatinine** (Normal: 0.6-1.2 mg/dL, Critical: >2.5)
- **Hemoglobin** (Normal: 12-16 g/dL, Critical: <8)
- **Total Cholesterol** (Normal: <200 mg/dL)
- **Blood Pressure** (Normal: 90-120 systolic, Critical: >180 or <90)

---

## 🚨 Critical Alert System

When a biomarker exceeds critical thresholds:

1. ⚠️ **Console alert** with patient details
2. 📝 **Log written** to `alerts.log`
3. 🔴 **Risk level updated** to "Critical"
4. 🎨 **Dashboard badge** turns red and blinks
5. (SMS feature removed as requested)

---

## 📁 Project Structure

```
DTL_main/
├── server/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── gemini.js          # Gemini AI setup
│   ├── models/
│   │   ├── Organization.js    # Old-age home schema
│   │   ├── Resident.js        # Patient schema
│   │   ├── Report.js          # Medical report schema
│   │   └── Conversation.js    # Voice chat logs
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication
│   │   └── upload.js          # File upload (Multer)
│   ├── routes/
│   │   ├── auth.js            # Login/register
│   │   ├── residents.js       # CRUD patients
│   │   ├── reports.js         # Upload/parse reports
│   │   └── voice.js           # Voice chat API
│   ├── services/
│   │   ├── ocrService.js      # Tesseract OCR
│   │   ├── biomarkerParser.js # Extract health values
│   │   ├── llmService.js      # Gemini summaries
│   │   └── alertService.js    # Critical alerts
│   ├── seeds/
│   │   └── seedData.js        # 10 sample patients
│   └── server.js              # Express app
├── client/
│   ├── caretaker/
│   │   ├── login.html         # Authentication
│   │   ├── dashboard.html     # Patient list
│   │   └── profile.html       # Patient details
│   ├── elderly/
│   │   └── voice.html         # Voice interface
│   ├── css/
│   │   └── styles.css         # Custom styles
│   └── js/
│       ├── api.js             # API helpers
│       ├── dashboard.js       # Dashboard logic
│       ├── profile.js         # Profile page logic
│       └── voice.js           # Web Speech API
├── uploads/                   # Uploaded reports
├── package.json
├── .env                       # Environment variables
└── README.md
```

---

## 🎤 Voice Interface Technical Details

### **Web Speech API**
- **Language**: `en-IN` (Indian English) for better accent recognition
- **Continuous**: `false` (one question at a time)
- **Works best in**: Chrome, Edge

### **Gemini AI Prompts**
- Warm, caring tone (like talking to grandmother)
- Simple language (3rd grade reading level)
- Max 2-3 sentences
- Avoids medical jargon and numbers
- Includes practical tip
- Ends with reassurance

### **Text-to-Speech Settings**
- **Rate**: 0.85 (slower for elderly)
- **Pitch**: 1.1 (slightly higher, friendlier)
- **Voice**: Auto-selects Indian English or Hindi voice if available

---

## 🐛 Troubleshooting

### **MongoDB Connection Error**
```bash
# Make sure MongoDB is running
brew services start mongodb-community

# Or check connection string in .env
MONGODB_URI=mongodb://localhost:27017/namma_nurse
```

### **Gemini API Error**
```bash
# Verify your API key is correct in .env
# Get a new key at: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your-actual-key-here
```

### **Voice Recognition Not Working**
- Use **Chrome** or **Edge** browser
- Allow microphone permissions when prompted
- Ensure you're on `localhost` (not `127.0.0.1`)
- Check browser console for errors

### **OCR Not Extracting Text**
- Ensure report has **clear, printed text** (not handwritten)
- Supported formats: PDF, JPG, PNG
- Max file size: 10MB

---

## 🚀 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] WhatsApp bot integration
- [ ] Video call with doctors
- [ ] Medication reminders
- [ ] Fall detection sensors
- [ ] Family portal
- [ ] Multi-language support (Tamil, Telugu, Hindi)
- [ ] Offline mode with service workers

---

## 📄 License

MIT License - Free to use and modify

---

## 🙏 Acknowledgments

- **Google Gemini** for free AI API
- **Web Speech API** for free STT/TTS
- **Tesseract.js** for open-source OCR
- **Tailwind CSS** for styling

---

## 📞 Support

For issues or questions:
- Check the logs in `alerts.log`
- Review browser console for errors
- Ensure all dependencies are installed
- Verify MongoDB is running

---

**Built with ❤️ for elderly care in Karnataka**

🏥 **Namma Nurse** - "Your health, our care"
