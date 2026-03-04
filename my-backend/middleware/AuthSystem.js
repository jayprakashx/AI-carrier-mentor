const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('./models/User');

class AuthSystem {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  // Generate reset token
  generateResetToken() {
    return crypto.randomBytes(20).toString('hex');
  }

  // Generate hash from token
  generateResetTokenHash(token) {
    return crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
  }

  // Send password reset email
  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const message = `
      <h1>Password Reset Request</h1>
      <p>You are receiving this email because you (or someone else) has requested a password reset for your account.</p>
      <p>Please click on the following link to reset your password:</p>
      <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
      <p>If you did not request this, please ignore this email.</p>
      <p>This reset token will expire in 10 minutes.</p>
    `;

    try {
      await this.transporter.sendMail({
        to: user.email,
        subject: 'Password Reset Request - AI Mock Interview',
        html: message
      });

      return true;
    } catch (error) {
      console.error('Email sending error:', error);
      return false;
    }
  }

  // Send welcome email
  async sendWelcomeEmail(user) {
    const message = `
      <h1>Welcome to AI Mock Interview Platform! 🎉</h1>
      <p>Hi ${user.name},</p>
      <p>Thank you for registering with our AI Mock Interview platform. We're excited to help you prepare for your next job interview!</p>
      <p>With our platform, you can:</p>
      <ul>
        <li>Practice with AI-powered interviews</li>
        <li>Get detailed feedback on your answers</li>
        <li>Improve your technical and behavioral skills</li>
        <li>Track your progress over time</li>
      </ul>
      <p>Start your first mock interview now and take your interview skills to the next level!</p>
      <p>Best regards,<br>The AI Mock Interview Team</p>
    `;

    try {
      await this.transporter.sendMail({
        to: user.email,
        subject: 'Welcome to AI Mock Interview Platform!',
        html: message
      });

      return true;
    } catch (error) {
      console.error('Welcome email sending error:', error);
      return false;
    }
  }

  // Validate password strength
  validatePasswordStrength(password) {
    const minLength = 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const issues = [];
    
    if (password.length < minLength) {
      issues.push(`Password must be at least ${minLength} characters long`);
    }
    if (!hasUpperCase) {
      issues.push('Password must contain at least one uppercase letter');
    }
    if (!hasLowerCase) {
      issues.push('Password must contain at least one lowercase letter');
    }
    if (!hasNumbers) {
      issues.push('Password must contain at least one number');
    }
    if (!hasSpecialChar) {
      issues.push('Password must contain at least one special character');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  // Generate email verification token
  generateEmailVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Send email verification
  async sendEmailVerification(user, verificationToken) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    const message = `
      <h1>Verify Your Email Address</h1>
      <p>Hi ${user.name},</p>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}" clicktracking=off>Verify Email Address</a>
      <p>If you did not create an account with us, please ignore this email.</p>
    `;

    try {
      await this.transporter.sendMail({
        to: user.email,
        subject: 'Verify Your Email - AI Mock Interview',
        html: message
      });

      return true;
    } catch (error) {
      console.error('Verification email sending error:', error);
      return false;
    }
  }
}

module.exports = new AuthSystem();