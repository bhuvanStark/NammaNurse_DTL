const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log('✅ .env file loaded successfully');
} else {
    console.log('ℹ️  No .env file found, using system environment variables');
}

console.log('-------------------------------------------');
console.log('🔍 Diagnostic Info:');
console.log('📂 Current Directory:', process.cwd());
console.log('🏠 Script Directory:', __dirname);
console.log('💎 MONGODB_URI exists:', !!process.env.MONGODB_URI);

if (!process.env.MONGODB_URI) {
    console.warn('⚠️  MONGODB_URI is MISSING!');
}
console.log('-------------------------------------------');

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const residentRoutes = require('./routes/residents');
const reportRoutes = require('./routes/reports');
const voiceRoutes = require('./routes/voice');

const app = express();

// Connect to MongoDB
console.log('🔌 Connecting to database...');
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.static(path.join(__dirname, '../client')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/residents', residentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/voice', voiceRoutes);

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/caretaker/login.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log('🏥  NAMMA NURSE - Voice-First AI Healthcare Assistant');
    console.log('='.repeat(60));
    console.log(`✅  Server running on http://localhost:${PORT}`);
    console.log(`📱  Caretaker Login: http://localhost:${PORT}/caretaker/login.html`);
    console.log(`🎤  Elderly Voice UI: http://localhost:${PORT}/elderly/voice.html`);
    console.log('='.repeat(60) + '\n');
});

module.exports = app;
