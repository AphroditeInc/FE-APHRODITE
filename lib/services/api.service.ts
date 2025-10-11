import { API_CONFIG, API_ENDPOINTS } from '../constants';
import type {
  ApiResponse,
  User,
  AuthPayload,
  AuthResponse,
  BasicDetailsPayload,
} from '../types';

/**
 * API Service Class
 * Handles all HTTP requests to the backend
 */
class ApiService {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string = API_CONFIG.BASE_URL, timeout: number = API_CONFIG.TIMEOUT) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  /**
   * Generic request method
   * @private
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
        ...options,
      };

      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      const json = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: json.message || `HTTP error! status: ${response.status}`,
        };
      }

      // Backend returns {success: true, data: {...}}, extract the actual data
      return {
        success: true,
        data: json.data || json,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Request timeout',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'An unknown error occurred',
      };
    }
  }

  /**
   * Register a new user
   */
  async registerUser(payload: AuthPayload): Promise<ApiResponse<User>> {
    return this.request<User>(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Verify OTP
   */
  async verifyOTP(phoneNumber: string, otp: string): Promise<ApiResponse<User>> {
    return this.request<User>(API_ENDPOINTS.AUTH.VERIFY_OTP, {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, otp }),
    });
  }

  /**
   * Login user
   */
  async loginUser(phoneNumber: string): Promise<ApiResponse<User>> {
    return this.request<User>(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ phoneNumber }),
    });
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<ApiResponse<User>> {
    return this.request<User>(API_ENDPOINTS.USERS.PROFILE(userId));
  }

  /**
   * Complete basic user details
   */
  async completeBasicDetails(
    userId: string,
    payload: BasicDetailsPayload
  ): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>(API_ENDPOINTS.USERS.BASIC_DETAILS(userId), {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Set authorization token for authenticated requests
   */
  setAuthToken(token: string): void {
    // Store token for future requests
    // This can be enhanced to automatically include token in headers
  }

  /**
   * Clear authorization token
   */
  clearAuthToken(): void {
    // Clear stored token
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export class for testing or custom instances
export default ApiService;