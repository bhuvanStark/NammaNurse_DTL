# ❓ FAQ - Common Questions About Namma Nurse

---

## 🗄️ Data Persistence

### Q: If I close the server, is all data lost?

**A: NO! All data persists in MongoDB.**

MongoDB stores data permanently on disk. When you stop the server and restart it:

- ✅ **All 10 patients** remain in the database
- ✅ **All 30 seeded reports** (3 per patient) remain
- ✅ **All uploaded reports** remain
- ✅ **All graphs and trends** remain

**You only need to seed ONCE.** After that, data persists forever (until you manually delete it).

---

### Q: When do I need to run `npm run seed` again?

**Only in these cases:**

1. **First time setup** - To create the 10 patients
2. **Want fresh start** - If you want to reset all patients to original state
3. **Database was dropped** - If you manually deleted the MongoDB database

**Note:** Running `npm run seed` will:
- ❌ Delete ALL existing residents
- ❌ Delete ALL existing reports (including your uploads!)
- ✅ Create fresh 10 patients

**Note:** Running `npm run seed-history` will:
- ❌ Delete ALL existing reports (but keeps patients!)
- ✅ Re-create the 3-month history for each patient

---

### Q: What happens when I upload a new report?

**A: It gets added as the NEXT MONTH automatically!**

The system:
1. Finds the last report's month number (e.g., December 2025 was Month 3)
2. Creates yours as Month 4
3. Generates a label like "Jan 2026"
4. **Graphs auto-update** to show 4 data points instead of 3

Example:
- Existing: Oct, Nov, Dec (Month 1, 2, 3)
- You upload → **Jan 2026 (Month 4)**
- Graphs now show: Oct → Nov → Dec → **Jan**

---

## 📊 Biomarker Selection

### Q: Why don't Saraswati and Radha show graphs?

**A: FIXED! Now they do!**

The system now displays graphs for **ALL biomarkers**, not just disease-specific ones:

**Saraswati** (Hypothyroidism):
- ✅ **TSH Trend** (Thyroid marker)
- ✅ **T3 Trend**
- ✅ **T4 Trend**

**Radha** (Mild Dementia):
- ✅ **Vitamin B12 Trend**
- ✅ **Glucose Trend**
- ✅ **Thyroid (TSH) Trend**

**Fallback Logic:** If no disease-specific biomarkers exist, the system shows ANY biomarker with at least 2 data points.

---

### Q: Can I choose which biomarkers to monitor?

**A: Yes! There are 2 ways:**

#### Method 1: Patient Conditions (Automatic)

When you add a patient with specific conditions, graphs auto-select:

| Condition | Auto-Selected Graphs |
|-----------|---------------------|
| Diabetes | Glucose + HbA1c + Cholesterol |
| Kidney Disease | Creatinine + Hemoglobin + Urea |
| Heart / Hypertension | Cholesterol + Blood Pressure |
| Thyroid | TSH + T3 + T4 |
| Osteoporosis | Vitamin D + Calcium |
| Dementia | Vitamin B12 + Glucose |
| Prostate | PSA + Glucose (if diabetic) |
| Anemia | Hemoglobin |

#### Method 2: Upload Reports (Manual)

Whatever biomarkers are in your uploaded PDF will be tracked!

For example, if your blood report includes:
- Glucose
- Creatinine
- Vitamin D

