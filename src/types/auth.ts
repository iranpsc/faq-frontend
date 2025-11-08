export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  mobile?: string;
  image_url?: string;
  score?: number;
  online?: boolean;
  login_notification_enabled?: boolean;
  [key: string]: unknown;
}

