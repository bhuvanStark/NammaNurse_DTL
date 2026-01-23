const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const Report = require('../models/Report');
const Resident = require('../models/Resident');
const { extractTextFromFile } = require('../services/ocrService');
const { extractBiomarkersFromImage } = require('../services/visionService');
const { parseBiomarkers, hasCriticalValues } = require('../services/biomarkerParser');
const { generateHealthSummary } = require('../services/llmService');
const { sendCriticalAlert } = require('../services/alertService');
const path = require('path');

// Upload report (no auth required)
router.post('/upload', upload.single('report'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { residentId } = req.body;

        // Verify resident exists
        const resident = await Resident.findById(residentId);

        if (!resident) {
            return res.status(404).json({ error: 'Resident not found' });
        }

        // Create report record
        const fileExt = path.extname(req.file.originalname).substring(1).toLowerCase();

        // Auto-generate monthLabel and monthIndex for trend graphs
        // Find the latest report for this resident
        const latestReport = await Report.findOne({ residentId })
            .sort({ monthIndex: -1, uploadDate: -1 })
            .limit(1);

        let monthIndex = 1;
        let monthLabel = 'Month 1';

        if (latestReport && latestReport.monthIndex) {
            // Increment from the last report
            monthIndex = latestReport.monthIndex + 1;

            // Generate a readable month label based on current date
            const currentDate = new Date();
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            monthLabel = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        } else {
            // First report - use current month
            const currentDate = new Date();
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            monthLabel = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        }

        const report = new Report({
            residentId,
            fileName: req.file.originalname,
            fileUrl: req.file.path,
            fileType: fileExt,
            monthIndex,
            monthLabel
        });

        await report.save();

        console.log(`📄 Created report with monthLabel: ${monthLabel} (index: ${monthIndex})`);

        res.status(201).json({
            message: 'Report uploaded successfully',
            report
        });

    } catch (error) {
        console.error('Error uploading report:', error);
        res.status(500).json({ error: 'Failed to upload report' });
    }
});

// Parse report (OCR + AI summary) - no auth required
router.post('/parse/:reportId', async (req, res) => {
    try {
        const report = await Report.findById(req.params.reportId).populate('residentId');

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        console.log('🔬 Starting report analysis...');

        let biomarkers = [];

        // Step 1: For images, use Gemini Vision for better accuracy
        if (['jpg', 'jpeg', 'png'].includes(report.fileType.toLowerCase())) {
            console.log('🖼️ Using Gemini Vision for image analysis...');
            try {
                biomarkers = await extractBiomarkersFromImage(report.fileUrl);

                // Add status and normal ranges to vision-extracted biomarkers
                biomarkers = biomarkers.map(bio => {
                    const value = parseFloat(bio.value);
                    let status = 'normal';
                    let normalRange = bio.normalRange || '';

                    // Determine status based on biomarker name and value
                    if (bio.name.toLowerCase().includes('hba1c')) {
                        normalRange = normalRange || '< 5.7%';
                        if (value >= 9) status = 'critical';
                        else if (value > 6.5) status = 'high';
                    } else if (bio.name.toLowerCase().includes('glucose')) {
                        normalRange = normalRange || '70-100 mg/dL';
                        if (value >= 250) status = 'critical';
                        else if (value > 125) status = 'high';
                        else if (value < 70) status = 'low';
                    } else if (bio.name.toLowerCase().includes('creatinine')) {
                        normalRange = normalRange || '0.6-1.2 mg/dL';
                        if (value >= 2.5) status = 'critical';
                        else if (value > 1.3) status = 'high';
                    } else if (bio.name.toLowerCase().includes('hemoglobin')) {
                        normalRange = normalRange || '12-16 g/dL';
                        if (value <= 8) status = 'critical';
                        else if (value < 10) status = 'low';
                    }

                    return { ...bio, status, normalRange };
                });

                report.rawText = 'Analyzed using Gemini Vision API';
            } catch (visionError) {
                console.log('⚠️ Vision API failed, falling back to OCR:', visionError.message);
                // Fallback to OCR if vision fails
                const ocrText = await extractTextFromFile(report.fileUrl, report.fileType);
                report.rawText = ocrText;
                biomarkers = parseBiomarkers(ocrText);
            }
        } else {
            // Step 1B: For PDFs, use traditional OCR + parsing
            console.log('📄 Using OCR for PDF analysis...');
            const ocrText = await extractTextFromFile(report.fileUrl, report.fileType);
            report.rawText = ocrText;
            biomarkers = parseBiomarkers(ocrText);
        }

        report.biomarkers = biomarkers;

        // Step 3: Generate AI summaries
        let summaryEnglish, summaryKannada;

        if (biomarkers.length === 0) {
            console.log('⚠️ No biomarkers found in report');
            summaryEnglish = 'No biomarkers could be extracted from this report. Please ensure the report contains standard medical test results (Glucose, HbA1c, Cholesterol, Creatinine, Hemoglobin, Blood Pressure, etc.)';
            summaryKannada = 'ಈ ವರದಿಯಿಂದ ಯಾವುದೇ ಬಯೋಮಾರ್ಕರ್‌ಗಳನ್ನು ಹೊರತೆಗೆಯಲಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ವರದಿಯಲ್ಲಿ ಪ್ರಮಾಣಿತ ವೈದ್ಯಕೀಯ ಪರೀಕ್ಷಾ ಫಲಿತಾಂಶಗಳಿವೆಯೆ ಎಂದು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.';
        } else {
            summaryEnglish = await generateHealthSummary(biomarkers, 'english');
            summaryKannada = await generateHealthSummary(biomarkers, 'kannada');
        }

        report.summaryEnglish = summaryEnglish;
        report.summaryKannada = summaryKannada;

        // Step 4: Check for critical values
        const isCritical = hasCriticalValues(biomarkers);
        report.criticalAlert = isCritical;

        await report.save();

        // Step 5: Update resident risk level
        if (isCritical) {
            report.residentId.riskLevel = 'critical';
            await report.residentId.save();

            // Send alert
            await sendCriticalAlert(report.residentId, biomarkers);
        }

        console.log('✅ Report analysis completed successfully');

        res.json({
            message: 'Report parsed successfully',
            report
        });

    } catch (error) {
        console.error('Error parsing report:', error);
        res.status(500).json({ error: 'Failed to parse report' });
    }
});