Then those 3 will appear in the graphs (if they meet the patient's condition or fallback logic).

---

### Q: How do I add custom biomarkers to monitor?

**A: Just upload a report containing them!**

The system auto-detects these biomarkers from reports:

**Currently Supported:**
- Glucose (Fasting)
- HbA1c
- Cholesterol (Total / LDL / HDL)
- Triglycerides
- Blood Pressure
- Creatinine
- Urea
- Hemoglobin
- Vitamin D
- Vitamin B12
- Calcium
- TSH, T3, T4
- PSA
- eGFR
- Potassium
- Sodium
- Phosphorus
- ESR

**To add more:**
1. Edit `server/services/biomarkerParser.js` - Add regex patterns
2. Edit `client/js/profile.js` - Add to `biomarkerConfig` object
3. Restart server

---

## 📈 Graph Updates

### Q: Why don't graphs update after I upload a new report?

**A: FIXED! They now auto-update.**

After uploading:
1. Wait for processing (10-30 seconds)
2. The report history will refresh
3. **Graphs will automatically recalculate** and show the new month
4. You'll see a 4th data point added to the trend lines

**If graphs still don't update:**
- Refresh the page (F5)
- Check browser console for errors
- Ensure the biomarkers in your PDF match existing ones exactly:
  - ✅ "Glucose (Fasting)" - Correct
  - ❌ "Blood Sugar Fasting" - Won't match

---

## 🗑️ Delete Feature

### Q: Can I delete reports?

**A: Yes! Every report has a Delete button.**

When you delete a report:
1. ✅ Report is removed from database
2. ✅ File is deleted from uploads/ folder
3. ✅ **Graphs automatically recalculate** without that data point
4. ✅ Month numbers stay the same (gaps are OK)

Example:
- Before: Oct (1) → Nov (2) → Dec (3)
- Delete Nov
- After: Oct (1) → Dec (3) ← Gap at month 2, but fine!

---

## 📊 Graph Behavior

### Q: What if a patient has multiple conditions?

**A: System shows graphs for ALL conditions!**

Example: **Gopal Shetty** has COPD + Diabetes

Graphs shown:
1. Glucose Trend (diabetes)
2. HbA1c Trend (diabetes)
3. Oxygen Saturation Trend (COPD)

**Maximum:** Up to 3 graphs per patient (for clean UI)

---

### Q: What if a patient has no specific conditions?

**A: System shows ANY available biomarkers.**

Fallback priority:
1. Glucose
2. HbA1c
3. Cholesterol
4. Hemoglobin
5. Blood Pressure
6. Creatinine
7. Vitamin D
8. Vitamin B12
9. TSH
10. Calcium

Shows first 3 biomarkers with at least 2 data points.

---

## 📝 Data Requirements

### Q: How many reports do I need to see graphs?

**A: Minimum 2 reports per patient.**

- 1 report = No trend (just a single point)
- 2 reports = Shows a trend line
- 3+ reports = Clear pattern emerges

That's why we seed with **3 months** of history!

---

### Q: How do I add more months of historical data?

**Option 1: Upload real PDFs**
- Upload Month 4, Month 5, etc. manually

**Option 2: Edit seed script**
- Edit `server/seeds/monthlyHistory.js`
- Add Month 4, 5, 6 data
- Run `npm run seed-history`

**Option 3: Use API**
- Use Postman or cURL to POST to `/api/reports/upload`
- Set custom `monthIndex` and `monthLabel`

---

## 🔄 Resetting Data

### Q: How do I reset just the reports (keep patients)?

```bash
# This deletes ALL reports but keeps 10 patients
npm run seed-history
```

---

### Q: How do I reset everything (patients + reports)?

```bash
# This deletes EVERYTHING and re-creates from scratch
npm run seed
npm run seed-history
```

---

### Q: How do I delete all data manually?

**Option 1: MongoDB Compass**
1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017/namma_nurse`
3. Drop collections: `residents`, `reports`

**Option 2: Command Line**
```bash
mongosh namma_nurse --eval "db.residents.deleteMany({})"
mongosh namma_nurse --eval "db.reports.deleteMany({})"
```

**Option 3: Drop Entire Database**
```bash
mongosh namma_nurse --eval "db.dropDatabase()"
```

---

## 🚀 Advanced Usage

### Q: Can I add more patients beyond the seeded 10?

**A: Yes!**

**Option 1: Via UI** (if you build an admin panel)
- Currently not implemented in UI

**Option 2: Via Seed Script**
1. Edit `server/seeds/seedData.js`
2. Add more patients to the array
3. Run `npm run seed`

**Option 3: Via API/Postman**
- POST to `/api/residents/add` (requires auth)

---

### Q: Can I customize the graph colors?

**A: Yes!**

Edit `client/js/profile.js`:

```javascript
const biomarkerConfig = {
  'Glucose (Fasting)': { 
    title: 'Blood Sugar Trend', 
    color: '#FF0000',  // ← Change this
    criticalLine: 126 
  },
  // ... more biomarkers
};
```

Restart not needed - just refresh browser.

---

### Q: Can I change the critical thresholds?

**A: Yes!**

Edit `client/js/profile.js`:

```javascript
const biomarkerConfig = {
  'Glucose (Fasting)': { 
    title: 'Blood Sugar Trend', 
    color: '#3B82F6',
    criticalLine: 140  // ← Change this (was 126)
  }
};
```

This changes the **red dashed line** on the graph.

---

## 🛠️ Troubleshooting

### Q: Graphs show "Loading..." forever

**Possible causes:**
1. No reports in database
2. Reports missing `monthLabel` field
3. JavaScript error in console

**Fix:**
- Open browser console (F12)
- Look for errors
- Run `npm run seed-history` to re-create reports

---

### Q: Upload works but graphs don't show new data

**Possible causes:**
1. Biomarker names don't match exactly
2. Browser cache issue
3. monthLabel not generated

**Fix:**
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Check server logs for monthLabel creation
- Ensure PDF has clear, parseable biomarker names

---

### Q: Error: "Insufficient biomarker data for trend visualization"

**Causes:**
- Patient has less than 2 reports
- Biomarker names don't match any in the config
- Reports missing biomarkers array

**Fix:**
- Upload at least 2 reports
- Check biomarker names match exactly (case-sensitive!)
- Run `npm run seed-history` to get sample data

---

## 📞 Quick Command Reference

| Task | Command |
|------|---------|
| **Start server** | `npm start` |
| **Seed 10 patients** | `npm run seed` |
| **Seed 3-month history** | `npm run seed-history` |
| **Reset everything** | `npm run seed && npm run seed-history` |
| **Check MongoDB status** | `brew services list \| grep mongodb` |
| **Start MongoDB** | `brew services start mongodb-community@7.0` |
| **Open MongoDB shell** | `mongosh namma_nurse` |
| **Drop database** | `mongosh namma_nurse --eval "db.dropDatabase()"` |

---

**Remember:**
- ✅ Data persists in MongoDB (survives server restarts)
- ✅ Graphs auto-update when you upload/delete reports
- ✅ All patients now show graphs (no more "Insufficient data")
- ✅ New uploads auto-generate month labels
- ✅ Delete works and recalculates graphs

**You're all set! 🚀**
