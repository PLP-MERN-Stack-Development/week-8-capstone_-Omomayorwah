const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Send verification email
const sendVerificationEmail = async (email, token, firstName) => {
  try {
    const transporter = createTransporter();
    
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    const mailOptions = {
      from: `"LernBase Nigeria" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Welcome to LernBase Nigeria - Verify Your Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Welcome to LernBase Nigeria!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Your journey to better education and skills starts here.</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${firstName},</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Thank you for joining LernBase Nigeria! To complete your registration and start your learning journey, 
              please verify your email address by clicking the button below.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        display: inline-block; 
                        font-weight: bold;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            
            <p style="color: #667eea; word-break: break-all; margin-bottom: 20px;">
              ${verificationUrl}
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              This verification link will expire in 24 hours. If you didn't create an account with LernBase Nigeria, 
              you can safely ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 14px; text-align: center;">
              © 2024 LernBase Nigeria. All rights reserved.<br>
              This email was sent to ${email}
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Verification email sent to ${email}: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, token, firstName) => {
  try {
    const transporter = createTransporter();
    
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    const mailOptions = {
      from: `"LernBase Nigeria" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Reset Your LernBase Nigeria Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Password Reset Request</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">LernBase Nigeria</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${firstName},</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              We received a request to reset your password for your LernBase Nigeria account. 
              Click the button below to create a new password.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        display: inline-block; 
                        font-weight: bold;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            
            <p style="color: #667eea; word-break: break-all; margin-bottom: 20px;">
              ${resetUrl}
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              This password reset link will expire in 1 hour. If you didn't request a password reset, 
              you can safely ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 14px; text-align: center;">
              © 2024 LernBase Nigeria. All rights reserved.<br>
              This email was sent to ${email}
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Password reset email sent to ${email}: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

// Send welcome email
const sendWelcomeEmail = async (email, firstName, role) => {
  try {
    const transporter = createTransporter();
    
    const roleMessages = {
      student: 'Start your learning journey with our comprehensive educational content and assessments.',
      artisan: 'Showcase your skills and get certified to connect with potential employers.',
      employer: 'Find skilled artisans and professionals to meet your business needs.',
    };
    
    const mailOptions = {
      from: `"LernBase Nigeria" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Welcome to LernBase Nigeria!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Welcome to LernBase Nigeria!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Your account has been successfully verified.</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${firstName},</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Welcome to LernBase Nigeria! We're excited to have you on board. 
              ${roleMessages[role]}
            </p>
            
            <div style="background: #e8f4fd; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">What's Next?</h3>
              <ul style="color: #666; line-height: 1.6;">
                <li>Complete your profile</li>
                <li>Explore our learning resources</li>
                <li>Connect with other users</li>
                <li>Start your journey to success</li>
              </ul>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              If you have any questions or need assistance, don't hesitate to contact our support team.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 14px; text-align: center;">
              © 2024 LernBase Nigeria. All rights reserved.<br>
              This email was sent to ${email}
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Welcome email sent to ${email}: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error('Error sending welcome email:', error);
    throw new Error('Failed to send welcome email');
  }
};

// Send notification email
const sendNotificationEmail = async (email, subject, message, firstName = 'User') => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"LernBase Nigeria" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">LernBase Nigeria</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Notification</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${firstName},</h2>
            
            <div style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              ${message}
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 14px; text-align: center;">
              © 2024 LernBase Nigeria. All rights reserved.<br>
              This email was sent to ${email}
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Notification email sent to ${email}: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error('Error sending notification email:', error);
    throw new Error('Failed to send notification email');
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendNotificationEmail,
}; 