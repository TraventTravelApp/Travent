import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';
import { decrypt } from '../utils/crypto';

/**
 * Validates that the API_BASE_URL uses HTTPS protocol for security
 * @returns {string|null} Error message if validation fails, null if valid
 */
function validateApiUrl(): string | null {
  if (!process.env.EXPO_PUBLIC_API_BASE_URL && !'https://gaq4nwm4l6.execute-api.us-east-1.amazonaws.com/dev') {
    return 'API_BASE_URL is not configured';
  }
  
  // Get the actual API_BASE_URL value
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://gaq4nwm4l6.execute-api.us-east-1.amazonaws.com/dev';
  
  try {
    const url = new URL(apiBaseUrl);
    if (url.protocol !== 'https:') {
      return 'API calls must use HTTPS protocol for security';
    }
    return null;
  } catch (error) {
    return `Invalid API_BASE_URL format: ${error instanceof Error ? error.message : String(error)}`;
  }
}

// Prefer an Expo public env var for local testing, with the deployed API as fallback.
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  'https://02qxzqxjjd.execute-api.us-east-1.amazonaws.com/dev';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  // TEMPORARY: Skip backend calls if no API_BASE_URL is set
  if (!API_BASE_URL) {
    logger.warn('⚠️ No backend configured - using mock mode');
    return {
      success: false,
      error: 'Backend not configured yet. Deploy your backend first!',
    };
  }

  const fullUrl = `${API_BASE_URL}${endpoint}`;
  logger.debug(`[API] ${options.method || 'GET'} ${fullUrl}`);

  try {
    // Use id_token for API authentication (contains user identity)
    const encryptedToken = await AsyncStorage.getItem('id_token');
    const token = encryptedToken ? decrypt(encryptedToken) : null;
    logger.debug('[API] Token:', token ? 'Present' : 'MISSING');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      logger.debug('[API] Auth header set, token present');
    } else {
      logger.warn('[API] ⚠️ No token - request will likely fail auth');
    }

    logger.debug('[API] Sending request...');
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });
    logger.debug('[API] HTTP Status:', response.status, response.statusText);

    const lambdaResponse = await response.json();
    logger.debug('[API] Lambda response:', {
      hasBody: !!lambdaResponse.body,
      statusCode: lambdaResponse.statusCode,
      bodyType: typeof lambdaResponse.body
    });

    // AWS Lambda returns {statusCode, body} format
    // Parse the body field (which is a JSON string)
    let data;
    if (lambdaResponse.body) {
      try {
        data = typeof lambdaResponse.body === 'string'
          ? JSON.parse(lambdaResponse.body)
          : lambdaResponse.body;
        logger.debug('[API] Parsed body, keys:', Object.keys(data));
      } catch (e) {
        logger.error('[API] Parse failed:', { error: e, body: lambdaResponse.body });
        return {
          success: false,
          error: 'Invalid response format from server',
        };
      }
    } else {
      data = lambdaResponse;
      logger.debug('[API] No body field, using lambdaResponse directly');
    }

    if (!response.ok || lambdaResponse.statusCode >= 400) {
      const errorMsg = data.error || data.message || 'An error occurred';
      logger.error('[API] Request failed:', {
        httpStatus: response.status,
        lambdaStatus: lambdaResponse.statusCode,
        error: errorMsg
      });
      return {
        success: false,
        error: errorMsg,
      };
    }

    logger.debug('[API] ✅ Success');
    return {
      success: true,
      data,
    };
  } catch (error) {
    logger.error('[API] Exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

export const api = {
  get: <T>(endpoint: string) => fetchApi<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, body?: any) =>
    fetchApi<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body?: any) =>
    fetchApi<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: <T>(endpoint: string) =>
    fetchApi<T>(endpoint, { method: 'DELETE' }),
};
