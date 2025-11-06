import apiClient from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  email?: string;
  phoneNumber?: string;
  username: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: string;
  country?: string;
  role: string;
  isHost: boolean;
  agencyId?: string;
  level: number;
  experience: number;
  diamonds: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface SignupData {
  email?: string;
  phoneNumber?: string;
  username: string;
  displayName?: string;
  dateOfBirth: string;
  password?: string;
}

export interface LoginData {
  email?: string;
  phoneNumber?: string;
  otp: string;
}

class AuthService {
  /**
   * Send OTP for login/signup
   */
  async sendOTP(email?: string, phoneNumber?: string): Promise<void> {
    const response = await apiClient.post('/auth/send-otp', {
      email,
      phoneNumber,
      type: 'LOGIN',
    });
    return response.data;
  }

  /**
   * Register new user
   */
  async signup(data: SignupData): Promise<{ user: User; message: string }> {
    const response = await apiClient.post('/auth/signup', data);
    return response.data;
  }

  /**
   * Login with OTP
   */
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', data);
    const { accessToken, refreshToken, user } = response.data;

    // Store tokens and user data
    await AsyncStorage.multiSet([
      ['accessToken', accessToken],
      ['refreshToken', refreshToken],
      ['user', JSON.stringify(user)],
    ]);

    return response.data;
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const response = await apiClient.get('/auth/profile');
    const user = response.data.user;

    // Update stored user data
    await AsyncStorage.setItem('user', JSON.stringify(user));

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiClient.put('/auth/profile', data);
    const user = response.data.user;

    // Update stored user data
    await AsyncStorage.setItem('user', JSON.stringify(user));

    return user;
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<string> {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post('/auth/refresh', { refreshToken });
    const { accessToken } = response.data;

    await AsyncStorage.setItem('accessToken', accessToken);

    return accessToken;
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem('accessToken');
    return !!token;
  }

  /**
   * Get stored user data
   */
  async getStoredUser(): Promise<User | null> {
    const userStr = await AsyncStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  }
}

export const authService = new AuthService();
