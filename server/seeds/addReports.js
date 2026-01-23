require('dotenv').config();
const mongoose = require('mongoose');
const Resident = require('../models/Resident');
const Report = require('../models/Report');
const { generateHealthSummary } = require('../services/llmService');

const addMedicalReports = async () => {
    try {
        console.log('🏥 Adding synthetic medical reports...\n');

        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB\n');

        // Get all residents
        const residents = await Resident.find({});
        console.log(`📋 Found ${residents.length} residents\n`);

        // Clear existing reports
        await Report.deleteMany({});
        console.log('🗑️  Cleared old reports\n');

        // Helper function to generate biomarkers based on patient conditions
        const generateBiomarkers = (resident) => {
            const biomarkers = [];
            const hasDiabetes = resident.conditions.some(c => c.includes('Diabetes'));
            const hasHypertension = resident.conditions.some(c => c.includes('Hypertension'));
            const hasKidney = resident.conditions.some(c => c.includes('Kidney'));
            const hasHeart = resident.conditions.some(c => c.includes('Heart'));

            // Glucose (if diabetic, make it high)
            if (hasDiabetes || resident.age > 70) {
                biomarkers.push({
                    name: 'Fasting Glucose',
                    value: hasDiabetes ? (Math.random() > 0.5 ? '145' : '165') : '95',
                    unit: 'mg/dL',
                    normalRange: '70-100',
                    status: hasDiabetes ? 'high' : 'normal'
                });

                biomarkers.push({
                    name: 'HbA1c',
                    value: hasDiabetes ? '7.2' : '5.4',
                    unit: '%',
                    normalRange: '<5.7',
                    status: hasDiabetes ? 'high' : 'normal'
                });
            }

            // Blood Pressure (if hypertensive, make it high)
            if (hasHypertension || resident.age > 65) {
                biomarkers.push({
                    name: 'Blood Pressure (Systolic)',
                    value: hasHypertension ? '148' : '125',
                    unit: 'mmHg',
                    normalRange: '90-120',
                    status: hasHypertension ? 'high' : 'normal'
                });

                biomarkers.push({
                    name: 'Blood Pressure (Diastolic)',
                    value: hasHypertension ? '92' : '78',
                    unit: 'mmHg',
                    normalRange: '60-80',
                    status: hasHypertension ? 'high' : 'normal'
                });
            }

            // Creatinine (if kidney disease, make it high)
            biomarkers.push({
                name: 'Creatinine',
                value: hasKidney ? '2.1' : '1.0',
                unit: 'mg/dL',
                normalRange: '0.6-1.2',
                status: hasKidney ? 'high' : 'normal'
            });

            // Hemoglobin (check for anemia)
            const hasAnemia = resident.conditions.some(c => c.includes('Anemia'));
            biomarkers.push({
                name: 'Hemoglobin',
                value: hasAnemia ? '9.5' : '13.2',
                unit: 'g/dL',
                normalRange: '12-16',
                status: hasAnemia ? 'low' : 'normal'
            });

            // Cholesterol (general elderly)
            biomarkers.push({
                name: 'Total Cholesterol',
                value: Math.random() > 0.3 ? '215' : '185',
                unit: 'mg/dL',
                normalRange: '<200',
                status: Math.random() > 0.3 ? 'high' : 'normal'
            });

            // Add a few more common markers
            biomarkers.push({
                name: 'LDL Cholesterol',
                value: '125',
                unit: 'mg/dL',
                normalRange: '<100',
                status: 'high'
            });

            return biomarkers;
        };

        // Generate reports for each resident
        let reportCount = 0;

        for (const resident of residents) {
            console.log(`\n📊 Creating report for ${resident.name}...`);

            // Generate biomarkers
            const biomarkers = generateBiomarkers(resident);

            // Generate AI summaries in both languages
            let summaryEnglish = '';
            let summaryKannada = '';

            try {
                summaryEnglish = await generateHealthSummary(biomarkers, 'english');
                console.log(`   ✅ Generated English summary`);
            } catch (error) {
                summaryEnglish = 'Your recent test results show some values that need attention. Please consult your doctor.';
                console.log(`   ⚠️  Using fallback English summary`);
            }

            try {
                summaryKannada = await generateHealthSummary(biomarkers, 'kannada');
                console.log(`   ✅ Generated Kannada summary`);
            } catch (error) {
                summaryKannada = 'ನಿಮ್ಮ ವರದಿ ಸಿದ್ಧವಾಗಿದೆ. ವೈದ್ಯರನ್ನು ಭೇಟಿಯಾಗಿ.';
                console.log(`   ⚠️  Using fallback Kannada summary`);
            }

            // Check for critical values
            const hasCritical = biomarkers.some(b => b.status === 'critical' ||
                (b.status === 'high' && (b.name.includes('Glucose') || b.name.includes('Creatinine'))));

            // Create the report
            const report = new Report({
                residentId: resident._id,
                fileName: `${resident.name.replace(' ', '_')}_BloodTest_Jan2026.pdf`,
                fileUrl: `/uploads/dummy_${resident._id}.pdf`,
                fileType: 'pdf',
                uploadDate: new Date(),
                rawText: `Blood Test Report for ${resident.name}\n` +
                    biomarkers.map(b => `${b.name}: ${b.value} ${b.unit}`).join('\n'),
                biomarkers: biomarkers,
                summaryEnglish: summaryEnglish,
                summaryKannada: summaryKannada,
                criticalAlert: hasCritical
            });

            await report.save();
            reportCount++;

            console.log(`   ✅ Created report with ${biomarkers.length} biomarkers`);
            console.log(`   📈 Biomarkers: ${biomarkers.map(b => `${b.name} (${b.status})`).join(', ')}`);
        }

        console.log('\n' + '='.repeat(70));
        console.log(`✅ Successfully created ${reportCount} medical reports!`);
        console.log('='.repeat(70));
        console.log('\n🎯 Now test the voice interface at: http://localhost:3000/elderly/voice.html');
        console.log('💡 Try questions like:');
        console.log('   - "What should I eat?"');
        console.log('   - "How is my sugar?"');
        console.log('   - "What is high in my report?"');
        console.log('   - "Am I healthy?"\n');

        process.exit(0);

    } catch (error) {
        console.error('❌ Error adding reports:', error);
        process.exit(1);
    }
};

addMedicalReports();
