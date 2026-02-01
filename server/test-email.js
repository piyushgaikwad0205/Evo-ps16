require('dotenv').config();
const nodemailer = require('nodemailer');

const testEmail = async () => {
    console.log('Testing Email Configuration...');

    const USER = process.env.EMAIL;
    const PASS = process.env.PASSWORD;
    const EMAIL_SERVICE = process.env.EMAIL_SERVICE;

    console.log('Service:', EMAIL_SERVICE);
    console.log('User:', USER);
    console.log('Password:', PASS ? '******' : 'Not Set');

    if (!USER || !PASS || !EMAIL_SERVICE) {
        console.error('❌ Missing email configuration in .env file.');
        console.error('Please ensure EMAIL, PASSWORD, and EMAIL_SERVICE are set.');
        return;
    }

    try {
        let transporter = nodemailer.createTransport({
            service: EMAIL_SERVICE,
            auth: {
                user: USER,
                pass: PASS,
            },
        });

        console.log('Attempting to verify connection...');
        await transporter.verify();
        console.log('✅ SMTP Connection Successful!');

        console.log('Attempting to send test email...');
        await transporter.sendMail({
            from: `"Test Script" <${USER}>`,
            to: USER, // Send to self
            subject: "Test Email from Campus Connects",
            text: "If you receive this, your email configuration is working correctly.",
        });
        console.log('✅ Test email sent successfully!');

    } catch (error) {
        console.error('❌ Email Test Failed:', error);
    }
};

testEmail();
