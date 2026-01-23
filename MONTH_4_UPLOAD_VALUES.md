# 📄 Month 4 Upload Values - For Live Demo

**Purpose:** These are the exact biomarker values you should include in your sample medical reports for the live upload demo (Month 4 = January 2026).

---

## 🧓 Ramesh Kumar - January 2026 Report

**Use this for your main demo patient.**

### Blood Test Results

| Test Name | Value | Unit | Normal Range | Status |
|-----------|-------|------|--------------|--------|
| **Glucose (Fasting)** | 182 | mg/dL | 70-100 | High ⚠️ |
| **HbA1c** | 8.2 | % | 4.0-5.6 | High ⚠️ |
| **Cholesterol (Total)** | 238 | mg/dL | <200 | High ⚠️ |
| **LDL Cholesterol** | 165 | mg/dL | <100 | High ⚠️ |
| **HDL Cholesterol** | 38 | mg/dL | >40 | Low ⚠️ |
| **Triglycerides** | 185 | mg/dL | <150 | High ⚠️ |
| **Blood Pressure** | 142/90 | mmHg | <120/80 | High ⚠️ |
| **Hemoglobin** | 12.9 | g/dL | 13.5-17.5 | Normal ✓ |
| **Creatinine** | 1.1 | mg/dL | 0.7-1.3 | Normal ✓ |

### Expected AI Summary

**English:**
> "Blood sugar continues to rise at 182 mg/dL and HbA1c is 8.2%. Cholesterol is high at 238 mg/dL. Blood pressure is borderline elevated. Strict diet control needed. Reduce sweets, rice, and oily foods. Increase vegetables, dal, and walking. Monitor sugar levels weekly."

**Kannada:**
> "ರಕ್ತದಲ್ಲಿ ಸಕ್ಕರೆ ಇನ್ನೂ ಹೆಚ್ಚಾಗಿದೆ - 182 mg/dL. HbA1c 8.2%. ಕೊಲೆಸ್ಟ್ರಾಲ್ ಹೆಚ್ಚು. ಆಹಾರ ನಿಯಂತ್ರಣ ಬಹಳ ಮುಖ್ಯ. ಸಿಹಿ, ಅಕ್ಕಿ, ಎಣ್ಣೆ ತಪ್ಪಿಸಿ."

---

## 🧓 Venkatesh Rao - January 2026 Report

**Use this for kidney disease demo.**

### Blood Test Results

| Test Name | Value | Unit | Normal Range | Status |
|-----------|-------|------|--------------|--------|
| **Creatinine** | 1.9 | mg/dL | 0.7-1.3 | High ⚠️ |
| **Urea** | 55 | mg/dL | 15-40 | High ⚠️ |
| **Hemoglobin** | 9.8 | g/dL | 13.5-17.5 | Low ⚠️ |
| **Potassium** | 5.2 | mEq/L | 3.5-5.0 | High ⚠️ |
| **Sodium** | 138 | mEq/L | 135-145 | Normal ✓ |
| **eGFR** | 42 | mL/min | >60 | Low ⚠️ |

### Expected AI Summary

**English:**
> "Kidney function declining. Creatinine increased to 1.9 mg/dL and eGFR dropped to 42. Anemia worsening with hemoglobin at 9.8. Requires immediate nephrologist consultation. Reduce protein intake, avoid salty foods, drink adequate water. Monitor potassium levels closely."

---

## 🧓 Krishnan Iyer - January 2026 Report

**Use this for heart disease demo.**

### Blood Test Results

| Test Name | Value | Unit | Normal Range | Status |
|-----------|-------|------|--------------|--------|
| **Cholesterol (Total)** | 212 | mg/dL | <200 | High ⚠️ |
| **LDL** | 135 | mg/dL | <100 | High ⚠️ |
| **HDL** | 46 | mg/dL | >40 | Normal ✓ |
| **Triglycerides** | 155 | mg/dL | <150 | High ⚠️ |
| **Blood Pressure** | 135/82 | mmHg | <120/80 | High ⚠️ |
| **Hemoglobin** | 13.8 | g/dL | 13.5-17.5 | Normal ✓ |

### Expected AI Summary

**English:**
> "Cholesterol improving but still elevated at 212 mg/dL. Overall downward trend is positive. Blood pressure controlled. Continue low-fat diet and medication. Good progress over 4 months."

---

## 📝 How to Create a Fake Medical Report PDF

### Option 1: Simple Text Document

Create a document with this format:

