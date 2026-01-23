/**
 * Seed 3-month medical history for 10 patients
 * Realistic, slow-trending biomarkers for clinical monitoring demo
 */

const mongoose = require('mongoose');
const Resident = require('../models/Resident');
const Report = require('../models/Report');
require('dotenv').config();

// Helper to create biomarkers
const createBiomarkers = (values) => {
    return Object.entries(values).map(([name, data]) => ({
        name,
        value: data.value.toString(),
        unit: data.unit,
        normalRange: data.normalRange,
        status: data.status || 'normal'
    }));
};

// 3-Month History Data for Each Patient
const patientHistories = {
    'Ramesh Kumar': [
        // Month 1 - October 2025
        {
            monthIndex: 1,
            monthLabel: 'Oct 2025',
            biomarkers: createBiomarkers({
                'Glucose (Fasting)': { value: 155, unit: 'mg/dL', normalRange: '70-100', status: 'high' },
                'HbA1c': { value: 7.3, unit: '%', normalRange: '4.0-5.6', status: 'high' },
                'Cholesterol (Total)': { value: 205, unit: 'mg/dL', normalRange: '<200', status: 'high' },
                'Blood Pressure': { value: '135/85', unit: 'mmHg', normalRange: '<120/80', status: 'high' },
                'Hemoglobin': { value: 13.2, unit: 'g/dL', normalRange: '13.5-17.5', status: 'normal' }
            }),
            summary: 'Blood sugar slightly elevated. Cholesterol borderline. Continue diet control.'
        },
        // Month 2 - November 2025
        {
            monthIndex: 2,
            monthLabel: 'Nov 2025',
            biomarkers: createBiomarkers({
                'Glucose (Fasting)': { value: 162, unit: 'mg/dL', normalRange: '70-100', status: 'high' },
                'HbA1c': { value: 7.6, unit: '%', normalRange: '4.0-5.6', status: 'high' },
                'Cholesterol (Total)': { value: 215, unit: 'mg/dL', normalRange: '<200', status: 'high' },
                'Blood Pressure': { value: '138/87', unit: 'mmHg', normalRange: '<120/80', status: 'high' },
                'Hemoglobin': { value: 13.1, unit: 'g/dL', normalRange: '13.5-17.5', status: 'normal' }
            }),
            summary: 'Sugar trend rising. Needs better dietary control. Monitor closely.'
        },
        // Month 3 - December 2025
        {
            monthIndex: 3,
            monthLabel: 'Dec 2025',
            biomarkers: createBiomarkers({
                'Glucose (Fasting)': { value: 170, unit: 'mg/dL', normalRange: '70-100', status: 'high' },
                'HbA1c': { value: 7.9, unit: '%', normalRange: '4.0-5.6', status: 'high' },
                'Cholesterol (Total)': { value: 225, unit: 'mg/dL', normalRange: '<200', status: 'high' },
                'Blood Pressure': { value: '140/88', unit: 'mmHg', normalRange: '<120/80', status: 'high' },
                'Hemoglobin': { value: 13.0, unit: 'g/dL', normalRange: '13.5-17.5', status: 'low' }
            }),
            summary: 'Glucose continues to rise. Requires stricter diet and possible medication review.'
        }
    ],

    'Lakshmi Devi': [
        // Improving Vitamin D trend
        {
            monthIndex: 1,
            monthLabel: 'Oct 2025',
            biomarkers: createBiomarkers({
                'Vitamin D': { value: 18, unit: 'ng/mL', normalRange: '30-100', status: 'low' },
                'Calcium': { value: 8.9, unit: 'mg/dL', normalRange: '8.5-10.2', status: 'normal' },
                'Hemoglobin': { value: 12.5, unit: 'g/dL', normalRange: '12.0-15.5', status: 'normal' },
                'ESR': { value: 28, unit: 'mm/hr', normalRange: '<20', status: 'high' }
            }),
            summary: 'Vitamin D deficiency detected. Started supplements and sunlight exposure.'
        },
        {
            monthIndex: 2,
            monthLabel: 'Nov 2025',
            biomarkers: createBiomarkers({
                'Vitamin D': { value: 22, unit: 'ng/mL', normalRange: '30-100', status: 'low' },
                'Calcium': { value: 9.1, unit: 'mg/dL', normalRange: '8.5-10.2', status: 'normal' },
                'Hemoglobin': { value: 12.6, unit: 'g/dL', normalRange: '12.0-15.5', status: 'normal' },
                'ESR': { value: 26, unit: 'mm/hr', normalRange: '<20', status: 'high' }
            }),
            summary: 'Vitamin D improving with supplements. Continue current regimen.'
        },
        {
            monthIndex: 3,
            monthLabel: 'Dec 2025',
            biomarkers: createBiomarkers({
                'Vitamin D': { value: 26, unit: 'ng/mL', normalRange: '30-100', status: 'low' },
                'Calcium': { value: 9.3, unit: 'mg/dL', normalRange: '8.5-10.2', status: 'normal' },
                'Hemoglobin': { value: 12.7, unit: 'g/dL', normalRange: '12.0-15.5', status: 'normal' },
                'ESR': { value: 24, unit: 'mm/hr', normalRange: '<20', status: 'high' }
            }),
            summary: 'Vitamin D levels steadily improving. Joint pain slightly reduced.'
        }
    ],

    'Venkatesh Rao': [
        // Kidney disease worsening
        {
            monthIndex: 1,
            monthLabel: 'Oct 2025',
            biomarkers: createBiomarkers({
                'Creatinine': { value: 1.6, unit: 'mg/dL', normalRange: '0.7-1.3', status: 'high' },
                'Hemoglobin': { value: 10.8, unit: 'g/dL', normalRange: '13.5-17.5', status: 'low' },
                'Urea': { value: 45, unit: 'mg/dL', normalRange: '15-40', status: 'high' },
                'Potassium': { value: 4.8, unit: 'mEq/L', normalRange: '3.5-5.0', status: 'normal' }
            }),
            summary: 'Mild kidney strain. Hemoglobin slightly low. Monitor kidney function.'
        },
        {
            monthIndex: 2,
            monthLabel: 'Nov 2025',
            biomarkers: createBiomarkers({
                'Creatinine': { value: 1.7, unit: 'mg/dL', normalRange: '0.7-1.3', status: 'high' },
                'Hemoglobin': { value: 10.5, unit: 'g/dL', normalRange: '13.5-17.5', status: 'low' },
                'Urea': { value: 48, unit: 'mg/dL', normalRange: '15-40', status: 'high' },
                'Potassium': { value: 4.9, unit: 'mEq/L', normalRange: '3.5-5.0', status: 'normal' }
            }),
            summary: 'Creatinine rising. Anemia worsening. Needs nephrologist consultation.'
        },
        {
            monthIndex: 3,
            monthLabel: 'Dec 2025',
            biomarkers: createBiomarkers({
                'Creatinine': { value: 1.8, unit: 'mg/dL', normalRange: '0.7-1.3', status: 'high' },
                'Hemoglobin': { value: 10.2, unit: 'g/dL', normalRange: '13.5-17.5', status: 'low' },
                'Urea': { value: 52, unit: 'mg/dL', normalRange: '15-40', status: 'high' },
                'Potassium': { value: 5.1, unit: 'mEq/L', normalRange: '3.5-5.0', status: 'high' }
            }),
            summary: 'Kidney function declining. Require immediate medical attention.'
        }
    ],

    'Saraswati Bai': [
        // Stable thyroid
        {
            monthIndex: 1,
            monthLabel: 'Oct 2025',
            biomarkers: createBiomarkers({
                'TSH': { value: 5.2, unit: 'μIU/mL', normalRange: '0.4-4.0', status: 'high' },
                'T3': { value: 95, unit: 'ng/dL', normalRange: '80-200', status: 'normal' },
                'T4': { value: 7.8, unit: 'μg/dL', normalRange: '5.0-12.0', status: 'normal' },
                'Hemoglobin': { value: 12.8, unit: 'g/dL', normalRange: '12.0-15.5', status: 'normal' }
            }),
            summary: 'Hypothyroidism stable on medication. Continue current dose.'
        },
        {
            monthIndex: 2,
            monthLabel: 'Nov 2025',
            biomarkers: createBiomarkers({
                'TSH': { value: 4.9, unit: 'μIU/mL', normalRange: '0.4-4.0', status: 'high' },
                'T3': { value: 98, unit: 'ng/dL', normalRange: '80-200', status: 'normal' },
                'T4': { value: 8.1, unit: 'μg/dL', normalRange: '5.0-12.0', status: 'normal' },
                'Hemoglobin': { value: 12.9, unit: 'g/dL', normalRange: '12.0-15.5', status: 'normal' }
            }),
            summary: 'TSH improving slightly. Medication effective.'
        },
        {
            monthIndex: 3,
            monthLabel: 'Dec 2025',
            biomarkers: createBiomarkers({
                'TSH': { value: 4.6, unit: 'μIU/mL', normalRange: '0.4-4.0', status: 'high' },
                'T3': { value: 102, unit: 'ng/dL', normalRange: '80-200', status: 'normal' },
                'T4': { value: 8.4, unit: 'μg/dL', normalRange: '5.0-12.0', status: 'normal' },
                'Hemoglobin': { value: 13.0, unit: 'g/dL', normalRange: '12.0-15.5', status: 'normal' }
            }),
            summary: 'Thyroid levels stabilizing. Good medication compliance.'
        }
    ],

    'Gopal Shetty': [
        // COPD + Diabetes borderline
        {
            monthIndex: 1,
            monthLabel: 'Oct 2025',
            biomarkers: createBiomarkers({
                'Glucose (Fasting)': { value: 135, unit: 'mg/dL', normalRange: '70-100', status: 'high' },
                'HbA1c': { value: 6.8, unit: '%', normalRange: '4.0-5.6', status: 'high' },
                'Oxygen Saturation': { value: '94', unit: '%', normalRange: '95-100', status: 'low' },
                'Hemoglobin': { value: 14.2, unit: 'g/dL', normalRange: '13.5-17.5', status: 'normal' }
            }),
            summary: 'Borderline diabetes. COPD managed. Continue oxygen therapy.'
        },
        {
            monthIndex: 2,
            monthLabel: 'Nov 2025',
            biomarkers: createBiomarkers({
                'Glucose (Fasting)': { value: 142, unit: 'mg/dL', normalRange: '70-100', status: 'high' },
                'HbA1c': { value: 7.1, unit: '%', normalRange: '4.0-5.6', status: 'high' },
                'Oxygen Saturation': { value: '93', unit: '%', normalRange: '95-100', status: 'low' },
                'Hemoglobin': { value: 14.1, unit: 'g/dL', normalRange: '13.5-17.5', status: 'normal' }
            }),
            summary: 'Sugar rising. Oxygen levels stable. Monitor diabetes closely.'
        },
        {
            monthIndex: 3,
            monthLabel: 'Dec 2025',
            biomarkers: createBiomarkers({
                'Glucose (Fasting)': { value: 148, unit: 'mg/dL', normalRange: '70-100', status: 'high' },
                'HbA1c': { value: 7.4, unit: '%', normalRange: '4.0-5.6', status: 'high' },
                'Oxygen Saturation': { value: '93', unit: '%', normalRange: '95-100', status: 'low' },
                'Hemoglobin': { value: 14.0, unit: 'g/dL', normalRange: '13.5-17.5', status: 'normal' }
            }),
            summary: 'Diabetes trend concerning. Need dietary intervention.'
        }
    ],

    'Radha Hegde': [
        // Mild dementia, stable
        {
            monthIndex: 1,
            monthLabel: 'Oct 2025',
            biomarkers: createBiomarkers({
                'Vitamin B12': { value: 285, unit: 'pg/mL', normalRange: '200-900', status: 'normal' },
                'Hemoglobin': { value: 12.8, unit: 'g/dL', normalRange: '12.0-15.5', status: 'normal' },
                'Glucose (Fasting)': { value: 92, unit: 'mg/dL', normalRange: '70-100', status: 'normal' },
                'Thyroid (TSH)': { value: 2.8, unit: 'μIU/mL', normalRange: '0.4-4.0', status: 'normal' }
            }),
            summary: 'All parameters stable. Cognitive function unchanged.'
        },
        {
            monthIndex: 2,
            monthLabel: 'Nov 2025',
            biomarkers: createBiomarkers({
                'Vitamin B12': { value: 290, unit: 'pg/mL', normalRange: '200-900', status: 'normal' },
                'Hemoglobin': { value: 12.9, unit: 'g/dL', normalRange: '12.0-15.5', status: 'normal' },
                'Glucose (Fasting)': { value: 89, unit: 'mg/dL', normalRange: '70-100', status: 'normal' },
                'Thyroid (TSH)': { value: 2.7, unit: 'μIU/mL', normalRange: '0.4-4.0', status: 'normal' }
            }),
            summary: 'Health stable. Continue current care routine.'
        },
        {
            monthIndex: 3,
            monthLabel: 'Dec 2025',
            biomarkers: createBiomarkers({
                'Vitamin B12': { value: 295, unit: 'pg/mL', normalRange: '200-900', status: 'normal' },
                'Hemoglobin': { value: 13.0, unit: 'g/dL', normalRange: '12.0-15.5', status: 'normal' },
                'Glucose (Fasting)': { value: 91, unit: 'mg/dL', normalRange: '70-100', status: 'normal' },
                'Thyroid (TSH)': { value: 2.6, unit: 'μIU/mL', normalRange: '0.4-4.0', status: 'normal' }
            }),
            summary: 'Good overall health. Mental status unchanged.'
        }
    ],

    'Krishnan Iyer': [
        // Heart failure - improving cholesterol
        {
            monthIndex: 1,
            monthLabel: 'Oct 2025',
            biomarkers: createBiomarkers({
                'Cholesterol (Total)': { value: 235, unit: 'mg/dL', normalRange: '<200', status: 'high' },
                'LDL': { value: 155, unit: 'mg/dL', normalRange: '<100', status: 'high' },
                'HDL': { value: 42, unit: 'mg/dL', normalRange: '>40', status: 'normal' },
                'Blood Pressure': { value: '145/90', unit: 'mmHg', normalRange: '<120/80', status: 'high' },
                'Hemoglobin': { value: 13.5, unit: 'g/dL', normalRange: '13.5-17.5', status: 'normal' }
            }),
            summary: 'High cholesterol. Blood pressure elevated. Diet changes recommended.'
        },
        {
            monthIndex: 2,
            monthLabel: 'Nov 2025',
            biomarkers: createBiomarkers({
                'Cholesterol (Total)': { value: 228, unit: 'mg/dL', normalRange: '<200', status: 'high' },
                'LDL': { value: 148, unit: 'mg/dL', normalRange: '<100', status: 'high' },
                'HDL': { value: 44, unit: 'mg/dL', normalRange: '>40', status: 'normal' },
                'Blood Pressure': { value: '140/88', unit: 'mmHg', normalRange: '<120/80', status: 'high' },
                'Hemoglobin': { value: 13.6, unit: 'g/dL', normalRange: '13.5-17.5', status: 'normal' }
            }),
            summary: 'Slight cholesterol improvement. Keep up with diet control.'
        },
        {
            monthIndex: 3,
            monthLabel: 'Dec 2025',
            biomarkers: createBiomarkers({
                'Cholesterol (Total)': { value: 220, unit: 'mg/dL', normalRange: '<200', status: 'high' },
                'LDL': { value: 142, unit: 'mg/dL', normalRange: '<100', status: 'high' },
                'HDL': { value: 45, unit: 'mg/dL', normalRange: '>40', status: 'normal' },
                'Blood Pressure': { value: '138/85', unit: 'mmHg', normalRange: '<120/80', status: 'high' },
                'Hemoglobin': { value: 13.7, unit: 'g/dL', normalRange: '13.5-17.5', status: 'normal' }
            }),
            summary: 'Cholesterol trending down nicely. Response to dietary changes positive.'
        }
    ],

    'Sumitra Nair': [
        // Osteoporosis - stable
        {
            monthIndex: 1,
            monthLabel: 'Oct 2025',
            biomarkers: createBiomarkers({
                'Calcium': { value: 9.1, unit: 'mg/dL', normalRange: '8.5-10.2', status: 'normal' },
                'Vitamin D': { value: 32, unit: 'ng/mL', normalRange: '30-100', status: 'normal' },
                'Hemoglobin': { value: 12.5, unit: 'g/dL', normalRange: '12.0-15.5', status: 'normal' },
                'Phosphorus': { value: 3.8, unit: 'mg/dL', normalRange: '2.5-4.5', status: 'normal' }
            }),
            summary: 'Bone health stable. Continue calcium and vitamin D supplements.'
        },
        {
            monthIndex: 2,
            monthLabel: 'Nov 2025',
            biomarkers: createBiomarkers({
                'Calcium': { value: 9.2, unit: 'mg/dL', normalRange: '8.5-10.2', status: 'normal' },
                'Vitamin D': { value: 34, unit: 'ng/mL', normalRange: '30-100', status: 'normal' },
                'Hemoglobin': { value: 12.6, unit: 'g/dL', normalRange: '12.0-15.5', status: 'normal' },
                'Phosphorus': { value: 3.9, unit: 'mg/dL', normalRange: '2.5-4.5', status: 'normal' }
            }),
            summary: 'Good compliance with supplements. Bone density stable.'
        },
        {
            monthIndex: 3,
            monthLabel: 'Dec 2025',
            biomarkers: createBiomarkers({
                'Calcium': { value: 9.3, unit: 'mg/dL', normalRange: '8.5-10.2', status: 'normal' },
                'Vitamin D': { value: 36, unit: 'ng/mL', normalRange: '30-100', status: 'normal' },
                'Hemoglobin': { value: 12.7, unit: 'g/dL', normalRange: '12.0-15.5', status: 'normal' },
                'Phosphorus': { value: 4.0, unit: 'mg/dL', normalRange: '2.5-4.5', status: 'normal' }
            }),
            summary: 'Excellent bone health maintenance. Continue current regimen.'
        }
    ],

    'Manjunath Gowda': [
        // Prostate + Diabetes
        {
            monthIndex: 1,
            monthLabel: 'Oct 2025',
            biomarkers: createBiomarkers({
                'PSA': { value: 5.2, unit: 'ng/mL', normalRange: '<4.0', status: 'high' },
                'Glucose (Fasting)': { value: 145, unit: 'mg/dL', normalRange: '70-100', status: 'high' },
                'HbA1c': { value: 7.2, unit: '%', normalRange: '4.0-5.6', status: 'high' },
                'Hemoglobin': { value: 14.0, unit: 'g/dL', normalRange: '13.5-17.5', status: 'normal' }
            }),
            summary: 'Elevated PSA, monitor prostate. Diabetes borderline.'
        },
        {
            monthIndex: 2,
            monthLabel: 'Nov 2025',
            biomarkers: createBiomarkers({
                'PSA': { value: 5.1, unit: 'ng/mL', normalRange: '<4.0', status: 'high' },
                'Glucose (Fasting)': { value: 152, unit: 'mg/dL', normalRange: '70-100', status: 'high' },
                'HbA1c': { value: 7.5, unit: '%', normalRange: '4.0-5.6', status: 'high' },
                'Hemoglobin': { value: 13.9, unit: 'g/dL', normalRange: '13.5-17.5', status: 'normal' }
            }),
            summary: 'PSA stable. Sugar rising, needs attention.'
        },
        {
            monthIndex: 3,
            monthLabel: 'Dec 2025',
            biomarkers: createBiomarkers({
                'PSA': { value: 5.0, unit: 'ng/mL', normalRange: '<4.0', status: 'high' },
                'Glucose (Fasting)': { value: 158, unit: 'mg/dL', normalRange: '70-100', status: 'high' },
                'HbA1c': { value: 7.8, unit: '%', normalRange: '4.0-5.6', status: 'high' },
                'Hemoglobin': { value: 13.8, unit: 'g/dL', normalRange: '13.5-17.5', status: 'normal' }
            }),
            summary: 'Diabetes progressing. Prostate stable but elevated.'
        }
    ],

    'Parvati Amma': [
        // Hypertension improving
        {
            monthIndex: 1,
            monthLabel: 'Oct 2025',
            biomarkers: createBiomarkers({
                'Blood Pressure': { value: '148/92', unit: 'mmHg', normalRange: '<120/80', status: 'high' },
                'Cholesterol (Total)': { value: 210, unit: 'mg/dL', normalRange: '<200', status: 'high' },
                'Glucose (Fasting)': { value: 98, unit: 'mg/dL', normalRange: '70-100', status: 'normal' },
                'Hemoglobin': { value: 12.8, unit: 'g/dL', normalRange: '12.0-15.5', status: 'normal' }
            }),
            summary: 'Hypertension controlled with medication. Monitor regularly.'
        },
        {
            monthIndex: 2,
            monthLabel: 'Nov 2025',
            biomarkers: createBiomarkers({
                'Blood Pressure': { value: '142/88', unit: 'mmHg', normalRange: '<120/80', status: 'high' },
                'Cholesterol (Total)': { value: 205, unit: 'mg/dL', normalRange: '<200', status: 'high' },
                'Glucose (Fasting)': { value: 96, unit: 'mg/dL', normalRange: '70-100', status: 'normal' },
                'Hemoglobin': { value: 12.9, unit: 'g/dL', normalRange: '12.0-15.5', status: 'normal' }
            }),
            summary: 'Blood pressure improving slowly. Good medication adherence.'
        },
        {
            monthIndex: 3,
            monthLabel: 'Dec 2025',
            biomarkers: createBiomarkers({
                'Blood Pressure': { value: '138/85', unit: 'mmHg', normalRange: '<120/80', status: 'high' },
                'Cholesterol (Total)': { value: 198, unit: 'mg/dL', normalRange: '<200', status: 'normal' },
                'Glucose (Fasting)': { value: 94, unit: 'mg/dL', normalRange: '70-100', status: 'normal' },
                'Hemoglobin': { value: 13.0, unit: 'g/dL', normalRange: '12.0-15.5', status: 'normal' }
            }),
            summary: 'Excellent progress. Blood pressure and cholesterol improving.'
        }
    ]
};

