import { API_CONFIG, API_ENDPOINTS } from '../constants';
import { isAccessTokenExpired } from '../utils';
import type {
  ApiResponse,
  User,
  AuthPayload,
  AuthResponse,
  BasicDetailsPayload,
  EmailRegistrationPayload,
  CompleteUserPayload,
  SendOTPPayload,
  ProfilePayload,
  ProfileUpdatePayload,
  ChatMessage,
  ChatRoom,
  SendMessagePayload,
  CreateRoomPayload,
  GetMessagesQuery,
  UpdateMessageStatusPayload,
  RoomStats,
  AuthProfileResponse,
  AuthTokens,
  EnrichedProfile,
} from '../types';

/**
 * API Service Class
 * Handles all HTTP requests to the backend
 */
class ApiService {
  private baseURL: string;
  private timeout: number;
  private authToken: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<AuthTokens | null> | null = null;

  constructor(baseURL: string = API_CONFIG.BASE_URL, timeout: number = API_CONFIG.TIMEOUT) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  /**
   * Check if endpoint is an authentication endpoint
   * @private
   */
  private isAuthEndpoint(endpoint: string): boolean {
    return endpoint === API_ENDPOINTS.AUTH.LOGIN || 
           endpoint === API_ENDPOINTS.AUTH.REFRESH || 
           endpoint === API_ENDPOINTS.AUTH.REGISTER ||
           endpoint === API_ENDPOINTS.AUTH.EMAIL_REGISTER;
  }

