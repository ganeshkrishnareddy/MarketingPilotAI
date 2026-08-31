import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.zoho.in',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export interface SendEmailOptions {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
}

/**
 * Sends an email using the central platform sender address.
 */
export async function sendEmail({ to, subject, text, html }: SendEmailOptions) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        throw new Error("SMTP credentials are not configured in environment variables.");
    }

    const from = process.env.EMAIL_FROM || process.env.SMTP_USER;

    try {
        const info = await transporter.sendMail({
            from,
            to: Array.isArray(to) ? to.join(', ') : to,
            subject,
            text,
            html,
        });

        console.log(`Email sent successfully to ${to}. Message ID: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Failed to send email:", error);
        throw error;
    }
}
