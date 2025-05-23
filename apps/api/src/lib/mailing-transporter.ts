import { createTransport } from 'nodemailer';

import { config } from '../config.js';
import { EmailPayload } from '../types/email.js';

export const sendEmail = async (params: EmailPayload) => {
  const { smtpHost, smtpUser, smtpPass } = config;
  try {
    const transporter = createTransport({
      host: smtpHost,
      port: 587,
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Define email options
    const mailOptions = {
      from: smtpUser,
      to: params.recipient.join(', '),
      subject: params.subject,
      html: params.html,
    };

    const sendEmailNow = async () => {
      try {
        const sentEmail = await transporter.sendMail(mailOptions);
        console.log('Email sent:', sentEmail);
        return sentEmail;
      } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
      }
    };
    return await sendEmailNow();
  } catch (error) {
    console.error('Error in sendEmail function:', error);
    throw new Error('Failed to send email');
  }
};
