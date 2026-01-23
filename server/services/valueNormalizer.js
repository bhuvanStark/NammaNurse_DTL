/**
 * Normalize biomarker values to fix common OCR errors
 */
const normalizeValue = (key, value) => {
    if (key === 'glucose') {
        // Glucose should be 20-600 mg/dL
        if (value > 1000) value = value / 100; // 9680 → 96.80
        if (value < 20 || value > 600) return null;
    }
    if (key === 'hba1c') {
        // HbA1c should be 3-20%
        if (value > 50) value = value / 10; // 90 → 9.0
        if (value < 3 || value > 20) return null;
    }
    if (key === 'cholesterol') {
        if (value > 1000) value = value / 10;
        if (value < 50 || value > 500) return null;
    }
    if (key === 'creatinine') {
        if (value > 100) value = value / 100;
        if (value < 0.1 || value > 20) return null;
    }
    if (key === 'hemoglobin') {
        if (value > 100) value = value / 10;
        if (value < 3 || value > 25) return null;
    }
    return value;
};

module.exports = { normalizeValue };
