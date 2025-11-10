const sgMail = require('@sendgrid/mail');
require('dotenv').config();

// Direct environment variable access
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL;
const FRONTEND_URL = process.env.FRONTEND_URL;
const EMAIL_RATE_LIMIT_MAX = parseInt(process.env.EMAIL_RATE_LIMIT_MAX) || 5;
const EMAIL_RATE_LIMIT_WINDOW_MINUTES =
  parseInt(process.env.EMAIL_RATE_LIMIT_WINDOW_MINUTES) || 15;

// Initialize SendGrid with error handling
if (!SENDGRID_API_KEY) {
  console.warn('⚠️  SENDGRID_API_KEY not configured. Email service disabled.');
} else {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

class EmailService {
  constructor() {
    this.rateLimitStore = new Map();
  }

  checkRateLimit(email) {
    const now = Date.now();
    const windowMs = EMAIL_RATE_LIMIT_WINDOW_MINUTES * 60 * 1000;
    const maxAttempts = EMAIL_RATE_LIMIT_MAX;

    if (!this.rateLimitStore.has(email)) {
      this.rateLimitStore.set(email, { count: 1, firstAttempt: now });
      return true;
    }

    const record = this.rateLimitStore.get(email);

    if (now - record.firstAttempt > windowMs) {
      this.rateLimitStore.set(email, { count: 1, firstAttempt: now });
      return true;
    }

    if (record.count >= maxAttempts) {
      return false;
    }

    record.count++;
    return true;
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  sanitizeInput(text) {
    if (!text || typeof text !== 'string') return '';
    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim()
      .substring(0, 200);
  }

  async sendSecureEmail(to, subject, htmlContent, textContent) {
    if (!this.isValidEmail(to)) {
      throw new Error('Invalid email address format');
    }

    if (!this.checkRateLimit(to)) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    if (!SENDGRID_API_KEY) {
      throw new Error('Email service not configured');
    }

    console.log('🔍 Attempting to send email:', {
      to: to,
      from: SENDGRID_FROM_EMAIL,
      apiKeyConfigured: !!SENDGRID_API_KEY,
      apiKeyPrefix: SENDGRID_API_KEY
        ? SENDGRID_API_KEY.substring(0, 10) + '...'
        : 'NOT SET',
    });

    const msg = {
      to: to.toLowerCase().trim(),
      from: {
        email: SENDGRID_FROM_EMAIL,
        name: 'Voluntalia',
      },
      subject: this.sanitizeInput(subject),
      html: htmlContent,
      text: textContent,
      // Remove or disable sandbox mode
      // mail_settings: {
      //   sandbox_mode: {
      //     enable: process.env.NODE_ENV === 'development',
      //   },
      // },
      tracking_settings: {
        click_tracking: { enable: false },
        open_tracking: { enable: false },
      },
      reply_to: {
        email: SENDGRID_FROM_EMAIL,
        name: 'Voluntalia Support',
      },
    };

    try {
      const response = await sgMail.send(msg);
      console.log(`✅ Email sent successfully to ${to}`);
      console.log(
        '📊 SendGrid Response:',
        response[0]?.statusCode,
        response[0]?.headers
      ); // Add this line
      return response;
    } catch (error) {
      console.error('❌ SendGrid Error Details:', {
        message: error.message,
        code: error.code,
        response: error.response?.body,
        errors: error.response?.body?.errors, // ← Add this line
        statusCode: error.response?.statusCode,
        headers: error.response?.headers,
      });

      throw new Error('Failed to send email. Please try again later.');
    }
  }

  /**
   * Send welcome email to new volunteers with password reset link
   * @param {string} email - User's email
   * @param {string} userName - User's name
   * @param {string} resetToken - Password reset token
   */
  async sendWelcomeEmail(email, userName, resetToken) {
    // Enhanced validation
    if (!email || typeof email !== 'string') {
      throw new Error('Valid email address is required');
    }

    if (!userName || typeof userName !== 'string') {
      throw new Error('Valid user name is required');
    }

    if (!resetToken || typeof resetToken !== 'string') {
      throw new Error('Valid reset token is required');
    }

    // Sanitize inputs
    const sanitizedEmail = email.toLowerCase().trim();
    const sanitizedName = this.sanitizeInput(userName);
    const sanitizedToken = resetToken.trim();

    // Additional security checks
    if (sanitizedName.length < 1) {
      throw new Error('User name cannot be empty after sanitization');
    }

    if (sanitizedEmail.length > 254) {
      throw new Error('Email address is too long');
    }

    // Generate email content with reset link
    const htmlContent = this.getWelcomeEmailTemplate(
      sanitizedName,
      sanitizedToken
    );
    const textContent = this.getWelcomeTextContent(
      sanitizedName,
      sanitizedToken
    );

    // Send with security headers
    return this.sendSecureEmail(
      sanitizedEmail,
      'Welcome to Voluntalia! 🎉',
      htmlContent,
      textContent
    );
  }

  /**
   * Welcome email HTML template with password reset
   * @private
   */
  getWelcomeEmailTemplate(userName, resetToken) {
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Voluntalia</title>
      </head>
      <body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #2563eb; font-size: 28px; margin: 0; font-weight: 700;">
              🤝 Voluntalia
            </h1>
            <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 16px;">
              Making volunteering accessible worldwide
            </p>
          </div>

          <!-- Welcome Message -->
          <div style="margin-bottom: 30px;">
            <h2 style="color: #1f2937; font-size: 24px; margin-bottom: 16px;">
              Welcome, ${userName}! 🎉
            </h2>
            
            <p style="margin-bottom: 16px; font-size: 16px; color: #374151;">
              Thank you for joining our global community of volunteers making a real difference in the world.
            </p>
            
            <p style="margin-bottom: 20px; font-size: 16px; color: #374151;">
              You're now part of a movement that connects passionate people with meaningful volunteer opportunities across the globe.
            </p>
          </div>

          <!-- Password Setup Section -->
          <div style="background-color: #f8fafc; padding: 24px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #2563eb;">
            <h3 style="color: #1f2937; font-size: 18px; margin: 0 0 12px 0;">
              🔐 Complete Your Account Setup
            </h3>
            <p style="margin-bottom: 16px; font-size: 16px; color: #374151;">
              To secure your account and start volunteering, please set your password by clicking the button below:
            </p>
          </div>

          <!-- CTA Button - FIXED STYLING -->
          <div style="text-align: center; margin: 32px 0;">
            <table role="presentation" style="margin: 0 auto;">
              <tr>
                <td style="background: #2563eb; border-radius: 8px; padding: 0;">
                  <a href="${resetUrl}" 
                     style="background: #2563eb !important; color: #ffffff !important; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; font-family: 'Segoe UI', Arial, sans-serif; border: none; mso-padding-alt: 0; text-align: center;">
                    <span style="color: #ffffff !important;">Set Your Password</span>
                  </a>
                </td>
              </tr>
            </table>
          </div>

          <!-- Security Notice -->
          <div style="background-color: #fef3c7; padding: 16px; border-radius: 6px; margin: 24px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; font-size: 14px; color: #92400e;">
              <strong>🛡️ Security Notice:</strong> This link will expire in 24 hours for your security. If you didn't create this account, please ignore this email.
            </p>
          </div>

          <!-- Features -->
          <div style="margin: 32px 0;">
            <h3 style="color: #1f2937; font-size: 18px; margin-bottom: 16px;">What's next after setting your password?</h3>
            <ul style="color: #374151; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Browse volunteer opportunities in your area</li>
              <li style="margin-bottom: 8px;">Connect with organizations that match your interests</li>
              <li style="margin-bottom: 8px;">Track your volunteer hours and impact</li>
              <li style="margin-bottom: 8px;">Join a community of changemakers</li>
            </ul>
          </div>

          <!-- Footer -->
          <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;">
          
          <div style="text-align: center;">
            <p style="font-size: 14px; color: #6b7280; margin: 8px 0;">
              Need help? Reply to this email or visit our support center.
            </p>
            <p style="font-size: 12px; color: #9ca3af; margin: 16px 0 0 0;">
              © 2025 Voluntalia. All rights reserved.
            </p>
            <p style="font-size: 11px; color: #9ca3af; margin: 8px 0 0 0;">
              If the button doesn't work, copy and paste this link: ${resetUrl}
            </p>
          </div>

        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate plain text version of welcome email with reset link
   * @private
   */
  getWelcomeTextContent(userName, resetToken) {
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

    return `
Welcome to Voluntalia, ${userName}! 🎉

Thank you for joining our global community of volunteers making a real difference in the world.

You're now part of a movement that connects passionate people with meaningful volunteer opportunities across the globe.

COMPLETE YOUR ACCOUNT SETUP:
To secure your account and start volunteering, please set your password by visiting:
${resetUrl}

SECURITY NOTICE: This link will expire in 24 hours for your security. If you didn't create this account, please ignore this email.

What's next after setting your password?
• Browse volunteer opportunities in your area
• Connect with organizations that match your interests
• Track your volunteer hours and impact
• Join a community of changemakers

Need help? Reply to this email or visit our support center.

© 2025 Voluntalia. All rights reserved.
    `.trim();
  }

  async testConnection() {
    try {
      if (!SENDGRID_API_KEY) {
        return { success: false, message: 'SendGrid API key not configured' };
      }

      if (!SENDGRID_API_KEY.startsWith('SG.')) {
        return { success: false, message: 'Invalid SendGrid API key format' };
      }

      return { success: true, message: 'Email service configured correctly' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

module.exports = new EmailService();
