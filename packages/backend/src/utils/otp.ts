import crypto from 'crypto';

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;

/**
 * Generate a random OTP code
 */
export function generateOTP(): string {
  // Generate 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  return otp;
}

/**
 * Generate OTP for development (returns fixed code for testing)
 */
export function generateDevOTP(): string {
  if (process.env.NODE_ENV === 'development') {
    return '123456'; // Fixed OTP for dev testing
  }
  return generateOTP();
}

/**
 * Hash OTP for secure storage (optional - can store plain in dev)
 */
export function hashOTP(otp: string): string {
  if (process.env.NODE_ENV === 'development') {
    return otp; // Store plain in development for easy testing
  }
  return crypto.createHash('sha256').update(otp).digest('hex');
}

/**
 * Verify OTP matches the stored hash
 */
export function verifyOTP(inputOTP: string, storedOTP: string): boolean {
  if (process.env.NODE_ENV === 'development') {
    return inputOTP === storedOTP;
  }
  
  const hashedInput = crypto.createHash('sha256').update(inputOTP).digest('hex');
  return hashedInput === storedOTP;
}

/**
 * Get OTP expiration date
 */
export function getOTPExpiration(): Date {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES);
  return expiresAt;
}

/**
 * Check if OTP has expired
 */
export function isOTPExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

/**
 * Check if max OTP attempts exceeded
 */
export function isMaxAttemptsExceeded(attempts: number): boolean {
  return attempts >= MAX_OTP_ATTEMPTS;
}

/**
 * Send OTP via email (mock implementation for now)
 */
export async function sendOTPEmail(email: string, otp: string): Promise<void> {
  // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
  console.log(`[DEV] OTP for ${email}: ${otp}`);
  
  if (process.env.NODE_ENV === 'production') {
    // Implement actual email sending
    throw new Error('Email service not configured');
  }
}

/**
 * Send OTP via SMS (mock implementation for now)
 */
export async function sendOTPSMS(phoneNumber: string, otp: string): Promise<void> {
  // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
  console.log(`[DEV] OTP for ${phoneNumber}: ${otp}`);
  
  if (process.env.NODE_ENV === 'production') {
    // Implement actual SMS sending
    throw new Error('SMS service not configured');
  }
}