  /**
   * Generic request method with automatic token refresh
   * @private
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      // Check if we need to refresh the token before making the request
      // Skip token refresh check for auth endpoints (login, register, refresh)
      const isAuth = this.isAuthEndpoint(endpoint);
      
      if (this.authToken && this.refreshToken && !isAuth) {
        const tokens = { accessToken: this.authToken, refreshToken: this.refreshToken, expiresIn: '3600' };
        if (isAccessTokenExpired(tokens)) {
          console.log('[ApiService] Access token expired, refreshing...');
          const refreshedTokens = await this.handleTokenRefresh();
          if (!refreshedTokens) {
            return {
              success: false,
              error: 'Authentication failed. Please login again.',
            };
          }
        }
      }

      const url = `${this.baseURL}${endpoint}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };

      // Add Authorization header if token is available and it's not a login/refresh request
      if (this.authToken && !isAuth) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
        console.log('[ApiService] Adding Authorization header for request to:', endpoint);
      } else {
        console.log('[ApiService] No auth token available for request to:', endpoint, isAuth ? '(auth endpoint)' : '');
      }

      const config: RequestInit = {
        headers,
        signal: controller.signal,
        ...options,
      };

      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      const json = await response.json();

      // Handle 401 Unauthorized - token might be expired
      if (response.status === 401 && this.refreshToken && !this.isAuthEndpoint(endpoint)) {
        console.log('[ApiService] Received 401, attempting token refresh...');
        const refreshedTokens = await this.handleTokenRefresh();
        if (refreshedTokens) {
          // Retry the original request with new token
          headers['Authorization'] = `Bearer ${this.authToken}`;
          const retryResponse = await fetch(url, { ...config, headers });
          const retryJson = await retryResponse.json();
          
          if (!retryResponse.ok) {
            return {
              success: false,
              error: retryJson.message || `HTTP error! status: ${retryResponse.status}`,
            };
          }
          
          return {
            success: true,
            data: retryJson.data || retryJson,
          };
        } else {
          return {
            success: false,
            error: 'Authentication failed. Please login again.',
          };
        }
      }

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
   * Register a new user with phone (two-step process)
   */
  async registerUser(payload: AuthPayload): Promise<ApiResponse<User>> {
    return this.request<User>(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Register a new user with email and password (complete registration)
   */
  async registerWithEmail(payload: EmailRegistrationPayload): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>(API_ENDPOINTS.AUTH.EMAIL_REGISTER, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Create a complete user with all details
   */
  async createCompleteUser(payload: CompleteUserPayload): Promise<ApiResponse<User>> {
    return this.request<User>(API_ENDPOINTS.USERS.CREATE, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Send OTP to phone number
   */
  async sendOTP(payload: SendOTPPayload): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(API_ENDPOINTS.OTP.SEND, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Login user with phone number
   */
  async loginUser(phoneNumber: string): Promise<ApiResponse<User>> {
    return this.request<User>(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ phoneNumber }),
    });
  }

  /**
   * Login user with email and password
   */
  async loginWithEmail(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>(API_ENDPOINTS.AUTH.REFRESH, {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
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
   * Update user details
   */
  async updateUser(userId: string, payload: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>(API_ENDPOINTS.USERS.UPDATE_PROFILE(userId), {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Create user profile
   */
  async createProfile(payload: ProfilePayload): Promise<ApiResponse<unknown>> {
    return this.request<unknown>(API_ENDPOINTS.PROFILE.CREATE, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Get authenticated user profile
   */
  async getAuthenticatedProfile(): Promise<ApiResponse<AuthProfileResponse['data']>> {
    return this.request<AuthProfileResponse['data']>(API_ENDPOINTS.AUTH.PROFILE, {
      method: 'GET',
    });
  }

  /**
   * Get enriched profile by user ID
   */
  async getEnrichedProfile(userId: string): Promise<ApiResponse<EnrichedProfile>> {
    console.log('[ApiService] getEnrichedProfile called for userId:', userId);
    return this.request<EnrichedProfile>(API_ENDPOINTS.PROFILE.GET_USER_PROFILE(userId), {
      method: 'GET',
    });
  }

  /**
   * Update user profile
   */
  async updateProfile(payload: ProfileUpdatePayload): Promise<ApiResponse<User>> {
    return this.request<User>(API_ENDPOINTS.AUTH.PROFILE, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Handle token refresh logic
   * @private
   */
  private async handleTokenRefresh(): Promise<AuthTokens | null> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    if (!this.refreshToken) {
      console.log('[ApiService] No refresh token available');
      return null;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Perform the actual token refresh request
   * @private
   */
  private async performTokenRefresh(): Promise<AuthTokens | null> {
    try {
      console.log('[ApiService] Refreshing token...');
      const response = await this.refreshAccessToken(this.refreshToken!);
      
      if (response.success && response.data) {
        const { tokens } = response.data;
        this.setTokens(tokens.accessToken, tokens.refreshToken);
        console.log('[ApiService] Token refreshed successfully');
        return tokens;
      } else {
        console.log('[ApiService] Token refresh failed:', response.error);
        this.clearTokens();
        return null;
      }
    } catch (error) {
      console.error('[ApiService] Token refresh error:', error);
      this.clearTokens();
      return null;
    }
  }

  /**
   * Set both access and refresh tokens
   */
  setTokens(accessToken: string, refreshToken: string): void {
    console.log('[ApiService] Setting tokens:', {
      accessToken: accessToken ? `${accessToken.substring(0, 20)}...` : 'null',
      refreshToken: refreshToken ? `${refreshToken.substring(0, 20)}...` : 'null'
    });
    this.authToken = accessToken;
    this.refreshToken = refreshToken;
  }

  /**
   * Set authorization token for authenticated requests
   */
  setAuthToken(token: string): void {
    console.log('[ApiService] Setting auth token:', token ? `${token.substring(0, 20)}...` : 'null');
    this.authToken = token;
  }

  /**
   * Set refresh token
   */
  setRefreshToken(token: string): void {
    console.log('[ApiService] Setting refresh token:', token ? `${token.substring(0, 20)}...` : 'null');
    this.refreshToken = token;
  }

  /**
   * Clear all tokens
   */
  clearTokens(): void {
    console.log('[ApiService] Clearing all tokens');
    this.authToken = null;
    this.refreshToken = null;
  }

  /**
   * Clear tokens and reset refresh state
   */
  resetAuth(): void {
    console.log('[ApiService] Resetting authentication state');
    this.clearTokens();
    this.isRefreshing = false;
    this.refreshPromise = null;
  }

  /**
   * Clear authorization token
   */
  clearAuthToken(): void {
    this.authToken = null;
  }

  // ==================== CHAT METHODS ====================

  /**
   * Send a message to another user or room
   */
  async sendMessage(payload: SendMessagePayload): Promise<ApiResponse<ChatMessage>> {
    return this.request<ChatMessage>(API_ENDPOINTS.CHAT.MESSAGES, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Get messages from a specific room
   */
  async getRoomMessages(
    roomId: string,
    query: GetMessagesQuery = {}
  ): Promise<ApiResponse<ChatMessage[]>> {
    const params = new URLSearchParams();
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.offset) params.append('offset', query.offset.toString());
    if (query.before) params.append('before', query.before);
    if (query.after) params.append('after', query.after);

    const endpoint = `${API_ENDPOINTS.CHAT.ROOM_MESSAGES(roomId)}${params.toString() ? `?${params.toString()}` : ''}`;
    return this.request<ChatMessage[]>(endpoint);
  }

  /**
   * Create a new chat room
   */
  async createRoom(payload: CreateRoomPayload): Promise<ApiResponse<ChatRoom>> {
    return this.request<ChatRoom>(API_ENDPOINTS.CHAT.ROOMS, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Get all chat rooms for the authenticated user
   */
  async getUserRooms(limit: number = 10, offset: number = 0): Promise<ApiResponse<ChatRoom[]>> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    const endpoint = `${API_ENDPOINTS.CHAT.ROOMS}?${params.toString()}`;
    return this.request<ChatRoom[]>(endpoint);
  }

  /**
   * Get conversation history for the authenticated user
   */
  async getConversations(limit: number = 10, offset: number = 0): Promise<ApiResponse<ChatRoom[]>> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    const endpoint = `${API_ENDPOINTS.CHAT.CONVERSATIONS}?${params.toString()}`;
    return this.request<ChatRoom[]>(endpoint);
  }

  /**
   * Update message status (delivered, read, etc.)
   */
  async updateMessageStatus(
    messageId: string,
    payload: UpdateMessageStatusPayload
  ): Promise<ApiResponse<ChatMessage>> {
    return this.request<ChatMessage>(API_ENDPOINTS.CHAT.MESSAGE_STATUS(messageId), {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Mark messages as read in a room
   */
  async markRoomAsRead(roomId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<{ success: boolean }>(API_ENDPOINTS.CHAT.ROOM_READ(roomId), {
      method: 'POST',
    });
  }

  /**
   * Get unread message count for a room
   */
  async getRoomUnreadCount(roomId: string): Promise<ApiResponse<{ count: number }>> {
    return this.request<{ count: number }>(API_ENDPOINTS.CHAT.ROOM_UNREAD_COUNT(roomId));
  }

  /**
   * Get room statistics
   */
  async getRoomStats(roomId: string): Promise<ApiResponse<RoomStats>> {
    return this.request<RoomStats>(API_ENDPOINTS.CHAT.ROOM_STATS(roomId));
  }

  /**
   * Edit a message
   */
  async editMessage(
    messageId: string,
    content: string
  ): Promise<ApiResponse<ChatMessage>> {
    return this.request<ChatMessage>(API_ENDPOINTS.CHAT.MESSAGE_EDIT(messageId), {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  }

  /**
   * Delete a message
   */
  async deleteMessage(
    messageId: string,
    hard: boolean = false
  ): Promise<ApiResponse<{ success: boolean }>> {
    const params = new URLSearchParams();
    if (hard) params.append('hard', 'true');

    const endpoint = `${API_ENDPOINTS.CHAT.MESSAGE_DELETE(messageId)}${params.toString() ? `?${params.toString()}` : ''}`;
    return this.request<{ success: boolean }>(endpoint, {
      method: 'DELETE',
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export class for testing or custom instances
export default ApiService;