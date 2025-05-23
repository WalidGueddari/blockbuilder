import { Prisma, PrismaClient } from '@saas-monorepo/database';
import bcrypt from 'bcryptjs';

import { sendEmail } from '../lib/mailing-transporter.js';
import { AbstractServiceOptions } from '../types/services.js';
import { CreateUserPayload } from '../types/users.js';

export class UsersService {
  prisma: PrismaClient;
  constructor(options: AbstractServiceOptions) {
    this.prisma = options.prisma;
  }

  async createUser(payload: CreateUserPayload) {
    let user = await this.prisma.user.findUnique({
      where: { email: payload.email.toLowerCase() },
      select: { email: true, id: true, password: true },
    });
    if (user) throw new Error('user already exist');

    const hashedPassword = await this.hashPassword(payload.password);
    const generatedCode = await this.generateUniqueNumericCode();

    user = await this.prisma.user.create({
      data: {
        email: payload.email,
        password: hashedPassword,
        name: payload.name,
        role: payload.role,
        code: generatedCode,
      },
    });

    await this.sendCodeEmail(user.email, payload.password, generatedCode);

    return user;
  }

  /**
   * Activates a user if the code matches, sets `isActive = true`,
   * and emails them their activation code.
   */
  async activateUser(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, code: true, isActive: true },
    });
    if (!user) {
      throw new Error('User not found');
    }
    if (user.isActive) {
      throw new Error('User is already active');
    }
    if (user.code !== code) {
      throw new Error('Invalid activation code');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
    });

    return updated;
  }

  /**
   * Deactivates a user (isActive = false) and notifies them by email.
   */
  async deactivateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, isActive: true },
    });
    if (!user) {
      throw new Error('User not found');
    }
    if (!user.isActive) {
      throw new Error('User is already inactive');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    await this.sendDeactivationEmail(user.email);
    return updated;
  }

  async getAllUsers(
    isActive: boolean,
    page: number,
    limit: number,
    filters: { date?: string; search?: string },
  ) {
    if (page < 1 || limit < 1) {
      throw new Error('Invalid page or limit');
    }

    const { date, search } = filters;

    // Build where clause based on status, date, and search criteria
    const where: Prisma.UserWhereInput = { isActive };

    if (date) {
      const startDate = new Date(date);
      // Set the time of startDate to 00:00:00
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(startDate);
      // Set the time of endDate to 23:59:59
      endDate.setHours(23, 59, 59, 999);

      where.create_at = { gte: startDate, lte: endDate };
    }

    if (search) {
      where.OR = [
        // { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    try {
      // Fetch users with the specified filters
      const users = await this.prisma.user.findMany({
        where,
        orderBy: { create_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      });

      // Count the total number of users matching the criteria (with filters applied)
      const total = await this.prisma.user.count({ where });

      // Calculate the total pages, check for next/previous page
      const pages = Math.ceil(total / limit);
      const hasNextPage = page < pages;
      const hasPreviousPage = page > 1;

      return {
        total,
        pages,
        hasNextPage,
        hasPreviousPage,
        nextPage: hasNextPage ? page + 1 : null,
        previousPage: hasPreviousPage ? page - 1 : null,
        page,
        limit,
        data: users,
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getLoggedUserData(id: string) {
    try {
      return await this.prisma.user.findUniqueOrThrow({
        where: {
          id: id,
        },
      });
    } catch (err: any) {
      throw err;
    }
  }

  async getUserById(id: string) {
    try {
      return await this.prisma.user.findUnique({
        where: {
          id: id,
        },
      });
    } catch (err: any) {
      throw err;
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }

  private async generateUniqueNumericCode(length = 6): Promise<string> {
    let code: string;
    let exists = true;

    do {
      code = Math.floor(Math.random() * Math.pow(10, length))
        .toString()
        .padStart(length, '0');

      const existingUser = await this.prisma.user.findFirst({
        where: { code },
        select: { id: true },
      });

      exists = !!existingUser;
    } while (exists);

    return code;
  }

  private async sendCodeEmail(email: string, rawPassword: string, code: string) {
    await sendEmail({
      recipient: [email],
      subject: 'Welcome to BlockBuilder - Activate Your Account',
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to BlockBuilder</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333333; background-color: #f9f9f9;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td style="padding: 20px 0; text-align: center; background-color: #f9f9f9;">
              <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
                <!-- Header with Logo -->
                <tr>
                  <td style="padding: 30px 40px; text-align: center; background-color: #4f46e5; border-radius: 8px 8px 0 0;">
                    <img src="https://via.placeholder.com/150x50" alt="BlockBuilder" style="max-width: 150px; height: auto;">
                  </td>
                </tr>
                
                <!-- Main Content -->
                <tr>
                  <td style="padding: 40px;">
                    <h1 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #111827;">Welcome to BlockBuilder!</h1>
                    
                    <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6;">Thank you for joining us. Your account has been created successfully, but you'll need to activate it before you can get started.</p>
                    
                    <div style="margin: 30px 0; padding: 25px; background-color: #f3f4f6; border-radius: 6px; text-align: center;">
                      <p style="margin: 0 0 15px; font-size: 14px; color: #4b5563;">Your activation code is:</p>
                      <p style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: 5px; color: #4f46e5;">${code}</p>
                    </div>
                    
                    <h2 style="margin: 30px 0 15px; font-size: 18px; font-weight: 600; color: #111827;">Your Account Information</h2>
                    
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 25px;">
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                          <strong style="font-weight: 600; color: #4b5563;">Email:</strong>
                        </td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                          ${email}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                          <strong style="font-weight: 600; color: #4b5563;">Temporary Password:</strong>
                        </td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                          ${rawPassword}
                        </td>
                      </tr>
                    </table>
                    
                    <div style="margin: 30px 0; text-align: center;">
                      <a href="[YOUR_ACTIVATION_URL]" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: #ffffff; text-decoration: none; font-weight: 600; border-radius: 6px; text-align: center;">Activate Your Account</a>
                    </div>
                    
                    <p style="margin: 25px 0 0; font-size: 16px; line-height: 1.6;">After activation, we recommend changing your password immediately for security purposes.</p>
                    
                    <p style="margin: 20px 0 0; font-size: 16px; line-height: 1.6;">If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
                    
                    <p style="margin: 25px 0 0; font-size: 16px; line-height: 1.6;">Best regards,<br>The BlockBuilder Team</p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; text-align: center; background-color: #f3f4f6; border-radius: 0 0 8px 8px; font-size: 14px; color: #6b7280;">
                    <p style="margin: 0 0 15px;">© ${new Date().getFullYear()} BlockBuilder. All rights reserved.</p>
                    
                    <div style="margin: 0 0 15px;">
                      <a href="#" style="display: inline-block; margin: 0 8px; color: #4f46e5; text-decoration: none;">Privacy Policy</a>
                      <a href="#" style="display: inline-block; margin: 0 8px; color: #4f46e5; text-decoration: none;">Terms of Service</a>
                      <a href="#" style="display: inline-block; margin: 0 8px; color: #4f46e5; text-decoration: none;">Contact Us</a>
                    </div>
                    
                    <div style="margin: 20px 0 0;">
                      <a href="#" style="display: inline-block; margin: 0 8px;"><img src="https://via.placeholder.com/30" alt="Facebook" style="width: 24px; height: 24px;"></a>
                      <a href="#" style="display: inline-block; margin: 0 8px;"><img src="https://via.placeholder.com/30" alt="Twitter" style="width: 24px; height: 24px;"></a>
                      <a href="#" style="display: inline-block; margin: 0 8px;"><img src="https://via.placeholder.com/30" alt="LinkedIn" style="width: 24px; height: 24px;"></a>
                      <a href="#" style="display: inline-block; margin: 0 8px;"><img src="https://via.placeholder.com/30" alt="Instagram" style="width: 24px; height: 24px;"></a>
                    </div>
                    
                    <p style="margin: 20px 0 0; font-size: 12px; color: #9ca3af;">This email was sent to ${email}. If you did not create an account with us, please disregard this email.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    });
  }

  private async sendActivationEmail(email: string, code: string) {
    await sendEmail({
      recipient: [email],
      subject: 'Your BlockBuilder account is now active!',
      html: `
        <p>Hi there,</p>
        <p>Your account has just been activated. Your activation code was: <strong>${code}</strong>.</p>
        <p>You can now log in at <a href="https://yourapp.com/login">https://yourapp.com/login</a>.</p>
        <p>Thanks for joining BlockBuilder!</p>
      `,
    });
  }

  /** Send the deactivation notification email */
  private async sendDeactivationEmail(email: string) {
    await sendEmail({
      recipient: [email],
      subject: 'Your BlockBuilder account has been deactivated',
      html: `
        <p>Hello,</p>
        <p>This is to let you know that your account has been deactivated. 
        If you believe this was a mistake, please contact support.</p>
        <p>Best regards,<br/>The BlockBuilder Team</p>
      `,
    });
  }
}
