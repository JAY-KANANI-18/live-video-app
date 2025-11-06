import prisma from '../config/prisma';
import {
  generateAccessToken,
  generateRefreshToken,
  generateRandomToken,
  hashToken,
  getRefreshTokenExpiration,
  verifyRefreshToken,
} from '../utils/jwt';
import {
  generateDevOTP,
  hashOTP,
  verifyOTP,
  getOTPExpiration,
  isOTPExpired,
  isMaxAttemptsExceeded,
  sendOTPEmail,
  sendOTPSMS,
} from '../utils/otp';
import { hashPassword, verifyPassword } from '../utils/password';
import {
  isValidEmail,
  isValidPhoneNumber,
  isValidUsername,
  isValidAge,
} from '../utils/validation';
import { AppError } from '../middleware/errorHandler';

interface SignupData {
  email?: string;
  phoneNumber?: string;
  username: string;
  displayName?: string;
  dateOfBirth: Date;
  password?: string;
}

interface LoginData {
  email?: string;
  phoneNumber?: string;
  otp: string;
}

export class AuthService {
  /**
   * Send OTP for signup/login
   */
  async sendOTP(email?: string, phoneNumber?: string, type: 'EMAIL_VERIFICATION' | 'PHONE_VERIFICATION' | 'LOGIN' = 'LOGIN') {
    if (!email && !phoneNumber) {
      throw new AppError('Email or phone number required', 400);
    }
    
    if (email && !isValidEmail(email)) {
      throw new AppError('Invalid email format', 400);
    }
    
    if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
      throw new AppError('Invalid phone number format', 400);
    }
    
    // Generate OTP
    const otp = generateDevOTP();
    const hashedOTP = hashOTP(otp);
    const expiresAt = getOTPExpiration();
    
    // Store OTP in database
    await prisma.oTPCode.create({
      data: {
        email,
        phoneNumber,
        code: hashedOTP,
        type,
        expiresAt,
      },
    });
    
    // Send OTP
    if (email) {
      await sendOTPEmail(email, otp);
    } else if (phoneNumber) {
      await sendOTPSMS(phoneNumber, otp);
    }
    
