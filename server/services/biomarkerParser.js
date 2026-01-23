/**
 * Critical thresholds for biomarkers
 */
const CRITICAL_THRESHOLDS = {
    glucose: { high: 250, low: 50, unit: 'mg/dL' },
    hba1c: { high: 9, unit: '%' },
    creatinine: { high: 2.5, unit: 'mg/dL' },
    hemoglobin: { low: 8, unit: 'g/dL' },
    bp_systolic: { high: 180, low: 90, unit: 'mmHg' }
};

/**
 * Biomarker patterns for extraction
 */
const BIOMARKER_PATTERNS = {
    glucose: {
        regex: /(?:glucose|sugar|blood\s*sugar|fasting\s*glucose|FBS|PPBS|random\s*glucose)[\s:]*(\d+\.?\d*)\s*(mg\/dL|mmol\/L)?/gi,
        normalRange: '70-100 mg/dL',
        getName: () => 'Glucose'
    },
    hba1c: {
        regex: /(?:HbA1c|Hemoglobin\s*A1c|Glycated\s*Hemoglobin)[\s:]*(\d+\.?\d*)\s*(%)?/gi,
        normalRange: '< 5.7%',
        getName: () => 'HbA1c'
    },
    creatinine: {
        regex: /(?:creatinine|serum\s*creatinine)[\s:]*(\d+\.?\d*)\s*(mg\/dL)?/gi,
        normalRange: '0.6-1.2 mg/dL',
        getName: () => 'Creatinine'
    },
    hemoglobin: {
        regex: /(?:hemoglobin|Hb|Hgb)[\s:]*(\d+\.?\d*)\s*(g\/dL)?/gi,
        normalRange: '12-16 g/dL',
        getName: () => 'Hemoglobin'
    },
    cholesterol: {
        regex: /(?:total\s*cholesterol|cholesterol)[\s:]*(\d+\.?\d*)\s*(mg\/dL)?/gi,
        normalRange: '< 200 mg/dL',
        getName: () => 'Total Cholesterol'
    },
    bp_systolic: {
        regex: /(?:blood\s*pressure|BP)[\s:]*(\d+)\/\d+\s*(mmHg)?/gi,
        normalRange: '90-120 mmHg',
        getName: () => 'Blood Pressure (Systolic)'
    }
};

/**
 * Parse biomarkers from OCR text
 */
const parseBiomarkers = (ocrText) => {
    const biomarkers = [];

    for (const [key, pattern] of Object.entries(BIOMARKER_PATTERNS)) {
        const matches = [...ocrText.matchAll(pattern.regex)];

        if (matches.length > 0) {
            // Take the first match
            const match = matches[0];
            const value = parseFloat(match[1]);
            const unit = match[2] || CRITICAL_THRESHOLDS[key]?.unit || '';

            if (!isNaN(value)) {
                const status = determineStatus(key, value);

                biomarkers.push({
                    name: pattern.getName(),
                    value: value.toString(),
                    unit: unit,
                    normalRange: pattern.normalRange,
                    status: status
                });

                console.log(`✅ Found ${pattern.getName()}: ${value} ${unit} [${status}]`);
            }
        }
    }

    return biomarkers;
};

/**
 * Determine biomarker status based on thresholds
 */
const determineStatus = (key, value) => {
    const threshold = CRITICAL_THRESHOLDS[key];

    if (!threshold) return 'normal';

    if (threshold.high && value >= threshold.high) {
        return 'critical';
    } else if (threshold.high && value > threshold.high * 0.85) {
        return 'high';
    } else if (threshold.low && value <= threshold.low) {
        return 'critical';
    } else if (threshold.low && value < threshold.low * 1.15) {
        return 'low';
    }

    return 'normal';
};

/**
 * Check if any biomarker is critical
 */
const hasCriticalValues = (biomarkers) => {
    return biomarkers.some(b => b.status === 'critical');
};

module.exports = {
    parseBiomarkers,
    hasCriticalValues,
    CRITICAL_THRESHOLDS
};