```
SANDHYA DIAGNOSTIC CENTER
Bangalore, Karnataka

BLOOD CHEMISTRY REPORT
---------------------------
Patient: Ramesh Kumar
Age: 72 Years | Gender: Male
Date: January 15, 2026
Report ID: SDC/2026/0115

TEST RESULTS
---------------------------

DIABETES PANEL
Glucose (Fasting)          182 mg/dL    (70-100)      HIGH
HbA1c                      8.2%         (4.0-5.6)     HIGH

LIPID PROFILE
Cholesterol (Total)        238 mg/dL    (<200)        HIGH
LDL Cholesterol           165 mg/dL    (<100)        HIGH
HDL Cholesterol           38 mg/dL     (>40)         LOW
Triglycerides             185 mg/dL    (<150)        HIGH

GENERAL
Hemoglobin                12.9 g/dL    (13.5-17.5)   NORMAL
Creatinine                1.1 mg/dL    (0.7-1.3)     NORMAL

VITALS
Blood Pressure            142/90 mmHg  (<120/80)     HIGH

---------------------------
Dr. Suresh Nair
Pathologist
Sandhya Diagnostic Center
```

**Save as PDF:** File → Save as PDF → Name it `Ramesh_Jan_2026.pdf`

---

### Option 2: Use Google Docs

1. Create a new Google Doc
2. Paste the report format above
3. Make it look professional:
   - Use **bold** for test names
   - Use a **monospace font** for tables
   - Add a header with clinic name
4. Download as PDF

---

### Option 3: Take a Screenshot

1. Find any real blood test report online (for reference only)
2. Use image editing to change:
   - Patient name → Ramesh Kumar
   - Date → January 15, 2026
   - Values → Use the values from table above
3. Save as JPG or PNG

**Note:** The system accepts PDF, JPG, and PNG files.

---

## 🎯 Testing Before Demo

### Step 1: Upload Test

1. Open Ramesh Kumar's profile
2. Upload your `Ramesh_Jan_2026.pdf`
3. Wait for processing (10-30 seconds)
4. Check if biomarkers are extracted correctly

**If extraction fails:**
- Try a clearer image
- Make sure text is typed, not handwritten
- Use higher resolution
- Check that file size is under 10MB

---

### Step 2: Graph Test

After upload, verify:
- ✅ Graphs show 4 data points (Oct, Nov, Dec, Jan)
- ✅ Values match what you uploaded
- ✅ Trend lines are smooth
- ✅ Red threshold line is visible

---

### Step 3: Voice Test

1. Open voice interface
2. Select Ramesh Kumar
3. Ask: "How is my sugar?"
4. Verify AI mentions **182 mg/dL** (the Jan value, not Dec)

---

## 📊 Expected Month-by-Month Progression

### Ramesh Kumar - Glucose Trend

| Month | Glucose | HbA1c | Cholesterol | Trend |
|-------|---------|-------|-------------|-------|
| **Oct 2025** | 155 mg/dL | 7.3% | 205 mg/dL | 📈 Rising |
| **Nov 2025** | 162 mg/dL | 7.6% | 215 mg/dL | 📈 Rising |
| **Dec 2025** | 170 mg/dL | 7.9% | 225 mg/dL | 📈 Rising |
| **Jan 2026** | 182 mg/dL | 8.2% | 238 mg/dL | 📈 Worsening |

**Demo Talking Point:**
> "Notice the consistent upward trend. This is realistic diabetes progression when diet is not controlled. The system helps caretakers intervene before it becomes critical."

---

### Venkatesh Rao - Kidney Trend

| Month | Creatinine | Hemoglobin | Trend |
|-------|------------|------------|-------|
| **Oct 2025** | 1.6 mg/dL | 10.8 g/dL | ⚠️ Concerning |
| **Nov 2025** | 1.7 mg/dL | 10.5 g/dL | 📉 Declining |
| **Dec 2025** | 1.8 mg/dL | 10.2 g/dL | 📉 Critical |
| **Jan 2026** | 1.9 mg/dL | 9.8 g/dL | 🚨 Urgent |

**Demo Talking Point:**
> "Venkatesh's kidney function is clearly declining. The graphs make this immediately visible. Without longitudinal tracking, you'd only know 'it's high' - not 'it's getting worse'."

---

## 🔥 Backup Upload Values (If You Need Multiple Demos)

### Gopal Shetty - January 2026

| Test | Value |
|------|-------|
| Glucose (Fasting) | 155 mg/dL ⚠️ |
| HbA1c | 7.7% ⚠️ |
| Oxygen Saturation | 92% ⚠️ |

---

### Lakshmi Devi - January 2026

| Test | Value |
|------|-------|
| Vitamin D | 29 ng/mL (still low, but improving) |
| Calcium | 9.4 mg/dL ✓ |

---

## 💡 Pro Tips

1. **Keep values believable** - Don't use extreme numbers
2. **Show slow trends** - Not dramatic jumps
3. **Have 2-3 PDFs ready** - In case upload fails
4. **Test OCR accuracy** - Before the actual demo
5. **Practice the upload flow** - Know how long it takes

---

## 🎬 Demo Day Checklist

- [ ] Server is running (`npm start`)
- [ ] Database has 30 reports seeded
- [ ] Upload PDFs are ready
- [ ] Browser tabs are open
- [ ] Microphone permissions granted
- [ ] Internet connection is stable
- [ ] Demo script is memorized
- [ ] Backup plan ready if demo fails

---

**You got this! 🔥**
