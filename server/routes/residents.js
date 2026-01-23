const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Resident = require('../models/Resident');
const Report = require('../models/Report');

// Public endpoint for elderly voice interface (no auth required)
router.get('/public', async (req, res) => {
    try {
        const residents = await Resident.find({})
            .select('_id name room age')
            .sort({ name: 1 });
        res.json({ residents });
    } catch (error) {
        console.error('Error fetching public residents:', error);
        res.status(500).json({ error: 'Failed to fetch residents' });
    }
});

// Get all residents (no auth required)
router.get('/', async (req, res) => {
    try {
        const residents = await Resident.find({}).sort({ createdAt: -1 });
        res.json({ residents });
    } catch (error) {
        console.error('Error fetching residents:', error);
        res.status(500).json({ error: 'Failed to fetch residents' });
    }
});

// Get single resident by ID (no auth required)
router.get('/:id', async (req, res) => {
    try {
        const resident = await Resident.findById(req.params.id);

        if (!resident) {
            return res.status(404).json({ error: 'Resident not found' });
        }

        // Also fetch their latest report
        const latestReport = await Report.findOne({ residentId: resident._id })
            .sort({ uploadDate: -1 })
            .limit(1);

        res.json({
            resident,
            latestReport
        });
    } catch (error) {
        console.error('Error fetching resident:', error);
        res.status(500).json({ error: 'Failed to fetch resident' });
    }
});

// Create new resident (no auth required)
router.post('/', async (req, res) => {
    try {
        // Use a default orgId if needed for backward compatibility
        const residentData = {
            ...req.body,
            orgId: req.body.orgId || '000000000000000000000000'
        };

        const resident = new Resident(residentData);
        await resident.save();

        res.status(201).json({
            message: 'Resident created successfully',
            resident
        });
    } catch (error) {
        console.error('Error creating resident:', error);
        res.status(500).json({ error: 'Failed to create resident' });
    }
});

// Update resident (no auth required)
router.put('/:id', async (req, res) => {
    try {
        const resident = await Resident.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!resident) {
            return res.status(404).json({ error: 'Resident not found' });
        }

        res.json({
            message: 'Resident updated successfully',
            resident
        });
    } catch (error) {
        console.error('Error updating resident:', error);
        res.status(500).json({ error: 'Failed to update resident' });
    }
});

// Delete resident (no auth required)
router.delete('/:id', async (req, res) => {
    try {
        const resident = await Resident.findByIdAndDelete(req.params.id);

        if (!resident) {
            return res.status(404).json({ error: 'Resident not found' });
        }

        // Also delete their reports
        await Report.deleteMany({ residentId: req.params.id });

        res.json({ message: 'Resident deleted successfully' });
    } catch (error) {
        console.error('Error deleting resident:', error);
        res.status(500).json({ error: 'Failed to delete resident' });
    }
});

module.exports = router;
