const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    residentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resident',
        required: true
    },
    userSaid: {
        type: String,
        required: true
    },
    aiResponse: {
        type: String,
        required: true
    },
    language: {
        type: String,
        enum: ['en', 'kn'],
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Conversation', conversationSchema);