    return {
      message: 'OTP sent successfully',
      expiresIn: 10, // minutes
    };
  }
  
  /**
   * Signup with OTP verification
   */
  async signup(data: SignupData) {
    const { email, phoneNumber, username, displayName, dateOfBirth, password } = data;
    
    // Validate required fields
    if (!username) {
      throw new AppError('Username is required', 400);
    }
    
    if (!dateOfBirth) {
      throw new AppError('Date of birth is required', 400);
    }
    
    if (!email && !phoneNumber) {
      throw new AppError('Email or phone number is required', 400);
    }
    
    // Validate username
    if (!isValidUsername(username)) {
      throw new AppError('Invalid username format (3-20 characters, alphanumeric, underscore, hyphen)', 400);
    }
    
    // Validate age (must be >= 18)
    if (!isValidAge(new Date(dateOfBirth))) {
      throw new AppError('You must be at least 18 years old to register', 400);
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          email ? { email } : {},
          phoneNumber ? { phoneNumber } : {},
          { username },
        ].filter((condition) => Object.keys(condition).length > 0),
      },
    });
    
    if (existingUser) {
      throw new AppError('User with this email, phone, or username already exists', 409);
    }
    
    // Hash password if provided
    let passwordHash: string | undefined;
    if (password) {
      passwordHash = await hashPassword(password);
    }
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        phoneNumber,
        username,
        displayName: displayName || username,
        dateOfBirth: new Date(dateOfBirth),
        passwordHash,
        // Create wallet for user
        wallet: {
          create: {},
        },
      },
      include: {
        wallet: true,
        agency: true,
      },
    });
    
    return user;
  }
  
  /**
   * Login with OTP
   */
  async loginWithOTP(data: LoginData) {
    const { email, phoneNumber, otp } = data;
    
    if (!email && !phoneNumber) {
      throw new AppError('Email or phone number required', 400);
    }
    
    if (!otp) {
      throw new AppError('OTP required', 400);
    }
    
    // Find user
    const user = await prisma.user.findFirst({
      where: email ? { email } : { phoneNumber },
      include: {
        wallet: true,
        agency: true,
        hostProfile: true,
      },
    });
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    // Check user status
    if (user.status === 'SUSPENDED') {
      throw new AppError('Account suspended', 403);
    }
    
    if (user.status === 'BANNED') {
      throw new AppError('Account banned', 403);
    }
    
    // Find OTP code
    const otpRecord = await prisma.oTPCode.findFirst({
      where: {
        OR: [
          email ? { email } : {},
          phoneNumber ? { phoneNumber } : {},
        ].filter((condition) => Object.keys(condition).length > 0),
        type: 'LOGIN',
        verified: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    if (!otpRecord) {
      throw new AppError('No OTP found. Please request a new OTP', 404);
    }
    
    // Check if OTP expired
    if (isOTPExpired(otpRecord.expiresAt)) {
      throw new AppError('OTP expired. Please request a new OTP', 400);
    }
    
    // Check max attempts
    if (isMaxAttemptsExceeded(otpRecord.attempts)) {
      throw new AppError('Too many attempts. Please request a new OTP', 429);
    }
    
    // Verify OTP
    const isValid = verifyOTP(otp, otpRecord.code);
    
    if (!isValid) {
      // Increment attempts
      await prisma.oTPCode.update({
        where: { id: otpRecord.id },
        data: { attempts: otpRecord.attempts + 1 },
      });
      
      throw new AppError('Invalid OTP', 400);
    }
    
    // Mark OTP as verified
    await prisma.oTPCode.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });
    
    // Mark email/phone as verified
    if (email) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true, lastLoginAt: new Date() },
      });
    } else if (phoneNumber) {
      await prisma.user.update({
        where: { id: user.id },
        data: { phoneVerified: true, lastLoginAt: new Date() },
      });
    }
    
    // Generate tokens
    const tokens = await this.generateTokens(user);
    
    return {
      user: {
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        bio: user.bio,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        country: user.country,
        role: user.role,
        isHost: user.isHost,
        agencyId: user.agencyId,
        level: user.level,
        experience: user.experience,
        diamonds: user.diamonds,
        wallet: user.wallet,
        hostProfile: user.hostProfile,
      },
      ...tokens,
    };
  }
  
  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string) {
    try {
      // Verify refresh token
      const payload = verifyRefreshToken(refreshToken);
      
      // Hash token to check in database
      const tokenHash = hashToken(refreshToken);
      
      // Find refresh token in database
      const storedToken = await prisma.refreshToken.findUnique({
        where: { tokenHash },
        include: {
          user: {
            include: {
              wallet: true,
              agency: true,
              hostProfile: true,
            },
          },
        },
      });
      
      if (!storedToken) {
        throw new AppError('Invalid refresh token', 401);
      }
      
      // Check if token expired
      if (new Date() > storedToken.expiresAt) {
        // Delete expired token
        await prisma.refreshToken.delete({
          where: { id: storedToken.id },
        });
        throw new AppError('Refresh token expired', 401);
      }
      
      // Generate new access token
      const accessToken = generateAccessToken({
        userId: storedToken.user.id,
        email: storedToken.user.email || undefined,
        phoneNumber: storedToken.user.phoneNumber || undefined,
        role: storedToken.user.role,
        isHost: storedToken.user.isHost,
        agencyId: storedToken.user.agencyId || undefined,
      });
      
      return {
        accessToken,
        user: {
          id: storedToken.user.id,
          email: storedToken.user.email,
          phoneNumber: storedToken.user.phoneNumber,
          username: storedToken.user.username,
          displayName: storedToken.user.displayName,
          avatar: storedToken.user.avatar,
          bio: storedToken.user.bio,
          dateOfBirth: storedToken.user.dateOfBirth,
          gender: storedToken.user.gender,
          country: storedToken.user.country,
          role: storedToken.user.role,
          isHost: storedToken.user.isHost,
          agencyId: storedToken.user.agencyId,
          level: storedToken.user.level,
          experience: storedToken.user.experience,
          diamonds: storedToken.user.diamonds,
          wallet: storedToken.user.wallet,
          hostProfile: storedToken.user.hostProfile,
        },
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Invalid refresh token', 401);
    }
  }
  
  /**
   * Logout (invalidate refresh token)
   */
  async logout(refreshToken: string) {
    const tokenHash = hashToken(refreshToken);
    
    await prisma.refreshToken.deleteMany({
      where: { tokenHash },
    });
    
    return { message: 'Logged out successfully' };
  }
  
  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(user: any) {
    // Generate refresh token
    const refreshTokenValue = generateRandomToken();
    const tokenHash = hashToken(refreshTokenValue);
    const expiresAt = getRefreshTokenExpiration();
    
    // Store refresh token in database
    const refreshTokenRecord = await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });
    
    // Generate access token
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email || undefined,
      phoneNumber: user.phoneNumber || undefined,
      role: user.role,
      isHost: user.isHost,
      agencyId: user.agencyId || undefined,
    });
    
    // Generate refresh token JWT
    const refreshToken = generateRefreshToken(user.id, refreshTokenRecord.id);
    
    return {
      accessToken,
      refreshToken: refreshTokenValue,
    };
  }
}

export const authService = new AuthService();
