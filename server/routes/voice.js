const express = require('express');
const router = express.Router();
const Resident = require('../models/Resident');
const Report = require('../models/Report');
const Conversation = require('../models/Conversation');
const { generateVoiceResponse, applySafetyRules, detectUnsafeQuery } = require('../services/llmService');
const { sendCriticalAlert, logCriticalAlert } = require('../services/emailAlertService');

// Voice chat endpoint
router.post('/chat', async (req, res) => {
    try {
        const { residentId, message, language = 'english' } = req.body;

        if (!residentId || !message) {
            return res.status(400).json({ error: 'residentId and message are required' });
        }

        // Get complete resident profile with all health information
        const resident = await Resident.findById(residentId);
        if (!resident) {
            return res.status(404).json({ error: 'Resident not found' });
        }

        // Get latest 3 reports for better context and trend analysis
        const recentReports = await Report.find({ residentId })
            .sort({ uploadDate: -1 })
            .limit(3);

        console.log(`🎤 Voice Chat - ${resident.name} (${language}): "${message}"`);
        console.log(`📊 Patient Context: Age ${resident.age}, ${resident.gender}, Conditions: ${resident.conditions.join(', ')}`);
        console.log(`📄 Found ${recentReports.length} recent reports`);

        // Generate AI response with full patient context
        const aiResponse = await generateVoiceResponse(
            message,
            resident,
            recentReports,
            language
        );

        // Build explainable output - show what data informed the response
        const explanation = {
            message: "This advice is based on:",
            dataSources: [],
            conditions: resident.conditions,
            riskLevel: resident.riskLevel,
            lastReportDate: recentReports.length > 0 ? recentReports[0].uploadDate : null
        };

        // Add biomarkers to explanation
        if (recentReports.length > 0 && recentReports[0].biomarkers) {
            const abnormalBiomarkers = recentReports[0].biomarkers.filter(b => b.status !== 'normal');
            if (abnormalBiomarkers.length > 0) {
                explanation.dataSources = abnormalBiomarkers.map(b =>
                    `${b.name} = ${b.value} ${b.unit} (${b.status.toUpperCase()})`
                );
            }
        }

        // Check for critical values and send alerts
        if (recentReports.length > 0) {
            const latestBiomarkers = recentReports[0].biomarkers || [];
            const { criticalWarnings } = applySafetyRules(resident, latestBiomarkers);

            if (criticalWarnings.length > 0) {
                // Send email alert
                await sendCriticalAlert(resident, latestBiomarkers, message, criticalWarnings);
                // Also log to file
                await logCriticalAlert(resident, message, criticalWarnings);
            }
        }

        // Save conversation
        const conversation = new Conversation({
            residentId,
            userSaid: message,
            aiResponse,
            language
        });

        await conversation.save();

        console.log(`🤖 AI Response: "${aiResponse}"`);

        res.json({
            message: 'Response generated successfully',
            response: aiResponse,
            explanation: explanation,
            patientContext: {
                name: resident.name,
                age: resident.age,
                conditions: resident.conditions,
                reportsCount: recentReports.length
            }
        });

    } catch (error) {
        console.error('Error in voice chat:', error);
        res.status(500).json({ error: 'Failed to generate response' });
    }
});

// Intent-based endpoint for button interactions
router.post('/intent', async (req, res) => {
    try {
        const { residentId, intent, language } = req.body;

        if (!residentId || !intent) {
            return res.status(400).json({ error: 'residentId and intent are required' });
        }

        // Get complete resident profile
        const resident = await Resident.findById(residentId);
        if (!resident) {
            return res.status(404).json({ error: 'Resident not found' });
        }

        // Use resident's preferred language if not specified
        const responseLanguage = language || resident.preferredLanguage;

        // Get latest 3 reports for context
        const recentReports = await Report.find({ residentId })
            .sort({ uploadDate: -1 })
            .limit(3);

        console.log(`🎯 Intent Request - ${resident.name}: ${intent} (${responseLanguage})`);

        // Map intent to natural language query
        const intentQueries = {
            HEALTH_STATUS: 'What is my current health status based on my latest reports?',
            FOOD_ADVICE: 'What food should I eat based on my medical conditions?',
            EXERCISE_ADVICE: 'What exercises can I do safely given my age and conditions?'
        };

        const query = intentQueries[intent];
        if (!query) {
            return res.status(400).json({ error: 'Invalid intent' });
        }

        // Generate AI response with full context
        const aiResponse = await generateVoiceResponse(
            query,
            resident,
            recentReports,
            responseLanguage
        );

        // Save conversation
        const conversation = new Conversation({
            residentId,
            userSaid: `[${intent}] ${query}`,
            aiResponse,
            language: responseLanguage
        });

        await conversation.save();

        console.log(`🤖 Intent Response: "${aiResponse.substring(0, 100)}..."`);

        res.json({
            message: 'Response generated successfully',
            response: aiResponse,
            intent: intent,
            language: responseLanguage,
            patientContext: {
                name: resident.name,
                age: resident.age,
                conditions: resident.conditions
            }
        });

    } catch (error) {
        console.error('Error in intent handler:', error);
        res.status(500).json({ error: 'Failed to generate response' });
    }
});

// Caretaker alert endpoint
router.post('/caretaker-alert', async (req, res) => {
    try {
        const { residentId } = req.body;

        if (!residentId) {
            return res.status(400).json({ error: 'residentId is required' });
        }

        const resident = await Resident.findById(residentId);
        if (!resident) {
            return res.status(404).json({ error: 'Resident not found' });
        }

        // Import email service
        const { sendCaretakerAlert } = require('../services/emailService');

        // Format timestamp
        const timestamp = new Date().toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            dateStyle: 'medium',
            timeStyle: 'short'
        });

        // Send alert
        const result = await sendCaretakerAlert(
            resident.name,
            resident.room,
            timestamp
        );

        console.log(`🚨 Caretaker alert sent for ${resident.name} (Room ${resident.room})`);

        res.json({
            message: 'Caretaker has been notified',
            success: true,
            method: result.method,
            patient: {
                name: resident.name,
                room: resident.room
            },
            timestamp: timestamp
        });

    } catch (error) {
        console.error('Error sending caretaker alert:', error);
        res.status(500).json({ error: 'Failed to send alert' });
    }
});

// Get conversation history
router.get('/history/:residentId', async (req, res) => {
    try {
        const conversations = await Conversation.find({
            residentId: req.params.residentId
        })
            .sort({ timestamp: -1 })
            .limit(20);

        res.json({ conversations });
    } catch (error) {
        console.error('Error fetching conversation history:', error);
        res.status(500).json({ error: 'Failed to fetch conversation history' });
    }
});

module.exports = router;

