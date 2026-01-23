const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    residentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resident',
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        enum: ['pdf', 'jpg', 'jpeg', 'png'],
        required: true
    },
    uploadDate: {
        type: Date,
        default: Date.now
    },
    monthIndex: {
        type: Number,
        required: true,
        default: 1
    },
    monthLabel: {
        type: String,
        required: true,
        default: function () {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const date = this.uploadDate || new Date();
            return `${months[date.getMonth()]} ${date.getFullYear()}`;
        }
    },
    rawText: {
        type: String,
        default: ''
    },
    biomarkers: [{
        name: String,
        value: String,
        unit: String,
        normalRange: String,
        status: {
            type: String,
            enum: ['normal', 'low', 'high', 'critical']
        }
    }],
    summaryEnglish: {
        type: String,
        default: ''
    },
    summaryKannada: {
        type: String,
        default: ''
    },
    criticalAlert: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Report', reportSchema);
