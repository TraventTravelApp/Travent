import AsyncStorage from '@react-native-async-storage/async-storage';
import { encrypt, decrypt } from '../utils/crypto';
import { api, ApiResponse } from './api';

export interface SignupRequest {
  email: string;
  password: string;
}

export interface SignupResponse {
  user_id: string;
  email: string;
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user_id: string;
  email: string;
  id_token: string;
  access_token: string;
  refresh_token: string;
}

export interface ConfirmEmailRequest {
  email: string;
  code: string;
}

export interface ConfirmEmailResponse {
  message: string;
}

export interface ResendCodeRequest {
  email: string;
}

export interface ResendCodeResponse {
  message: string;
}

export const authService = {
  /**
   * Sign up a new user
   * Note: User must verify email before logging in
   */
  signup: async (data: SignupRequest): Promise<ApiResponse<SignupResponse>> => {
    return api.post<SignupResponse>('/auth/signup', data);
  },

  /**
   * Log in an existing user
   * Returns tokens for authenticated requests
   */
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await api.post<LoginResponse>('/auth/login', data);

    // Store tokens if login successful
    if (response.success && response.data) {
      await AsyncStorage.setItem('user_id', response.data.user_id);
      await AsyncStorage.setItem('email', response.data.email);
      await AsyncStorage.setItem('id_token', encrypt(response.data.id_token));
      await AsyncStorage.setItem('access_token', encrypt(response.data.access_token));
      await AsyncStorage.setItem('refresh_token', encrypt(response.data.refresh_token));
    }

    return response;
  },

  /**
   * Confirm email with verification code
   */
  confirmEmail: async (data: ConfirmEmailRequest): Promise<ApiResponse<ConfirmEmailResponse>> => {
    return api.post<ConfirmEmailResponse>('/auth/confirm', data);
  },

  /**
   * Resend verification code
   */
  resendCode: async (data: ResendCodeRequest): Promise<ApiResponse<ResendCodeResponse>> => {
    return api.post<ResendCodeResponse>('/auth/resend', data);
  },

  /**
   * Log out user (clear tokens)
   */
  logout: async () => {
    await AsyncStorage.removeItem('user_id');
    await AsyncStorage.removeItem('email');
    await AsyncStorage.removeItem('id_token');
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('refresh_token');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const encryptedToken = await AsyncStorage.getItem('id_token');
      if (!encryptedToken) {
        return false;
      }

      // Decrypt token
      const token = decrypt(encryptedToken);
      if (!token) {
        return false;
      }

      // Decode JWT payload (second part of token)
      const payloadBase64 = token.split('.')[1];
      if (!payloadBase64) {
        return false;
      }

      // Convert base64url to base64
      const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      
      // Add padding if needed
      const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
      
      // Decode base64 string
      const payloadStr = atob(padded);
      const payload = JSON.parse(payloadStr);

      // Check if token is expired
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();

      return expirationTime > currentTime;
    } catch (error) {
      console.error('[AUTH] Error validating token:', error);
      return false; // Fail closed - if we can't validate, treat as unauthenticated
    }
  },

  /**
   * Get current user info from AsyncStorage
   */
  getCurrentUser: async () => {
    const user_id = await AsyncStorage.getItem('user_id');
    const email = await AsyncStorage.getItem('email');
    return { user_id, email };
  },
};
