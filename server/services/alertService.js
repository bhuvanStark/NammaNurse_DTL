/**
 * Send critical alert (console log only - SMS skipped)
 */
const sendCriticalAlert = async (resident, biomarkers) => {
    try {
        const criticalBiomarkers = biomarkers.filter(b => b.status === 'critical');

        if (criticalBiomarkers.length === 0) {
            return;
        }

        const alertMessage = `
🚨 CRITICAL HEALTH ALERT 🚨
Patient: ${resident.name} (${resident.age}y, ${resident.gender})
Room: ${resident.room}

Critical Values:
${criticalBiomarkers.map(b => `• ${b.name}: ${b.value} ${b.unit} (${b.status.toUpperCase()})`).join('\n')}

Action Required: Immediate medical attention needed!
    `.trim();

        console.log('\n' + '='.repeat(60));
        console.log(alertMessage);
        console.log('='.repeat(60) + '\n');

        // Log to alert file as well
        const fs = require('fs').promises;
        const logEntry = `[${new Date().toISOString()}] ${alertMessage}\n\n`;

        try {
            await fs.appendFile('alerts.log', logEntry);
        } catch (err) {
            // Ignore file write errors
        }

        return {
            sent: true,
            message: 'Alert logged to console and alerts.log',
            criticalCount: criticalBiomarkers.length
        };

    } catch (error) {
        console.error('❌ Alert Error:', error.message);
        return {
            sent: false,
            error: error.message
        };
    }
};

module.exports = {
    sendCriticalAlert
};
