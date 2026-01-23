const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Organization = require('../models/Organization');

// Register new organization
router.post('/register', async (req, res) => {
    try {
        const { name, location, email, password, phone } = req.body;

        // Check if organization already exists
        const existingOrg = await Organization.findOne({ email });
        if (existingOrg) {
            return res.status(400).json({ error: 'Organization already registered with this email' });
        }

        // Create new organization
        const organization = new Organization({
            name,
            location,
            email,
            password,
            phone
        });

        await organization.save();

        // Generate JWT token
        const token = jwt.sign(
            { orgId: organization._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Organization registered successfully',
            token,
            organization: {
                id: organization._id,
                name: organization.name,
                email: organization.email
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to register organization' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find organization
        const organization = await Organization.findOne({ email });
        if (!organization) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Check password
        const isPasswordValid = await organization.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { orgId: organization._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            organization: {
                id: organization._id,
                name: organization.name,
                email: organization.email
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

module.exports = router;
