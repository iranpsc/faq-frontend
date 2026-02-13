// Removed fallback data imports - API should fail gracefully without mock data
import { 
  ApiResponse, 
  Question, 
  User, 
  Category, 
  Tag, 
  PaginatedResponse,
  DailyActivity,
  ActivityApiResponse,
  Answer,
  Comment,
  ApiParams,
  VoteResponse,
  ApiError,
  QuestionActionResponse
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const SERVER_API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.faqhub.ir/api'
  : 'http://localhost:8000/api';

const isDevelopment = process.env.NODE_ENV === 'development';

/** In-flight server GET requests: same URL reuses one request (deduplication) */
const serverRequestCache = new Map<string, Promise<unknown>>();

function getServerRequestCacheKey(endpoint: string, options: RequestInit): string | null {
  if (typeof window !== 'undefined') return null;
  const method = (options.method || 'GET').toUpperCase();
  if (method !== 'GET' || options.body !== undefined) return null;
  return endpoint;
}

class ApiService {
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private processParams(params: Record<string, unknown>): Record<string, string> {
    return Object.fromEntries(
      Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== null)
        .map(([key, value]) => [key, String(value)])
    );
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getAuthToken();
    
    // Don't set Content-Type for FormData, let browser set it with boundary
    const isFormData = options.body instanceof FormData;
    
    const config: RequestInit = {
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for production API
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Clear invalid token and dispatch logout event
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            window.dispatchEvent(new CustomEvent('auth:logout'));
          }
          throw new Error('Authentication required. Please log in again.');
        }
        
        // Try to parse error response body for more details
        let errorMessage = `HTTP error! status: ${response.status}`;
        let errorData: unknown = null;
        
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            errorData = await response.json();
            if (errorData && typeof errorData === 'object' && 'message' in errorData) {
              errorMessage = (errorData as { message: string }).message;
            }
          }
        } catch {
          // If we can't parse the error response, use the default message
        }
        
        // Create a custom error object that preserves response data
        const error = new Error(errorMessage) as Error & { response?: { status: number; data: unknown } };
        error.response = {
          status: response.status,
          data: errorData
        };
        throw error;
      }
      
      // Check if response has content before parsing JSON
      const contentType = response.headers.get('content-type');
      const hasJsonContent = contentType && contentType.includes('application/json');
      const hasContent = response.status !== 204 && response.headers.get('content-length') !== '0';
      
      if (hasJsonContent && hasContent) {
        const data = await response.json();
        return data as T;
      } else {
        // For empty responses (like 204 No Content), return success indicator
        return { success: true } as T;
      }
    } catch (error) {
      if (isDevelopment) {
        console.error('API request failed:', error);
        console.error('Request URL:', url);
      } else {
        const msg = error instanceof Error ? error.message : String(error);
        console.error('API request failed:', msg);
      }
      // Check if it's a connection error (backend not running or CORS issue)
      if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
        const errorMessage = isDevelopment 
          ? `Unable to connect to backend server at ${API_BASE_URL}. Please ensure the Laravel backend is running on port 8000.`
          : `Unable to connect to production API at ${API_BASE_URL}. The server may be down or unreachable.`;
        throw new Error(errorMessage);
      }
      
      // Handle AbortError (timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        const errorMessage = `Request timeout: The API server at ${API_BASE_URL} is not responding within 30 seconds.`;
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  // Categories API
  async getPopularCategories(limit: number = 15): Promise<Category[]> {
    const response = await this.request<{data: Category[]}>(`/categories/popular?limit=${limit}`);
    return response.data;
  }

  async getCategories(): Promise<Category[]> {
    const response = await this.request<{data: Category[]}>('/categories');
    return response.data;
  }

  async getCategoriesPaginated(page: number = 1): Promise<PaginatedResponse<Category>> {
    const response = await this.request<PaginatedResponse<Category>>(`/categories?page=${page}`);
    return response;
  }

  async getCategory(slug: string): Promise<Category & { children?: Category[] }> {
    const response = await this.request<{data: Category & { children?: Category[] }}>(`/categories/${slug}`);
    return response.data;
  }


  async getCategoryQuestions(slug: string, page: number = 1): Promise<PaginatedResponse<Question>> {
    const response = await this.request<PaginatedResponse<Question>>(`/categories/${slug}/questions?page=${page}`);
    return response;
  }


  // Questions API
  async getQuestions(params: Record<string, unknown> = {}): Promise<PaginatedResponse<Question>> {
    const stringParams = this.processParams(params);
    const queryString = new URLSearchParams(stringParams).toString();
    const endpoint = queryString ? `/questions?${queryString}` : '/questions';
    const response = await this.request<PaginatedResponse<Question>>(endpoint);
    return response;
  }

  async getRecommendedQuestions(limit: number = 15): Promise<Question[]> {
    const response = await this.request<{data: Question[]}>(`/questions/recommended?limit=${limit}`);
    return response.data;
  }

  async getPopularQuestions(limit: number = 15, period: string = 'week'): Promise<Question[]> {
    const response = await this.request<{data: Question[]}>(`/questions/popular?period=${period}&limit=${limit}`);
    return response.data;
  }

  async searchQuestions(query: string, limit: number = 50): Promise<Question[]> {
    const q = encodeURIComponent(query);
    const response = await this.request<{ success: boolean; data: Record<string, unknown> | Question[]; message?: string }>(`/questions/search?q=${q}&limit=${limit}`);
    // The backend returns { success, data: ResourceCollection, message }
    // ResourceCollection for non-paginated collections is typically { data: Question[] }
    const payload = response.data;
    if (Array.isArray(payload)) {
      return payload as Question[];
    }
    if (payload && Array.isArray(payload.data)) {
      return payload.data as Question[];
    }
    return [];
  }

  async getQuestion(id: string): Promise<Question> {
    const response = await this.request<Question>(`/questions/${id}`);
    return response;
  }

  async getQuestionBySlug(slug: string): Promise<Question> {
    const response = await this.request<{data: Question}>(`/questions/${slug}`);
    return response.data;
  }

  async createQuestion(questionData: {
    title: string;
    content: string;
    category_id: string;
    tags?: Array<{ id: number } | { name: string }>;
  }): Promise<{ success: boolean; data?: Question; error?: string }> {
    try {
      const response = await this.request<{ data: Question }>('/questions', {
        method: 'POST',
        body: JSON.stringify(questionData),
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'خطا در ایجاد سوال' 
      };
    }
  }

  async updateQuestion(id: string, questionData: {
    title: string;
    content: string;
    category_id: string;
    tags?: Array<{ id: number } | { name: string }>;
  }): Promise<{ success: boolean; data?: Question; error?: string }> {
    try {
      const response = await this.request<{ data: Question }>(`/questions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(questionData),
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'خطا در ویرایش سوال' 
      };
    }
  }

  async deleteQuestion(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.request(`/questions/${id}`, {
        method: 'DELETE',
      });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'خطا در حذف سوال' 
      };
    }
  }

  // Users API
  async getActiveUsers(limit: number = 10): Promise<User[]> {
    const response = await this.request<{data: User[]}>(`/dashboard/active-users?limit=${limit}`);
    // Map the response to match our User interface
    return response.data.map(user => ({
      ...user,
      image_url: user.image_url || (user as Record<string, unknown>).image as string, // Map 'image' to 'image_url'
      online: true, // Default to online since we don't have this data
      created_at: user.created_at || new Date().toISOString()
    }));
  }

  async getUser(id: string): Promise<User> {
    const response = await this.request<User>(`/users/${id}`);
    return response;
  }

  // Tags API
  async getTags(params: Record<string, unknown> = {}): Promise<Tag[]> {
    const stringParams = this.processParams(params);
    const queryString = new URLSearchParams(stringParams).toString();
    const endpoint = queryString ? `/tags?${queryString}` : '/tags';
    const response = await this.request<{data: Tag[]}>(endpoint);
    return response.data;
  }

  async getTagsPaginated(params: ApiParams = {}): Promise<{ success: boolean; data: PaginatedResponse<Tag>; error?: string }> {
    const stringParams = this.processParams(params);
    const queryString = new URLSearchParams(stringParams).toString();
    const endpoint = queryString ? `/tags?${queryString}` : '/tags';
    const response = await this.request<PaginatedResponse<Tag>>(endpoint);
    return { success: true, data: response };
  }

  async getTag(slug: string): Promise<Tag> {
    const response = await this.request<Tag>(`/tags/${slug}`);
    return response;
  }

  async getTagQuestions(slug: string, page: number = 1): Promise<PaginatedResponse<Question> & { tag: Tag }> {
    const response = await this.request<PaginatedResponse<Question> & { tag: Tag }>(`/tags/${slug}/questions?page=${page}`);
    return response;
  }

  async createTag(name: string): Promise<{ success: boolean; data?: Tag; error?: string }> {
    try {
      const response = await this.request<{ data: Tag }>('/tags', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'خطا در ایجاد برچسب' 
      };
    }
  }

  // Authors API
  async getAuthors(params: Record<string, unknown> = {}): Promise<PaginatedResponse<User>> {
    const stringParams = this.processParams(params);
    const queryString = new URLSearchParams(stringParams).toString();
    const endpoint = queryString ? `/authors?${queryString}` : '/authors';
    const response = await this.request<PaginatedResponse<User>>(endpoint);
    return response;
  }

  async getAuthor(username: string): Promise<User> {
    const response = await this.request<{data: User}>(`/authors/${username}`);
    return response.data;
  }

  async getAuthorQuestions(username: string, page: number = 1): Promise<PaginatedResponse<Question>> {
    const response = await this.request<PaginatedResponse<Question>>(`/authors/${username}/questions?page=${page}`);
    return response;
  }

  // Dashboard API
  async getDashboardStats(): Promise<{ totalQuestions: number; totalAnswers: number; totalUsers: number; solvedQuestions: number }> {
    const response = await this.request<{ success: boolean; data: { totalQuestions: number; totalAnswers: number; totalUsers: number; solvedQuestions: number } }>('/dashboard/stats');
    return response.data;
  }

  // Authentication API
  async getAuthRedirect(intendedUrl: string): Promise<{ redirect_url: string }> {
    const response = await this.request<{ redirect_url: string }>('/auth/redirect', {
      method: 'POST',
      body: JSON.stringify({ intended_url: intendedUrl }),
    });
    return response;
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.request<User>('/auth/me');
    return response;
  }

  async logout(): Promise<void> {
    await this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // User Profile API
  async getUserProfile(): Promise<User> {
    const response = await this.request<{
      id: string;
      name: string;
      email: string;
      mobile?: string;
      image: string | null;
      score: number;
      online: boolean;
      login_notification_enabled: boolean;
      created_at: string;
    }>('/user/profile');
    
    // Map the response to match our User interface
    return {
      id: response.id,
      name: response.name,
      email: response.email,
      mobile: response.mobile,
      image_url: response.image || '', // Map 'image' to 'image_url'
      online: response.online,
      score: response.score,
      login_notification_enabled: response.login_notification_enabled,
      level_name: 'تازه کار', // Default value
      questions_count: 0, // Default value
      answers_count: 0, // Default value
      comments_count: 0, // Default value
      created_at: response.created_at,
    };
  }

  async getUserStats(): Promise<{questionsCount: number; answersCount: number; commentsCount: number}> {
    const response = await this.request<{questionsCount: number; answersCount: number; commentsCount: number}>('/user/stats');
    return response;
  }

  async getUserActivity(): Promise<Array<{id: string; type: 'question' | 'answer' | 'comment' | 'vote'; description: string; created_at: string; question_slug?: string}>> {
    const response = await this.request<Array<{id: string; type: 'question' | 'answer' | 'comment' | 'vote'; description: string; created_at: string; question_slug?: string}>>('/user/activity');
    return response;
  }

  async updateUserImage(file: File): Promise<{success: boolean; data?: {image_url: string}; error?: string}> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await this.request<{
        message: string;
        image_url: string;
      }>('/user/update-image', {
        method: 'POST',
        body: formData,
      });

      return { success: true, data: { image_url: response.image_url } };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'خطا در بروزرسانی عکس پروفایل' 
      };
    }
  }

  async updateUserSettings(settings: {login_notification_enabled: boolean}): Promise<{success: boolean; data?: {login_notification_enabled: boolean}; error?: string}> {
    try {
      const response = await this.request<{
        message: string;
        login_notification_enabled: boolean;
      }>('/user/settings', {
        method: 'POST',
        body: JSON.stringify(settings),
      });

      return { success: true, data: { login_notification_enabled: response.login_notification_enabled } };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'خطا در بروزرسانی تنظیمات' 
      };
    }
  }

  // Answers API
  async getQuestionAnswers(questionId: string, page: number = 1): Promise<PaginatedResponse<Answer>> {
    const response = await this.request<PaginatedResponse<Answer>>(`/questions/${questionId}/answers?page=${page}`);
    return response;
  }

  async addAnswer(questionId: string, content: string): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> {
    try {
      const response = await this.request<{ data: Record<string, unknown> }>(`/questions/${questionId}/answers`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'خطا در ایجاد پاسخ' 
      };
    }
  }

  async updateAnswer(answerId: string, content: string): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> {
    try {
      const response = await this.request<{ data: Record<string, unknown> }>(`/answers/${answerId}`, {
        method: 'PUT',
        body: JSON.stringify({ content }),
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'خطا در ویرایش پاسخ' 
      };
    }
  }

  async deleteAnswer(answerId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.request(`/answers/${answerId}`, {
        method: 'DELETE',
      });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'خطا در حذف پاسخ' 
      };
    }
  }

  async publishAnswer(answerId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.request(`/answers/${answerId}/publish`, {
        method: 'POST',
      });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'خطا در انتشار پاسخ' 
      };
    }
  }

  async toggleAnswerCorrectness(answerId: string): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> {
    try {
      const response = await this.request<{ data: Record<string, unknown> }>(`/answers/${answerId}/toggle-correctness`, {
        method: 'POST',
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'خطا در تغییر وضعیت صحیح بودن پاسخ' 
      };
    }
  }

  // Comments API
  async getComments(parentId: string, parentType: 'question' | 'answer', page: number = 1): Promise<PaginatedResponse<Comment>> {
    const response = await this.request<PaginatedResponse<Comment>>(`/${parentType}s/${parentId}/comments?page=${page}`);
    return response;
  }

  async addComment(parentId: string, content: string, parentType: 'question' | 'answer'): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> {
    try {
      const response = await this.request<{ data: Record<string, unknown> }>(`/${parentType}s/${parentId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'خطا در ایجاد نظر' 
      };
    }
  }

  async updateComment(commentId: string, content: string): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> {
    try {
      const response = await this.request<{ data: Record<string, unknown> }>(`/comments/${commentId}`, {
        method: 'PUT',
        body: JSON.stringify({ content }),
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'خطا در ویرایش نظر' 
      };
    }
  }

  async deleteComment(commentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.request(`/comments/${commentId}`, {
        method: 'DELETE',
      });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'خطا در حذف نظر' 
      };
    }
  }

  async publishComment(commentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.request(`/comments/${commentId}/publish`, {
        method: 'POST',
      });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'خطا در انتشار نظر' 
      };
    }
  }

  // Voting API
  async vote(resourceType: 'question' | 'answer' | 'comment', resourceId: string, voteType: 'up' | 'down'): Promise<{ success: boolean; data?: VoteResponse; error?: string; message?: string; status?: number }> {
    try {
      const response = await this.request<{ data: VoteResponse }>(`/${resourceType}s/${resourceId}/vote`, {
        method: 'POST',
        body: JSON.stringify({ type: voteType }),
      });
      return { success: true, data: response.data };
    } catch (error: unknown) {
      const errorObj = error as Error & { response?: { status: number; data?: { message?: string } } };
      
      // Handle 409 Conflict specifically
      if (errorObj.response?.status === 409) {
        return {
          success: false,
          error: 'conflict',
          message: errorObj.response?.data?.message || 'شما قبلا به این مورد رای داده‌اید',
          status: 409
        };
      }
      
      // Handle other errors
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'خطا در رای دادن',
        message: errorObj.response?.data?.message || (error instanceof Error ? error.message : 'خطا در رای دادن'),
        status: errorObj.response?.status
      };
    }
  }

  // Question Actions API
  async publishQuestion(questionId: string): Promise<{ success: boolean; data?: Question; error?: string }> {
    try {
      const response = await this.request<{ 
        success: boolean; 
        data: Question; 
        message: string; 
      }>(`/questions/${questionId}/publish`, {
        method: 'POST',
      });
      return { success: true, data: response.data };
    } catch (error: unknown) {
      return { 
        success: false, 
        error: (error as ApiError)?.response?.data?.message || (error as ApiError)?.message || 'خطا در انتشار سوال'
      };
    }
  }

  async pinQuestion(questionId: string): Promise<{ success: boolean; data?: QuestionActionResponse; error?: string }> {
    try {
      const response = await this.request<{ 
        success: boolean; 
        message: string; 
        is_pinned_by_user: boolean; 
        pinned_at: string; 
      }>(`/questions/${questionId}/pin`, {
        method: 'POST',
      });
      return { 
        success: true, 
        data: {
          is_pinned_by_user: response.is_pinned_by_user,
          pinned_at: response.pinned_at || undefined
        }
      };
    } catch (error: unknown) {
      return { 
        success: false, 
        error: (error as ApiError)?.response?.data?.message || (error as ApiError)?.message || 'خطا در پین کردن سوال'
      };
    }
  }

  async unpinQuestion(questionId: string): Promise<{ success: boolean; data?: QuestionActionResponse; error?: string }> {
    try {
      const response = await this.request<{ 
        success: boolean; 
        message: string; 
        is_pinned_by_user: boolean; 
        pinned_at: string | null; 
      }>(`/questions/${questionId}/pin`, {
        method: 'DELETE',
      });
      return { 
        success: true, 
        data: {
          is_pinned_by_user: response.is_pinned_by_user,
          pinned_at: response.pinned_at || undefined
        }
      };
    } catch (error: unknown) {
      return { 
        success: false, 
        error: (error as ApiError)?.response?.data?.message || (error as ApiError)?.message || 'خطا در برداشتن پین سوال'
      };
    }
  }

  async featureQuestion(questionId: string): Promise<{ success: boolean; data?: QuestionActionResponse; error?: string }> {
    try {
      const response = await this.request<{ 
        success: boolean; 
        message: string; 
        is_featured_by_user: boolean; 
        featured_at: string; 
      }>(`/questions/${questionId}/feature`, {
        method: 'POST',
      });
      return { 
        success: true, 
        data: {
          is_featured_by_user: response.is_featured_by_user,
          featured_at: response.featured_at || undefined
        }
      };
    } catch (error: unknown) {
      return { 
        success: false, 
        error: (error as ApiError)?.response?.data?.message || (error as ApiError)?.message || 'خطا در ویژه کردن سوال'
      };
    }
  }

  async unfeatureQuestion(questionId: string): Promise<{ success: boolean; data?: QuestionActionResponse; error?: string }> {
    try {
      const response = await this.request<{ 
        success: boolean; 
        message: string; 
        is_featured_by_user: boolean; 
        featured_at: string | null; 
      }>(`/questions/${questionId}/feature`, {
        method: 'DELETE',
      });
      return { 
        success: true, 
        data: {
          is_featured_by_user: response.is_featured_by_user,
          featured_at: response.featured_at || undefined
        }
      };
    } catch (error: unknown) {
      return { 
        success: false, 
        error: (error as ApiError)?.response?.data?.message || (error as ApiError)?.message || 'خطا در برداشتن ویژگی سوال'
      };
    }
  }

  // Activity API
  async getActivity(params: { 
    limit?: number; 
    offset?: number;
  } = {}): Promise<ActivityApiResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());

      const queryString = queryParams.toString();
      const endpoint = queryString
        ? `/dashboard/activity?${queryString}`
        : '/dashboard/activity';

      if (typeof window === 'undefined') {
        // Use longer timeout for production (30 seconds) to handle slow API responses
        const timeout = process.env.NODE_ENV === 'production' ? 30000 : 10000;
        return await this.serverRequest<ActivityApiResponse>(endpoint, {}, timeout);
      }

      return await this.request<ActivityApiResponse>(endpoint);
    } catch (error: unknown) {
      // Log error for debugging but return safe fallback
      const errorMessage = (error as ApiError)?.response?.data?.message 
        || (error as ApiError)?.message 
        || (error as Error)?.message
        || 'خطا در دریافت فعالیت‌ها';
      
      if (process.env.NODE_ENV === 'development') {
        console.error('getActivity error:', error);
      }
      
      return { 
        success: false,
        data: [] as DailyActivity[],
        error: errorMessage
      };
    }
  }

  // Server-side compatible methods (no browser APIs)
  async serverRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    timeout: number = process.env.NODE_ENV === 'production' ? 30000 : 10000
  ): Promise<T> {
    const url = `${SERVER_API_BASE_URL}${endpoint}`;
    const cacheKey = getServerRequestCacheKey(endpoint, options);

    if (cacheKey) {
      const pending = serverRequestCache.get(cacheKey);
      if (pending) {
        return pending as Promise<T>;
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const headers = new Headers({
      'Accept': 'application/json',
      'Connection': 'keep-alive',
    });

    const applyHeaders = (source?: HeadersInit) => {
      if (!source) {
        return;
      }

      if (source instanceof Headers) {
        source.forEach((value, key) => {
          headers.set(key, value);
        });
        return;
      }

      if (Array.isArray(source)) {
        for (const [key, value] of source) {
          if (value !== undefined) {
            headers.set(key, value);
          }
        }
        return;
      }

      Object.entries(source).forEach(([key, value]) => {
        if (value !== undefined) {
          headers.set(key, value as string);
        }
      });
    };

    applyHeaders(options.headers);

    const hasBody = options.body !== undefined && options.body !== null;
    const shouldSetContentType =
      hasBody &&
      !(options.body instanceof FormData) &&
      !headers.has('Content-Type');

    if (shouldSetContentType) {
      headers.set('Content-Type', 'application/json');
    }

    if (typeof window === 'undefined') {
      try {
        const { cookies: getCookies, headers: getHeaders } = await import('next/headers');
        const cookieStore = await getCookies();

        const cookiePairs = cookieStore
          .getAll()
          .map(({ name, value }) => `${name}=${value}`);

        if (cookiePairs.length > 0) {
          headers.set('Cookie', cookiePairs.join('; '));
        }

        if (!headers.has('Authorization')) {
          const token =
            cookieStore.get('auth_token')?.value ??
            cookieStore.get('AuthToken')?.value ??
            cookieStore.get('token')?.value ??
            null;

          if (token) {
            headers.set('Authorization', 'Bearer ' + token);
          } else {
            const incomingHeaders = await getHeaders();
            const incomingAuthHeader = incomingHeaders.get('authorization');
            if (incomingAuthHeader) {
              headers.set('Authorization', incomingAuthHeader);
            }
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to apply server-side auth headers:', error);
        }
      }
    }

    const config: RequestInit = {
      ...options,
      headers,
      signal: controller.signal,
    };

    const doRequest = async (): Promise<T> => {
      try {
        const response = await fetch(url, config);
        clearTimeout(timeoutId);
        if (!response.ok) {
          console.error(`Server API request failed: ${url}`);
          console.error(`Status: ${response.status} ${response.statusText}`);
          let errorBody = '';
          try {
            const ct = response.headers.get('content-type');
            if (ct?.includes('application/json')) {
              const errorData = await response.json();
              errorBody = JSON.stringify(errorData);
            } else {
              errorBody = await response.text();
            }
            if (errorBody) console.error(`Response body: ${errorBody}`);
          } catch {
            // Ignore parsing errors
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const contentType = response.headers.get('content-type');
        const hasJsonContent = contentType && contentType.includes('application/json');
        const hasContent = response.status !== 204 && response.headers.get('content-length') !== '0';
        if (hasJsonContent && hasContent) {
          const data = await response.json();
          return data as T;
        }
        return { success: true } as T;
    } catch (error) {
      clearTimeout(timeoutId);
      if ((error as Error).name === 'AbortError' || (error as Error).name === 'TimeoutError') {
        const errorMsg = `Request timeout after ${timeout}ms for ${endpoint}`;
        if (process.env.NODE_ENV === 'development') {
          console.error('Server API request timeout:', errorMsg);
        }
        throw new Error(errorMsg);
      }
      if ((error as Error & { code?: string; errno?: number })?.code === 'ETIMEDOUT'
          || (error as Error & { code?: string })?.code === 'ECONNREFUSED'
          || (error as Error & { code?: string })?.code === 'ENOTFOUND') {
        const errorMsg = `Network error connecting to API: ${endpoint}`;
        if (process.env.NODE_ENV === 'development') {
          console.error('Server API network error:', errorMsg, error);
        }
        throw new Error(errorMsg);
      }
      if (process.env.NODE_ENV === 'development') {
        console.error('Server API request failed:', endpoint, error);
      }
      throw error;
    }
    };

    if (cacheKey) {
      const promise = doRequest().finally(() => {
        serverRequestCache.delete(cacheKey);
      });
      serverRequestCache.set(cacheKey, promise);
      return promise as Promise<T>;
    }
    return doRequest();
  }

  // Server-side question methods
  async getQuestionBySlugServer(slug: string): Promise<Question> {
    const response = await this.serverRequest<{data: Question}>(`/questions/${slug}`);
    return response.data;
  }

  async getQuestionAnswersServer(questionId: string): Promise<PaginatedResponse<Answer>> {
    const response = await this.serverRequest<PaginatedResponse<Answer>>(`/questions/${questionId}/answers`);
    return response;
  }

  async getQuestionsServer(params: Record<string, unknown> = {}): Promise<PaginatedResponse<Question>> {
    const stringParams = this.processParams(params);
    const queryString = new URLSearchParams(stringParams).toString();
    const endpoint = queryString ? `/questions?${queryString}` : '/questions';
    const response = await this.serverRequest<PaginatedResponse<Question>>(endpoint);
    return response;
  }

  async getActiveUsersServer(limit: number = 10): Promise<User[]> {
    const response = await this.serverRequest<{data: User[]}>(`/dashboard/active-users?limit=${limit}`);
    return response.data.map(user => ({
      ...user,
      image_url: user.image_url || (user as Record<string, unknown>).image as string,
      online: true,
      created_at: user.created_at || new Date().toISOString()
    }));
  }

  async getTagQuestionsServer(slug: string, page: number = 1): Promise<PaginatedResponse<Question> & { tag: Tag }> {
    const response = await this.serverRequest<PaginatedResponse<Question> & { tag: Tag }>(`/tags/${slug}/questions?page=${page}`);
    return response;
  }

  async getTagsPaginatedServer(params: Record<string, unknown> = {}): Promise<PaginatedResponse<Tag>> {
    const stringParams = this.processParams(params);
    const queryString = new URLSearchParams(stringParams).toString();
    const endpoint = queryString ? `/tags?${queryString}` : '/tags';
    const response = await this.serverRequest<PaginatedResponse<Tag>>(endpoint);
    return response;
  }

  // Server-side category methods
  async getCategoriesPaginatedServer(params: Record<string, unknown> = {}): Promise<PaginatedResponse<Category>> {
    const stringParams = this.processParams(params);
    const queryString = new URLSearchParams(stringParams).toString();
    const endpoint = queryString ? `/categories?${queryString}` : '/categories';
    const response = await this.serverRequest<PaginatedResponse<Category>>(endpoint);
    return response;
  }

  async getCategoryServer(slug: string): Promise<Category & { children?: Category[] }> {
    const response = await this.serverRequest<Category & { children?: Category[] }>(`/categories/${slug}`);
    return response;
  }

  async getCategoryQuestionsServer(slug: string, page: number = 1): Promise<PaginatedResponse<Question> & { category: Category }> {
    const response = await this.serverRequest<PaginatedResponse<Question> & { category: Category }>(`/categories/${slug}/questions?page=${page}`);
    return response;
  }

  // Server-side author methods
  async getAuthorsServer(params: Record<string, unknown> = {}): Promise<PaginatedResponse<User>> {
    const stringParams = this.processParams(params);
    const queryString = new URLSearchParams(stringParams).toString();
    const endpoint = queryString ? `/authors?${queryString}` : '/authors';
    const response = await this.serverRequest<PaginatedResponse<User>>(endpoint);
    return response;
  }

async getAuthorServer(username: string): Promise<User> {
  const response = await this.serverRequest<{ data: User }>(`/authors/${username}`);
  return response.data;
}


  async getAuthorQuestionsServer(username: string, page: number = 1): Promise<PaginatedResponse<Question> & { author: User }> {
    const response = await this.serverRequest<PaginatedResponse<Question> & { author: User }>(`/authors/${username}/questions?page=${page}`);
    return response;
  }

  // Server-side activity methods
  async getActivityServer(params: { 
    limit?: number; 
    offset?: number;
  } = {}): Promise<{
    success: boolean;
    data: DailyActivity[];
    grouped_data: { [month: string]: DailyActivity[] };
    error?: string;
  }> {
    try {
      const queryParams = new URLSearchParams();
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());

      const response = await this.serverRequest<{
        success: boolean;
        data: DailyActivity[];
        grouped_data: { [month: string]: DailyActivity[] };
        error?: string;
      }>(`/dashboard/activity?${queryParams.toString()}`);

      // Ensure response has the expected structure
      return {
        success: response.success || false,
        data: Array.isArray(response.data) ? response.data : [],
        grouped_data: response.grouped_data && typeof response.grouped_data === 'object' ? response.grouped_data : {},
        error: response.error
      };
    } catch (error: unknown) {
      console.error('Activity server request failed:', error);
      return { 
        success: false,
        data: [] as DailyActivity[],
        grouped_data: {},
        error: (error as ApiError)?.response?.data?.message || (error as ApiError)?.message || 'خطا در دریافت فعالیت‌ها'
      };
    }
  }
}

export const apiService = new ApiService();

// Re-export types for convenience
export type { Question, User, Category, Tag, PaginatedResponse, ApiResponse, DailyActivity, Answer, Comment };