// Get all reports for a resident (no auth required)
router.get('/resident/:residentId', async (req, res) => {
    try {
        // Verify resident exists
        const resident = await Resident.findById(req.params.residentId);

        if (!resident) {
            return res.status(404).json({ error: 'Resident not found' });
        }

        const reports = await Report.find({ residentId: req.params.residentId })
            .sort({ uploadDate: -1 });

        res.json({ reports });
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
});

// Delete report (no auth required)
router.delete('/:reportId', async (req, res) => {
    try {
        const report = await Report.findById(req.params.reportId).populate('residentId');

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        // Delete the report file if it exists
        const fs = require('fs').promises;
        const path = require('path');
        try {
            await fs.unlink(report.fileUrl);
        } catch (err) {
            console.log('File already deleted or not found');
        }

        // Delete from database
        await Report.findByIdAndDelete(req.params.reportId);

        console.log(`✅ Deleted report: ${report.fileName}`);
        res.json({ message: 'Report deleted successfully' });

    } catch (error) {
        console.error('Error deleting report:', error);
        res.status(500).json({ error: 'Failed to delete report' });
    }
});

// Get latest report for a resident (no auth required)
router.get('/latest/:residentId', async (req, res) => {
    try {
        const report = await Report.findOne({ residentId: req.params.residentId })
            .sort({ uploadDate: -1 })
            .limit(1);

        if (!report) {
            return res.status(404).json({ error: 'No reports found' });
        }

        res.json({ report });
    } catch (error) {
        console.error('Error fetching latest report:', error);
        res.status(500).json({ error: 'Failed to fetch latest report' });
    }
});

// Get trend data for graphs (chronologically sorted monthly reports) - no auth required
router.get('/trends/:residentId', async (req, res) => {
    try {
        console.log('📊 Trends API called for resident:', req.params.residentId);

        // Verify resident exists
        const resident = await Resident.findById(req.params.residentId);

        if (!resident) {
            console.log('❌ Resident not found for ID:', req.params.residentId);
            return res.status(404).json({ error: 'Resident not found' });
        }

        console.log('✅ Resident found:', resident.name);

        // Get all reports sorted by month index for trend visualization
        const reports = await Report.find({ residentId: req.params.residentId })
            .sort({ monthIndex: 1, uploadDate: 1 })
            .select('monthLabel monthIndex biomarkers uploadDate summaryEnglish');

        console.log(`📄 Found ${reports.length} reports for trends`);

        // Extract trend data by biomarker
        const trends = {
            months: reports.map(r => r.monthLabel),
            datasets: {}
        };

        // Build datasets for each biomarker
        reports.forEach(report => {
            if (report.biomarkers && report.biomarkers.length > 0) {
                report.biomarkers.forEach(bio => {
                    if (!trends.datasets[bio.name]) {
                        trends.datasets[bio.name] = {
                            label: bio.name,
                            unit: bio.unit,
                            data: []
                        };
                    }

                    // Parse value to number
                    let numValue = parseFloat(bio.value);
                    if (isNaN(numValue)) {
                        // Handle blood pressure or other complex values
                        if (bio.value.includes('/')) {
                            numValue = parseFloat(bio.value.split('/')[0]); // Take systolic for BP
                        } else {
                            numValue = null;
                        }
                    }

                    trends.datasets[bio.name].data.push({
                        month: report.monthLabel,
                        value: numValue,
                        status: bio.status
                    });
                });
            }
        });

        res.json({
            trends,
            reports: reports.map(r => ({
                monthLabel: r.monthLabel,
                monthIndex: r.monthIndex,
                uploadDate: r.uploadDate,
                summary: r.summaryEnglish
            }))
        });

    } catch (error) {
        console.error('❌ Trends API error:', error.message);
        console.error('Stack:', error.stack);
        res.status(500).json({ error: 'Failed to fetch trend data', details: error.message });
    }
});

module.exports = router;
