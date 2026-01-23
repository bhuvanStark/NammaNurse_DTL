const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const Report = require('../models/Report');
const Resident = require('../models/Resident');
const { extractTextFromFile } = require('../services/ocrService');
const { parseBiomarkers, hasCriticalValues } = require('../services/biomarkerParser');
const { generateHealthSummary } = require('../services/llmService');
const { sendCriticalAlert } = require('../services/alertService');
const path = require('path');

// Upload report
router.post('/upload', auth, upload.single('report'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { residentId } = req.body;

        // Verify resident exists and belongs to this organization
        const resident = await Resident.findOne({
            _id: residentId,
            orgId: req.orgId
        });

        if (!resident) {
            return res.status(404).json({ error: 'Resident not found' });
        }

        // Create report record
        const fileExt = path.extname(req.file.originalname).substring(1).toLowerCase();

        const report = new Report({
            residentId,
            fileName: req.file.originalname,
            fileUrl: req.file.path,
            fileType: fileExt
        });

        await report.save();

        res.status(201).json({
            message: 'Report uploaded successfully',
            report
        });

    } catch (error) {
        console.error('Error uploading report:', error);
        res.status(500).json({ error: 'Failed to upload report' });
    }
});

// Parse report (OCR + AI summary)
router.post('/parse/:reportId', auth, async (req, res) => {
    try {
        const report = await Report.findById(req.params.reportId).populate('residentId');

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        // Verify organization access
        if (report.residentId.orgId.toString() !== req.orgId.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        console.log('🔬 Starting report analysis...');

        // Step 1: Extract text using OCR
        const ocrText = await extractTextFromFile(report.fileUrl, report.fileType);
        report.rawText = ocrText;

        // Step 2: Parse biomarkers
        const biomarkers = parseBiomarkers(ocrText);
        report.biomarkers = biomarkers;

        // Step 3: Generate AI summaries
        const summaryEnglish = await generateHealthSummary(biomarkers, 'english');
        const summaryKannada = await generateHealthSummary(biomarkers, 'kannada');

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

// Get all reports for a resident
router.get('/resident/:residentId', auth, async (req, res) => {
    try {
        // Verify resident belongs to this organization
        const resident = await Resident.findOne({
            _id: req.params.residentId,
            orgId: req.orgId
        });

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

// Get latest report for a resident
router.get('/latest/:residentId', auth, async (req, res) => {
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

// Get trend data for graphs (chronologically sorted monthly reports)
router.get('/trends/:residentId', auth, async (req, res) => {
    try {
        // Verify resident belongs to this organization
        const resident = await Resident.findOne({
            _id: req.params.residentId,
            orgId: req.orgId
        });

        if (!resident) {
            return res.status(404).json({ error: 'Resident not found' });
        }

        // Get all reports sorted by month index for trend visualization
        const reports = await Report.find({ residentId: req.params.residentId })
            .sort({ monthIndex: 1, uploadDate: 1 })
            .select('monthLabel monthIndex biomarkers uploadDate summaryEnglish');

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
        console.error('Error fetching trend data:', error);
        res.status(500).json({ error: 'Failed to fetch trend data' });
    }
});

module.exports = router;
