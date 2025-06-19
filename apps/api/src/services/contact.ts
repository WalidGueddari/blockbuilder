import { sendEmail } from '../lib/mailing-transporter.js';

const CONTACT_EMAIL = 'marwenjaballah23@gmail.com';

export class ContactService {
  /**
   * Sends a contact email containing the user's email address to the contact mailbox.
   * @param userEmail The email address provided by the user.
   */
  async sendContactEmail(userEmail: string) {
    return sendEmail({
      recipient: [CONTACT_EMAIL],
      subject: 'New Contact Request from CTA',
      html: `
        <h2>New Contact Request</h2>
        <p>A user submitted their email via the CTA section:</p>
        <p><strong>Email:</strong> ${userEmail}</p>
        <p>Sent from BlockBuilder CTA section.</p>
      `,
    });
  }
}
