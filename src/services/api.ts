import { fallbackCategories, fallbackQuestions, fallbackUsers } from './fallbackData';
import { 
  ApiResponse, 
  Question, 
  User, 
  Category, 
  Tag, 
  PaginatedResponse 
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      // Check if it's a connection error (backend not running or CORS issue)
      if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
        throw new Error('Unable to connect to backend server. This might be a CORS issue or the server is not running.');
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
  async getQuestions(params: any = {}): Promise<PaginatedResponse<Question>> {
    try {
      const queryString = new URLSearchParams(params).toString();
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

  async getQuestion(id: string): Promise<Question> {
    const response = await this.request<Question>(`/questions/${id}`);
    return response;
  }

  async createQuestion(questionData: {
    title: string;
    content: string;
    category_id: string;
    tags?: string[];
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
    tags?: string[];
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

  // Users API
  async getActiveUsers(limit: number = 10): Promise<User[]> {
    try {
      const response = await this.request<User[]>(`/dashboard/active-users?limit=${limit}`);
      return response;
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
  async getTags(params: any = {}): Promise<Tag[]> {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/tags?${queryString}` : '/tags';
    const response = await this.request<Tag[]>(endpoint);
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
}

export const apiService = new ApiService();

// Re-export types for convenience
export type { Question, User, Category, Tag, PaginatedResponse, ApiResponse };