// Type definitions for API responses

export interface Question {
  id: string;
  title: string;
  content: string;
  slug: string;
  views_count: number;
  answers_count: number;
  votes_count: number;
  is_solved: boolean;
  is_pinned_by_user?: boolean;
  is_featured_by_user?: boolean;
  published?: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    name: string;
    image_url?: string;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  tags: Tag[];
  can?: {
    publish?: boolean;
  };
}

export interface User {
  id: string;
  name: string;
  image_url?: string;
  online: boolean;
  score?: number;
  level_name?: string;
  questions_count?: number;
  answers_count?: number;
  comments_count?: number;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  questions_count?: number;
  children_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  questions_count: number;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}
