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
        regex: /(?:glucose|sugar|blood\s*sugar|fasting\s*glucose|avg\s*glucose|average\s*glucose|fasting\s*sugar|FBS|PPBS|random\s*glucose|glucose\s*fasting)[\s:]*(\d+\.?\d*)\s*(mg\/dL|mmol\/L)?/gi,
        normalRange: '70-100 mg/dL',
        getName: () => 'Glucose (Fasting)'
    },
    hba1c: {
        regex: /(?:HbA1c|Hemoglobin\s*A1c|Glycated\s*Hemoglobin|A1C|Hb\s*A1c)[\s:]*(\d+\.?\d*)\s*(%)?/gi,
        normalRange: '< 5.7%',
        getName: () => 'HbA1c'
    },
    creatinine: {
        regex: /(?:creatinine|serum\s*creatinine|s\.\s*creatinine)[\s:]*(\d+\.?\d*)\s*(mg\/dL)?/gi,
        normalRange: '0.6-1.2 mg/dL',
        getName: () => 'Creatinine'
    },
    hemoglobin: {
        regex: /(?:hemoglobin|Hb|Hgb|haemoglobin)[\s:]*(\d+\.?\d*)\s*(g\/dL)?/gi,
        normalRange: '12-16 g/dL',
        getName: () => 'Hemoglobin'
    },
    cholesterol: {
        regex: /(?:total\s*cholesterol|cholesterol|serum\s*cholesterol)[\s:]*(\d+\.?\d*)\s*(mg\/dL)?/gi,
        normalRange: '< 200 mg/dL',
        getName: () => 'Cholesterol (Total)'
    },
    bp_systolic: {
        regex: /(?:blood\s*pressure|BP|systolic)[\s:]*(\d+)\/\d+\s*(mmHg)?/gi,
        normalRange: '90-120 mmHg',
        getName: () => 'Blood Pressure'
    },
    vitaminD: {
        regex: /(?:vitamin\s*D|vit\s*D|25-OH\s*D)[\s:]*(\d+\.?\d*)\s*(ng\/mL)?/gi,
        normalRange: '30-100 ng/mL',
        getName: () => 'Vitamin D'
    },
    vitaminB12: {
        regex: /(?:vitamin\s*B12|vit\s*B12|B12)[\s:]*(\d+\.?\d*)\s*(pg\/mL)?/gi,
        normalRange: '200-900 pg/mL',
        getName: () => 'Vitamin B12'
    },
    tsh: {
        regex: /(?:TSH|thyroid\s*stimulating\s*hormone)[\s:]*(\d+\.?\d*)\s*(μIU\/mL|mIU\/L)?/gi,
        normalRange: '0.4-4.0 μIU/mL',
        getName: () => 'TSH'
    },
    calcium: {
        regex: /(?:calcium|serum\s*calcium|Ca)[\s:]*(\d+\.?\d*)\s*(mg\/dL)?/gi,
        normalRange: '8.5-10.2 mg/dL',
        getName: () => 'Calcium'
    }
};

/**
 * Normalize biomarker name to match standard names
 * This allows "Avg Glucose" to match "Glucose (Fasting)", etc.
 */
const normalizeBiomarkerName = (name) => {
    const normalizedInput = name.toLowerCase().trim();

    // Define aliases for each biomarker
    const aliases = {
        'Glucose (Fasting)': [
            'glucose', 'fasting glucose', 'avg glucose', 'average glucose',
            'blood sugar', 'fasting sugar', 'sugar fasting', 'glucose fasting',
            'fbs', 'ppbs', 'random glucose', 'sugar', 'blood glucose'
        ],
        'HbA1c': [
            'hba1c', 'hemoglobin a1c', 'glycated hemoglobin', 'a1c', 'hb a1c'
        ],
        'Creatinine': [
            'creatinine', 'serum creatinine', 's. creatinine', 'creat'
        ],
        'Hemoglobin': [
            'hemoglobin', 'hb', 'hgb', 'haemoglobin'
        ],
        'Cholesterol (Total)': [
            'cholesterol', 'total cholesterol', 'serum cholesterol', 'chol'
        ],
        'Blood Pressure': [
            'blood pressure', 'bp', 'systolic', 'diastolic'
        ],
        'Vitamin D': [
            'vitamin d', 'vit d', '25-oh d', 'vitd'
        ],
        'Vitamin B12': [
            'vitamin b12', 'vit b12', 'b12', 'vitb12'
        ],
        'TSH': [
            'tsh', 'thyroid stimulating hormone', 'thyroid'
        ],
        'Calcium': [
            'calcium', 'serum calcium', 'ca'
        ],
        'T3': [
            't3', 'triiodothyronine'
        ],
        'T4': [
            't4', 'thyroxine'
        ],
        'Urea': [
            'urea', 'blood urea', 'bun'
        ],
        'PSA': [
            'psa', 'prostate specific antigen'
        ]
    };

    // Check each alias set
    for (const [standardName, aliasList] of Object.entries(aliases)) {
        // Check if input matches any alias
        if (aliasList.some(alias => normalizedInput.includes(alias) || alias.includes(normalizedInput))) {
            return standardName;
        }
    }

    // If no match, return original name (capitalized)
    return name;
};

/**
 * Parse biomarkers from OCR text
 */
const parseBiomarkers = (ocrText) => {
    console.log('🔬 Parsing biomarkers from OCR text...');
    console.log('📝 OCR Text preview:', ocrText.substring(0, 300) + (ocrText.length > 300 ? '...' : ''));

    const biomarkers = [];

    for (const [key, pattern] of Object.entries(BIOMARKER_PATTERNS)) {
        const matches = [...ocrText.matchAll(pattern.regex)];

        if (matches.length > 0) {
            // Take the first match
            const match = matches[0];
            let value = parseFloat(match[1]);
            const unit = match[2] || CRITICAL_THRESHOLDS[key]?.unit || '';

            if (!isNaN(value)) {
                // Validate and normalize values to catch OCR errors
                // Common: glucose 9680 → 96.80, HbA1c 90 → 9.0
                value = normalizeValue(key, value);

                if (value === null) {
                    console.log(`⚠️ Skipped ${pattern.getName()}: unrealistic value`);
                    continue;
                }

                const status = determineStatus(key, value);

                // Use standardized name
                const standardName = pattern.getName();

                biomarkers.push({
                    name: standardName,
                    value: value.toString(),
                    unit: unit,
                    normalRange: pattern.normalRange,
                    status: status
                });

                console.log(`✅ Found ${standardName}: ${value} ${unit} [${status}]`);
            }
        }
    }

    console.log(`📊 Total biomarkers found: ${biomarkers.length}`);
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

module.exports = {
    parseBiomarkers,
    hasCriticalValues,
    normalizeBiomarkerName,
    CRITICAL_THRESHOLDS
};

