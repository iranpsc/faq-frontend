// Type definitions for API responses

export interface Question {
  id: string;
  title: string;
  content: string;
  slug: string;
  views?: number;
  views_count?: number;
  answers_count?: number;
  votes_count?: number;
  is_solved: boolean;
  is_pinned_by_user?: boolean;
  is_featured_by_user?: boolean;
  published?: boolean;
  published_at?: string;
  pinned_at?: string;
  featured_at?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    name: string;
    image_url?: string;
    score?: number;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  tags: Tag[];
  votes?: {
    upvotes: number | number[];
    downvotes: number | number[];
    score: number;
    user_vote: string | null;
  };
  can?: {
    publish?: boolean;
    update?: boolean;
    delete?: boolean;
    feature?: boolean;
    unfeature?: boolean;
  };
}

export interface User {
  id: string;
  name: string;
  email?: string;
  mobile?: string;
  image_url?: string;
  online: boolean;
  score?: number;
  level_name?: string;
  level?: string;
  questions_count?: number;
  answers_count?: number;
  comments_count?: number;
  login_notification_enabled?: boolean;
  created_at: string;
  recent_questions?: Question[];
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

export interface DailyActivity {
  id: string;
  type: 'question' | 'answer' | 'comment';
  user_name: string;
  user_id: string;
  user_image?: string;
  title?: string;
  slug?: string;
  question_id?: string;
  category_name?: string;
  description: string;
  created_at: string;
  url?: string;
  is_correct?: boolean;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}
