/**
 * API Response Types
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * API Error Response
 */
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}