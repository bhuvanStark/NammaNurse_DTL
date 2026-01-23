const nodemailer = require('nodemailer');

/**
 * Send critical health alert email to caretaker
 */
const sendCriticalAlert = async (patient, biomarkers, query, criticalValues) => {
    // Only send if there are actual critical biomarkers
    if (!criticalValues || criticalValues.length === 0) {
        return false;
    }

    try {
        // Configure email transporter (using Gmail)
        // NOTE: You need to set up App Password in Gmail for this to work
        // https://support.google.com/accounts/answer/185833
        const transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.ALERT_EMAIL || 'noreply@nammanurse.com',
                pass: process.env.ALERT_PASSWORD || 'your-app-password-here'
            }
        });

        // Build critical biomarkers list
        const criticalList = criticalValues.map(c =>
            `  • ${c.biomarker}: ${c.value} (${c.type})`
        ).join('\n');

        const emailContent = `
═══════════════════════════════════════════════════
🚨 CRITICAL HEALTH ALERT - Namma Nurse System
═══════════════════════════════════════════════════

📋 PATIENT INFORMATION:
   Name: ${patient.name}
   Age: ${patient.age} years
   Gender: ${patient.gender}
   Room: ${patient.room}
   Risk Level: ${patient.riskLevel.toUpperCase()}

⏰ ALERT TIMESTAMP:
   ${new Date().toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            dateStyle: 'full',
            timeStyle: 'long'
        })}

💬 PATIENT QUERY:
   "${query}"

⚠️ CRITICAL VALUES DETECTED:
${criticalList}

🏥 MEDICAL CONDITIONS:
   ${patient.conditions.join(', ')}

💊 CURRENT MEDICATIONS:
   ${patient.medications.length > 0
                ? patient.medications.map(m => `${m.name} (${m.dosage})`).join(', ')
                : 'None reported'}

⚡ ACTION REQUIRED:
   Please check on ${patient.name} immediately and consult with medical staff.

═══════════════════════════════════════════════════
This is an automated alert from Namma Nurse AI Healthcare System
        `.trim();

        // Send email
        const info = await transporter.sendMail({
            from: `"Namma Nurse Alert System" <${process.env.ALERT_EMAIL || 'noreply@nammanurse.com'}>`,
            to: 'bhuvaneshsundar2006@gmail.com',
            subject: `🚨 CRITICAL ALERT: ${patient.name} (Room ${patient.room})`,
            text: emailContent,
            priority: 'high'
        });

        console.log(`🚨 Critical alert email sent for ${patient.name} (${info.messageId})`);
        console.log(`   → To: bhuvaneshsundar2006@gmail.com`);
        console.log(`   → Critical values: ${criticalValues.map(c => c.biomarker).join(', ')}`);

        return true;

    } catch (error) {
        console.error('❌ Failed to send critical alert email:', error.message);
        console.error('   Make sure ALERT_EMAIL and ALERT_PASSWORD are set in .env');
        return false;
    }
};

/**
 * Log critical alert to file (backup if email fails)
 */
const logCriticalAlert = async (patient, query, criticalValues) => {
    const fs = require('fs').promises;
    const path = require('path');

    const logEntry = `
[${new Date().toISOString()}] CRITICAL ALERT
Patient: ${patient.name} (${patient.age}y, ${patient.gender}, Room ${patient.room})
Query: "${query}"
Critical Values: ${criticalValues.map(c => `${c.biomarker}=${c.value}`).join(', ')}
---
`;

    try {
        const logPath = path.join(__dirname, '../alerts.log');
        await fs.appendFile(logPath, logEntry);
        console.log(`📝 Critical alert logged to alerts.log`);
    } catch (error) {
        console.error('❌ Failed to log alert:', error.message);
    }
};

module.exports = {
    sendCriticalAlert,
    logCriticalAlert
};
