import { environment } from '../../environments/environment';

/**
 * Service to manage Google API keys
 * Supports fallback: user-provided key (localStorage) > environment key
 */
export class ApiKeyService {
  private static readonly STORAGE_KEY = 'user_google_api_key';

  /**
   * Get the API key to use, with priority:
   * 1. User-provided key from localStorage
   * 2. Environment key
   */
  static getApiKey(): string {
    const userKey = this.getUserApiKey();
    if (userKey) {
      return userKey;
    }
    return this.getEnvironmentApiKey();
  }

  /**
   * Get user-provided API key from localStorage
   */
  static getUserApiKey(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.STORAGE_KEY);
  }

  /**
   * Save user-provided API key to localStorage
   */
  static setUserApiKey(apiKey: string): void {
    if (typeof window === 'undefined') return;
    if (apiKey.trim()) {
      localStorage.setItem(this.STORAGE_KEY, apiKey.trim());
    } else {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  /**
   * Remove user-provided API key
   */
  static clearUserApiKey(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Get environment API key
   */
  private static getEnvironmentApiKey(): string {
    return environment?.googleApiKey || '';
  }

  /**
   * Check if error is a 429 rate limit error
   */
  static isRateLimitError(error: any): boolean {
    if (!error) return false;
    
    // Convert error to string for comprehensive checking
    const errorString = JSON.stringify(error).toLowerCase();
    const errorMessage = (error.message || error.toString() || '').toLowerCase();
    const errorStack = (error.stack || '').toLowerCase();
    
    // Check status codes in various locations
    const errorStatus = 
      error.status || 
      error.statusCode || 
      error.response?.status ||
      error.response?.statusCode ||
      error.cause?.status ||
      error.cause?.statusCode;
    
    // Check for 429 status code
    if (errorStatus === 429) return true;
    
    // Check error code (some APIs use error.code)
    if (error.code === 429 || error.response?.data?.error?.code === 429) return true;
    
    // Check for rate limit keywords in various error properties
    const rateLimitKeywords = [
      '429',
      'rate limit',
      'quota exceeded',
      'daily limit',
      'quota',
      'resource_exhausted',
      'resource exhausted',
      'too many requests',
      'quotaexceeded'
    ];
    
    // Check in error message
    if (rateLimitKeywords.some(keyword => errorMessage.includes(keyword))) return true;
    
    // Check in error string (full JSON)
    if (rateLimitKeywords.some(keyword => errorString.includes(keyword))) return true;
    
    // Check in stack trace
    if (rateLimitKeywords.some(keyword => errorStack.includes(keyword))) return true;
    
    // Check response data for Google API specific errors
    const responseData = error.response?.data || error.data || {};
    const responseString = JSON.stringify(responseData).toLowerCase();
    if (rateLimitKeywords.some(keyword => responseString.includes(keyword))) return true;
    
    // Check for Google API specific error format
    if (responseData.error?.message && 
        rateLimitKeywords.some(keyword => responseData.error.message.toLowerCase().includes(keyword))) {
      return true;
    }
    
    return false;
  }
}