// Main seed function
async function seedMonthlyHistory() {
    try {
        console.log('🌱 Seeding 3-month patient history...\n');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthcare-db');
        console.log('✅ Connected to MongoDB\n');

        // Clear existing reports
        await Report.deleteMany({});
        console.log('🗑️  Cleared existing reports\n');

        let totalReports = 0;

        // Seed each patient's 3-month history
        for (const [patientName, months] of Object.entries(patientHistories)) {
            const resident = await Resident.findOne({ name: new RegExp(patientName, 'i') });

            if (!resident) {
                console.log(`⚠️  Patient "${patientName}" not found, skipping...`);
                continue;
            }

            console.log(`📊 ${patientName} (${months.length} months)`);

            for (const monthData of months) {
                // Create base date for each month
                const monthDate = new Date(2025, monthData.monthIndex + 8, 15); // Mid-month

                const report = new Report({
                    residentId: resident._id,
                    fileName: `${patientName.replace(/\s+/g, '_')}_${monthData.monthLabel.replace(/\s+/g, '_')}.pdf`,
                    fileUrl: `/uploads/monthly_reports/${resident._id}_month${monthData.monthIndex}.pdf`,
                    fileType: 'pdf',
                    uploadDate: monthDate,
                    monthIndex: monthData.monthIndex,
                    monthLabel: monthData.monthLabel,
                    biomarkers: monthData.biomarkers,
                    summaryEnglish: monthData.summary,
                    summaryKannada: 'ವರದಿ ಸಿದ್ಧವಾಗಿದೆ',
                    rawText: `Medical Report - ${monthData.monthLabel}`,
                    criticalAlert: monthData.monthIndex === 3 && patientName === 'Venkatesh Rao' // Critical only for Venkatesh's latest
                });

                await report.save();
                totalReports++;
                console.log(`   ✓ ${monthData.monthLabel}`);
            }
            console.log('');
        }

        console.log('═══════════════════════════════════════════');
        console.log(`✅ Seeded ${totalReports} monthly reports for 10 patients`);
        console.log('═══════════════════════════════════════════\n');

        await mongoose.disconnect();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding monthly history:', error);
        process.exit(1);
    }
}

// Run seed
seedMonthlyHistory();
