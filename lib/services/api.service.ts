import { API_CONFIG, API_ENDPOINTS } from '../constants';
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
} from '../types';

/**
 * API Service Class
 * Handles all HTTP requests to the backend
 */
class ApiService {
  private baseURL: string;
  private timeout: number;
  private authToken: string | null = null;

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

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };

      // Add Authorization header if token is available
      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
        console.log('[ApiService] Adding Authorization header for request to:', endpoint);
      } else {
        console.log('[ApiService] No auth token available for request to:', endpoint);
      }

      const config: RequestInit = {
        headers,
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
   * Update user profile
   */
  async updateProfile(payload: ProfileUpdatePayload): Promise<ApiResponse<User>> {
    return this.request<User>(API_ENDPOINTS.AUTH.PROFILE, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Set authorization token for authenticated requests
   */
  setAuthToken(token: string): void {
    console.log('[ApiService] Setting auth token:', token ? `${token.substring(0, 20)}...` : 'null');
    this.authToken = token;
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