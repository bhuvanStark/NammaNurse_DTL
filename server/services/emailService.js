const nodemailer = require('nodemailer');

/**
 * Email service for sending caretaker alerts
 */

// Create transporter (will be configured from env variables)
let transporter = null;

const initializeTransporter = () => {
    if (transporter) return transporter;

    // Check if email is configured
    const emailUser = process.env.GMAIL_USER || process.env.EMAIL_USER;
    const emailPass = process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASSWORD;

    if (!emailUser || !emailPass) {
        console.warn('⚠️  Email service not configured. Using console logging only.');
        return null;
    }

    try {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: emailUser,
                pass: emailPass
            }
        });

        console.log('✅ Email service initialized successfully');
        return transporter;
    } catch (error) {
        console.error('❌ Failed to initialize email service:', error.message);
        return null;
    }
};

/**
 * Send caretaker alert email
 */
const sendCaretakerAlert = async (patientName, roomNumber, timestamp) => {
    const caretakerEmail = process.env.CARETAKER_EMAIL || 'caretaker@example.com';

    const mailOptions = {
        from: process.env.GMAIL_USER || 'namma-nurse@example.com',
        to: caretakerEmail,
        subject: `🚨 Assistance Request - ${patientName} (Room ${roomNumber})`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
                <h2 style="color: #dc2626;">🚨 Assistance Requested</h2>
                <p style="font-size: 16px; line-height: 1.6;">
                    An elderly resident has requested assistance.
                </p>
                
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Patient:</strong> ${patientName}</p>
                    <p style="margin: 5px 0;"><strong>Room Number:</strong> ${roomNumber}</p>
                    <p style="margin: 5px 0;"><strong>Time:</strong> ${timestamp}</p>
                </div>
                
                <p style="font-size: 14px; color: #6b7280;">
                    Please attend to this request as soon as possible.
                </p>
                
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
                
                <p style="font-size: 12px; color: #9ca3af;">
                    This is an automated message from Namma Nurse - Voice-First AI Healthcare Assistant
                </p>
            </div>
        `,
        text: `
🚨 ASSISTANCE REQUESTED

An elderly resident has requested assistance.

Patient: ${patientName}
Room Number: ${roomNumber}
Time: ${timestamp}

Please attend to this request as soon as possible.

---
This is an automated message from Namma Nurse - Voice-First AI Healthcare Assistant
        `
    };

    try {
        const transport = initializeTransporter();

        if (!transport) {
            // Fallback: Just log to console
            console.log('\n' + '='.repeat(60));
            console.log('📧 CARETAKER ALERT (Email not configured - Console only)');
            console.log('='.repeat(60));
            console.log(`Patient: ${patientName}`);
            console.log(`Room: ${roomNumber}`);
            console.log(`Time: ${timestamp}`);
            console.log(`Would send to: ${caretakerEmail}`);
            console.log('='.repeat(60) + '\n');
            return {
                success: true,
                method: 'console',
                message: 'Alert logged to console (email not configured)'
            };
        }

        const info = await transport.sendMail(mailOptions);
        console.log(`✅ Caretaker alert sent successfully to ${caretakerEmail}`);
        console.log(`   Message ID: ${info.messageId}`);

        return {
            success: true,
            method: 'email',
            messageId: info.messageId,
            recipient: caretakerEmail
        };

    } catch (error) {
        console.error('❌ Failed to send caretaker alert:', error.message);

        // Fallback to console logging
        console.log('\n' + '='.repeat(60));
        console.log('📧 CARETAKER ALERT (Email failed - Fallback to console)');
        console.log('='.repeat(60));
        console.log(`Patient: ${patientName}`);
        console.log(`Room: ${roomNumber}`);
        console.log(`Time: ${timestamp}`);
        console.log(`Error: ${error.message}`);
        console.log('='.repeat(60) + '\n');

        return {
            success: true,
            method: 'console_fallback',
            error: error.message,
            message: 'Alert logged to console (email failed)'
        };
    }
};

module.exports = {
    sendCaretakerAlert
};
