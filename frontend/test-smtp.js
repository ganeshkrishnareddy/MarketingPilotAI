require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.zoho.in',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

async function run() {
    try {
        console.log("Verifying connection to Zoho SMTP...");
        await transporter.verify();
        console.log("Server is ready to take our messages!");
    } catch (e) {
        console.error("SMTP Error:", e);
    }
}
run();
