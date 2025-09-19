import { fallbackCategories, fallbackQuestions, fallbackUsers } from './fallbackData';
import { 
  ApiResponse, 
  Question, 
  User, 
  Category, 
  Tag, 
  PaginatedResponse,
  DailyActivity,
  Answer,
  Comment,
  ApiParams,
  VoteResponse,
  ApiError,
  QuestionActionResponse
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Development mode check
const isDevelopment = process.env.NODE_ENV === 'development';


class ApiService {
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
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
      console.log(`Making API request to: ${url}`);
      const response = await fetch(url, config);
      
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
        throw new Error(`HTTP error! status: ${response.status}`);
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
      console.error('API request failed:', error);
      console.error('Request URL:', url);
      console.error('Request config:', config);
      
      // Check if it's a connection error (backend not running or CORS issue)
      if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
        const errorMessage = isDevelopment 
          ? `Unable to connect to backend server at ${API_BASE_URL}. Please ensure the Laravel backend is running on port 8000.`
          : 'Unable to connect to backend server. This might be a CORS issue or the server is not running.';
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  // Categories API
  async getPopularCategories(limit: number = 15): Promise<Category[]> {
    try {
      const response = await this.request<{data: Category[]}>(`/categories/popular?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.warn('Using fallback data for categories. Error:', error);
      return fallbackCategories.slice(0, limit);
    }
  }

  async getCategories(): Promise<Category[]> {
    try {
      const response = await this.request<{data: Category[]}>('/categories');
      return response.data;
    } catch (error) {
      console.warn('Using fallback data for all categories. Error:', error);
      return fallbackCategories;
    }
  }

  async getCategoriesPaginated(page: number = 1): Promise<PaginatedResponse<Category>> {
    try {
      const response = await this.request<PaginatedResponse<Category>>(`/categories?page=${page}`);
      return response;
    } catch (error) {
      console.warn('Using fallback data for paginated categories. Error:', error);
      // Simulate pagination with fallback data
      const perPage = 15;
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      const paginatedCategories = fallbackCategories.slice(startIndex, endIndex);
      
      return {
        data: paginatedCategories,
        meta: {
          current_page: page,
          last_page: Math.ceil(fallbackCategories.length / perPage),
          per_page: perPage,
          total: fallbackCategories.length,
        },
        links: {
          first: '/categories?page=1',
          last: `/categories?page=${Math.ceil(fallbackCategories.length / perPage)}`,
          prev: page > 1 ? `/categories?page=${page - 1}` : null,
          next: page < Math.ceil(fallbackCategories.length / perPage) ? `/categories?page=${page + 1}` : null,
        },
      };
    }
  }

  async getCategory(slug: string): Promise<Category & { children?: Category[] }> {
    try {
      const response = await this.request<{data: Category & { children?: Category[] }}>(`/categories/${slug}`);
      return response.data;
    } catch (error) {
      console.warn('Using fallback data for category. Error:', error);
      // Find category in fallback data by slug and add children
      const fallbackCategory = fallbackCategories.find(cat => cat.slug === slug);
      if (fallbackCategory) {
        // Add children based on category hierarchy
        const children = this.getCategoryChildren(fallbackCategory.id);
        return {
          ...fallbackCategory,
          children: children
        };
      }
      throw new Error('Category not found');
    }
  }

  private getCategoryChildren(parentId: string): Category[] {
    // Define parent-child relationships for fallback data
    const relationships: { [key: string]: string[] } = {
      '1': ['9', '10', '11', '12'], // Programming -> Python, JavaScript, PHP, Java
      '2': ['13', '14', '15'], // Web Design -> React, Vue.js, Node.js
      '7': ['16', '17'], // Mobile -> Android, iOS
    };

    const childIds = relationships[parentId] || [];
    return childIds.map(id => fallbackCategories.find(cat => cat.id === id)).filter(Boolean) as Category[];
  }

  async getCategoryQuestions(slug: string, page: number = 1): Promise<PaginatedResponse<Question>> {
    try {
      const response = await this.request<PaginatedResponse<Question>>(`/categories/${slug}/questions?page=${page}`);
      return response;
    } catch (error) {
      console.warn('Using fallback data for category questions. Error:', error);
      // For fallback data, get questions from category and its subcategories
      const category = await this.getCategory(slug);
      
      // If category has children, get questions from all subcategories
      if (category.children && category.children.length > 0) {
        return this.getQuestionsFromParentCategory(category, page);
      } else {
        // If no children, get questions directly from this category
        return this.getQuestions({ category_id: category.id, page });
      }
    }
  }

  private async getQuestionsFromParentCategory(category: Category & { children?: Category[] }, page: number): Promise<PaginatedResponse<Question>> {
    // Get all questions from subcategories
    const allQuestions: Question[] = [];
    
    for (const child of category.children || []) {
      const childQuestions = await this.getQuestions({ category_id: child.id, page: 1 });
      allQuestions.push(...childQuestions.data);
    }
    
    // Also get questions directly from the parent category
    const parentQuestions = await this.getQuestions({ category_id: category.id, page: 1 });
    allQuestions.push(...parentQuestions.data);
    
    // Sort by creation date (newest first)
    allQuestions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    // Implement pagination manually
    const perPage = 10;
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedQuestions = allQuestions.slice(startIndex, endIndex);
    
    return {
      data: paginatedQuestions,
      meta: {
        current_page: page,
        last_page: Math.ceil(allQuestions.length / perPage),
        per_page: perPage,
        total: allQuestions.length,
      },
      links: {
        first: `/categories/${category.slug}?page=1`,
        last: `/categories/${category.slug}?page=${Math.ceil(allQuestions.length / perPage)}`,
        prev: page > 1 ? `/categories/${category.slug}?page=${page - 1}` : null,
        next: page < Math.ceil(allQuestions.length / perPage) ? `/categories/${category.slug}?page=${page + 1}` : null,
      },
    };
  }

  // Questions API
  async getQuestions(params: Record<string, unknown> = {}): Promise<PaginatedResponse<Question>> {
    try {
      const stringParams = Object.fromEntries(
        Object.entries(params).map(([key, value]) => [key, String(value)])
      );
      const queryString = new URLSearchParams(stringParams).toString();
      const endpoint = queryString ? `/questions?${queryString}` : '/questions';
      const response = await this.request<PaginatedResponse<Question>>(endpoint);
      return response;
    } catch (error) {
      console.warn('Using fallback data for questions. Error:', error);
      return {
        data: fallbackQuestions,
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: fallbackQuestions.length,
        },
        links: {
          first: '/questions?page=1',
          last: '/questions?page=1',
          prev: null,
          next: null,
        },
      };
    }
  }

  async getRecommendedQuestions(limit: number = 15): Promise<Question[]> {
    try {
      const response = await this.request<{data: Question[]}>(`/questions/recommended?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.warn('Using fallback data for recommended questions. Error:', error);
      return fallbackQuestions.slice(0, limit);
    }
  }

  async getPopularQuestions(limit: number = 15, period: string = 'week'): Promise<Question[]> {
    try {
      const response = await this.request<{data: Question[]}>(`/questions/popular?period=${period}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.warn('Using fallback data for popular questions. Error:', error);
      return fallbackQuestions.slice(0, limit);
    }
  }

  async searchQuestions(query: string, limit: number = 50): Promise<Question[]> {
    try {
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
    } catch (error) {
      console.warn('Falling back to unfiltered questions for search. Error:', error);
      // As a safe fallback, return at most `limit` questions
      const res = await this.getQuestions({ per_page: limit });
      return res.data;
    }
  }

  async getQuestion(id: string): Promise<Question> {
    const response = await this.request<Question>(`/questions/${id}`);
    return response;
  }

  async getQuestionBySlug(slug: string): Promise<Question> {
    try {
      const response = await this.request<{data: Question}>(`/questions/${slug}`);
      return response.data;
    } catch (error) {
      console.warn('Using fallback data for question. Error:', error);
      // Find question in fallback data by slug
      const fallbackQuestion = fallbackQuestions.find(q => q.slug === slug);
      if (fallbackQuestion) {
        return fallbackQuestion;
      }
      throw new Error('Question not found');
    }
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
    try {
      const response = await this.request<{data: User[]}>(`/dashboard/active-users?limit=${limit}`);
      // Map the response to match our User interface
      return response.data.map(user => ({
        ...user,
        image_url: user.image_url || (user as Record<string, unknown>).image as string, // Map 'image' to 'image_url'
        online: true, // Default to online since we don't have this data
        created_at: user.created_at || new Date().toISOString()
      }));
    } catch (error) {
      console.warn('Using fallback data for users. Error:', error);
      return fallbackUsers.slice(0, limit);
    }
  }

  async getUser(id: string): Promise<User> {
    const response = await this.request<User>(`/users/${id}`);
    return response;
  }

  // Tags API
  async getTags(params: Record<string, unknown> = {}): Promise<Tag[]> {
    try {
      const stringParams = Object.fromEntries(
        Object.entries(params).map(([key, value]) => [key, String(value)])
      );
      const queryString = new URLSearchParams(stringParams).toString();
      const endpoint = queryString ? `/tags?${queryString}` : '/tags';
      const response = await this.request<{data: Tag[]}>(endpoint);
      return response.data;
    } catch (error) {
      console.warn('Using fallback data for tags. Error:', error);
      return [];
    }
  }

  async getTagsPaginated(params: ApiParams = {}): Promise<{ success: boolean; data: PaginatedResponse<Tag>; error?: string }> {
    try {
      const stringParams = Object.fromEntries(
        Object.entries(params).map(([key, value]) => [key, String(value)])
      );
      const queryString = new URLSearchParams(stringParams).toString();
      const endpoint = queryString ? `/tags?${queryString}` : '/tags';
      const response = await this.request<PaginatedResponse<Tag>>(endpoint);
      return { success: true, data: response };
    } catch (error) {
      console.warn('Using fallback data for paginated tags. Error:', error);
      // Return empty paginated response for fallback
      return {
        success: false,
        error: error instanceof Error ? error.message : 'خطا در بارگذاری برچسب‌ها',
        data: {
          data: [],
          meta: {
            current_page: 1,
            last_page: 1,
            per_page: 12,
            total: 0,
          },
          links: {
            first: '/tags?page=1',
            last: '/tags?page=1',
            prev: null,
            next: null,
          },
        },
      };
    }
  }

  async getTag(slug: string): Promise<Tag> {
    try {
      const response = await this.request<Tag>(`/tags/${slug}`);
      return response;
    } catch (error) {
      console.warn('Using fallback data for tag. Error:', error);
      throw new Error('Tag not found');
    }
  }

  async getTagQuestions(slug: string, page: number = 1): Promise<PaginatedResponse<Question> & { tag: Tag }> {
    try {
      const response = await this.request<PaginatedResponse<Question> & { tag: Tag }>(`/tags/${slug}/questions?page=${page}`);
      return response;
    } catch (error) {
      console.warn('Using fallback data for tag questions. Error:', error);
      // Return empty paginated response for fallback
      return {
        data: [],
        tag: {
          id: slug,
          name: slug,
          slug: slug,
          questions_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 0,
        },
        links: {
          first: `/tags/${slug}/questions?page=1`,
          last: `/tags/${slug}/questions?page=1`,
          prev: null,
          next: null,
        },
      };
    }
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
    try {
      const stringParams = Object.fromEntries(
        Object.entries(params).map(([key, value]) => [key, String(value)])
      );
      const queryString = new URLSearchParams(stringParams).toString();
      const endpoint = queryString ? `/authors?${queryString}` : '/authors';
      const response = await this.request<PaginatedResponse<User>>(endpoint);
      return response;
    } catch (error) {
      console.warn('Using fallback data for authors. Error:', error);
      return {
        data: fallbackUsers,
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 20,
          total: fallbackUsers.length,
        },
        links: {
          first: '/authors?page=1',
          last: '/authors?page=1',
          prev: null,
          next: null,
        },
      };
    }
  }

  async getAuthor(id: string): Promise<User> {
    try {
      const response = await this.request<{data: User}>(`/authors/${id}`);
      return response.data;
    } catch (error) {
      console.warn('Using fallback data for author. Error:', error);
      const fallbackAuthor = fallbackUsers.find(user => user.id === id);
      if (fallbackAuthor) {
        return fallbackAuthor;
      }
      throw new Error('Author not found');
    }
  }

  async getAuthorQuestions(id: string, page: number = 1): Promise<PaginatedResponse<Question>> {
    try {
      const response = await this.request<PaginatedResponse<Question>>(`/authors/${id}/questions?page=${page}`);
      return response;
    } catch (error) {
      console.warn('Using fallback data for author questions. Error:', error);
      return {
        data: [],
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 0,
        },
        links: {
          first: `/authors/${id}/questions?page=1`,
          last: `/authors/${id}/questions?page=1`,
          prev: null,
          next: null,
        },
      };
    }
  }

  // Dashboard API
  async getDashboardStats(): Promise<{ total_questions: number; total_users: number; total_categories: number; total_answers: number }> {
    const response = await this.request<{ total_questions: number; total_users: number; total_categories: number; total_answers: number }>('/dashboard/stats');
    return response;
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
    try {
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
    } catch (error) {
      console.warn('Using fallback data for user profile. Error:', error);
      // Return fallback user data
      return {
        id: '1',
        name: 'کاربر نمونه',
        email: 'user@example.com',
        image_url: '',
        online: true,
        score: 0,
        level_name: 'تازه کار',
        questions_count: 0,
        answers_count: 0,
        comments_count: 0,
        created_at: new Date().toISOString(),
      };
    }
  }

  async getUserStats(): Promise<{questionsCount: number; answersCount: number; commentsCount: number}> {
    try {
      const response = await this.request<{questionsCount: number; answersCount: number; commentsCount: number}>('/user/stats');
      return response;
    } catch (error) {
      console.warn('Using fallback data for user stats. Error:', error);
      return {
        questionsCount: 0,
        answersCount: 0,
        commentsCount: 0,
      };
    }
  }

  async getUserActivity(): Promise<Array<{id: string; type: 'question' | 'answer' | 'comment' | 'vote'; description: string; created_at: string; question_slug?: string}>> {
    try {
      const response = await this.request<Array<{id: string; type: 'question' | 'answer' | 'comment' | 'vote'; description: string; created_at: string; question_slug?: string}>>('/user/activity');
      return response;
    } catch (error) {
      console.warn('Using fallback data for user activity. Error:', error);
      return [];
    }
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
    try {
      const response = await this.request<PaginatedResponse<Answer>>(`/questions/${questionId}/answers?page=${page}`);
      return response;
    } catch (error) {
      console.warn('Using fallback data for answers. Error:', error);
      return {
        data: [],
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 0,
        },
        links: {
          first: `/questions/${questionId}/answers?page=1`,
          last: `/questions/${questionId}/answers?page=1`,
          prev: null,
          next: null,
        },
      };
    }
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
    try {
      const response = await this.request<PaginatedResponse<Comment>>(`/${parentType}s/${parentId}/comments?page=${page}`);
      return response;
    } catch (error) {
      console.warn('Using fallback data for comments. Error:', error);
      return {
        data: [],
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 0,
        },
        links: {
          first: `/${parentType}s/${parentId}/comments?page=1`,
          last: `/${parentType}s/${parentId}/comments?page=1`,
          prev: null,
          next: null,
        },
      };
    }
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
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'خطا در رای دادن',
        message: (error as ApiError)?.response?.data?.message || (error as ApiError)?.message,
        status: (error as ApiError)?.response?.status
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

  // Daily Activity API
  async getDailyActivity(params: { date?: string; limit?: number } = {}): Promise<ApiResponse<DailyActivity[]>> {
    try {
      const queryParams = new URLSearchParams();
      if (params.date) queryParams.append('date', params.date);
      if (params.limit) queryParams.append('limit', params.limit.toString());

      const response = await this.request<ApiResponse<DailyActivity[]>>(
        `/dashboard/daily-activity?${queryParams.toString()}`
      );

      return response;
    } catch (error: unknown) {
      return { 
        success: false,
        data: [] as DailyActivity[],
        error: (error as ApiError)?.response?.data?.message || (error as ApiError)?.message || 'خطا در دریافت فعالیت‌های روزانه'
      };
    }
  }

}

export const apiService = new ApiService();

// Re-export types for convenience
export type { Question, User, Category, Tag, PaginatedResponse, ApiResponse, DailyActivity };