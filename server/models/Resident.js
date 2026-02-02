const mongoose = require('mongoose');

const residentSchema = new mongoose.Schema({
    orgId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        required: true,
        min: 0
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true
    },
    room: {
        type: String,
        required: true
    },
    photo: {
        type: String,
        default: null
    },
    conditions: [{
        type: String
    }],
    medications: [{
        name: String,
        dosage: String,
        frequency: String
    }],
    allergies: [{
        type: String
    }],
    emergencyContacts: [{
        name: String,
        relationship: String,
        phone: String
    }],
    riskLevel: {
        type: String,
        enum: ['normal', 'attention', 'critical'],
        default: 'normal'
    },
    preferredLanguage: {
        type: String,
        enum: ['en', 'kn'],
        default: 'kn'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Resident', residentSchema);
