'use client';

// Request cache for GET requests
const requestCache = new Map<string, { response: Response; timestamp: number }>();
const pendingRequests = new Map<string, Promise<Response>>();

interface RequestConfig extends RequestInit {
  skipCache?: boolean;
  cacheTimeout?: number;
}

class EnhancedApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  }

  // Enhanced request method with caching and interceptors
  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Apply request interceptor
    const interceptedConfig = this.requestInterceptor(url, config);
    
    // Handle caching for GET requests
    if (interceptedConfig.method === 'get' || !interceptedConfig.method) {
      const cacheKey = `${url}?${new URLSearchParams(interceptedConfig.params || {}).toString()}`;
      
      // Check if request is already pending
      if (pendingRequests.has(cacheKey)) {
        const response = await pendingRequests.get(cacheKey)!;
        return this.responseInterceptor(response, interceptedConfig);
      }

      // Check cache
      if (!interceptedConfig.skipCache) {
        const cached = requestCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < (interceptedConfig.cacheTimeout || 300000)) { // 5 min default
          return this.responseInterceptor(cached.response, interceptedConfig);
        }
      }
    }

    // Make the request
    const requestPromise = fetch(url, interceptedConfig);
    
    // Store pending request for GET requests
    if (interceptedConfig.method === 'get' || !interceptedConfig.method) {
      const cacheKey = `${url}?${new URLSearchParams(interceptedConfig.params || {}).toString()}`;
      pendingRequests.set(cacheKey, requestPromise);
    }

    try {
      const response = await requestPromise;
      return this.responseInterceptor(response, interceptedConfig);
    } catch (error) {
      // Clean up pending request on error
      if (interceptedConfig.method === 'get' || !interceptedConfig.method) {
        const cacheKey = `${url}?${new URLSearchParams(interceptedConfig.params || {}).toString()}`;
        pendingRequests.delete(cacheKey);
      }
      throw error;
    }
  }

  // Request interceptor
  private requestInterceptor(url: string, config: RequestConfig): RequestConfig {
    try {
      const token = localStorage.getItem('auth_token');
      
      const headers: HeadersInit = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...config.headers,
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else if (headers['Authorization']) {
        delete headers['Authorization'];
      }

      return {
        ...config,
        headers,
      };
    } catch (_) {
      return config;
    }
  }

  // Response interceptor
  private async responseInterceptor<T>(response: Response, config: RequestConfig): Promise<T> {
    // Cache GET responses
    if ((config.method === 'get' || !config.method) && !config.skipCache) {
      const cacheKey = `${response.url}?${new URLSearchParams(config.params || {}).toString()}`;
      requestCache.set(cacheKey, {
        response: response.clone(),
        timestamp: Date.now()
      });

      // Clean up pending request
      pendingRequests.delete(cacheKey);

      // Limit cache size
      if (requestCache.size > 100) {
        const firstKey = requestCache.keys().next().value;
        requestCache.delete(firstKey);
      }
    }

    // Handle 401 responses
    if (response.status === 401) {
      // Remove invalid token
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      
      // Dispatch custom event for auth state change
      try {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:logout'));
        }
      } catch (_) {}
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Public method to clear cache
  public clearCache(): void {
    requestCache.clear();
    pendingRequests.clear();
  }

  // Public method to update auth header (for compatibility)
  public updateAuthHeader(): void {
    // This is handled automatically in the request interceptor
    // But we keep this method for compatibility with existing code
  }

  // Categories API
  async getPopularCategories(limit: number = 15) {
    return this.request(`/categories/popular?limit=${limit}`);
  }

  async getCategoriesPaginated(page: number = 1, search?: string) {
    const params = new URLSearchParams({ page: page.toString() });
    if (search) params.append('search', search);
    return this.request(`/categories?${params.toString()}`);
  }

  // Questions API
  async getQuestions(params: {
    page?: number;
    category_id?: string;
    search?: string;
    sort?: string;
    order?: string;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });
    return this.request(`/questions?${searchParams.toString()}`);
  }

  async createQuestion(questionData: {
    title: string;
    content: string;
    category_id: string;
    tags?: string[];
  }) {
    return this.request('/questions', {
      method: 'POST',
      body: JSON.stringify(questionData),
    });
  }

  async updateQuestion(id: string, questionData: {
    title: string;
    content: string;
    category_id: string;
    tags?: string[];
  }) {
    return this.request(`/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(questionData),
    });
  }

  // Tags API
  async getTags(search?: string) {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request(`/tags${params}`);
  }

  async createTag(name: string) {
    return this.request('/tags', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  // Users API
  async getActiveUsers(limit: number = 5) {
    return this.request(`/users/active?limit=${limit}`);
  }

  // Authentication API
  async getAuthRedirect(intendedUrl: string) {
    return this.request('/auth/redirect', {
      method: 'POST',
      body: JSON.stringify({ intended_url: intendedUrl }),
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }
}

// Create singleton instance
const enhancedApiService = new EnhancedApiService();

// Expose global helpers for compatibility
if (typeof window !== 'undefined') {
  (window as any).updateAxiosAuth = () => {
    enhancedApiService.updateAuthHeader();
  };
  
  (window as any).clearApiCache = () => {
    enhancedApiService.clearCache();
  };
}

export default enhancedApiService;
