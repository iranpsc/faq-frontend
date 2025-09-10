'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';

interface User {
  id: string;
  name: string;
  email?: string;
  image_url?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  can: (permission: string, resource?: any) => boolean;
  getInitials: (name?: string) => string;
  fetchUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Track prior auth state to emit login/logout only on transitions
  const wasAuthenticatedRef = useRef(false);
  // Deduplicate in-flight /me requests
  const fetchUserInFlightRef = useRef<Promise<User | null> | null>(null);

  const isAuthenticated = !!token && !!user;

  // Custom event system for auth state changes
  const dispatchAuthEvent = (eventType: string, detail?: any) => {
    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(eventType, { detail }));
      }
    } catch (_) {}
  };

  // Enhanced token setter with events
  const setTokenWithEvents = (newToken: string | null) => {
    setToken(newToken);
    if (newToken) {
      localStorage.setItem('auth_token', newToken);
    } else {
      localStorage.removeItem('auth_token');
    }
    
    // Dispatch token change event
    dispatchAuthEvent('auth:token', { token: newToken });
  };

  // Enhanced user setter with events
  const setUserWithEvents = (userData: User | null) => {
    setUser(userData);
    try {
      if (userData) {
        localStorage.setItem('auth_user', JSON.stringify(userData));
      } else {
        localStorage.removeItem('auth_user');
      }
    } catch (_) {}

    // Emit auth:login only on transition from guest -> authenticated
    const isNowAuthenticated = !!(token && userData);
    if (!wasAuthenticatedRef.current && isNowAuthenticated) {
      dispatchAuthEvent('auth:login', { user: userData });
    }
    wasAuthenticatedRef.current = isNowAuthenticated;
  };

  // Deduplicated fetchUser function
  const fetchUser = async (authToken?: string): Promise<User | null> => {
    const tokenToUse = authToken || token;
    if (!tokenToUse) return null;

    // Deduplicate concurrent calls
    if (fetchUserInFlightRef.current) {
      return fetchUserInFlightRef.current;
    }

    fetchUserInFlightRef.current = (async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const response = await fetch(`${apiBaseUrl}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${tokenToUse}`,
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUserWithEvents(userData);
          return userData;
        } else {
          // Token is invalid, clear it
          setTokenWithEvents(null);
          setUserWithEvents(null);
          dispatchAuthEvent('auth:logout');
          return null;
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setTokenWithEvents(null);
        setUserWithEvents(null);
        dispatchAuthEvent('auth:logout');
        return null;
      } finally {
        fetchUserInFlightRef.current = null;
      }
    })();

    return fetchUserInFlightRef.current;
  };

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          wasAuthenticatedRef.current = true;
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear invalid data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Handle token from URL (for OAuth redirects)
  useEffect(() => {
    const handleTokenFromUrl = () => {
      // Prefer URL fragment to avoid referrer leakage
      let tokenFromFragment = null;
      try {
        if (window.location.hash && window.location.hash.length > 1) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          tokenFromFragment = hashParams.get('token');
        }
      } catch (_) {}

      // Backward compatibility: still support query param for any old links
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromQuery = urlParams.get('token');

      const urlToken = tokenFromFragment || tokenFromQuery;

      if (urlToken) {
        setTokenWithEvents(urlToken);
        // Clean the URL (remove both search and hash)
        const cleanPath = window.location.pathname;
        window.history.replaceState({}, document.title, cleanPath);
        // Fetch user data
        fetchUser(urlToken);
        return true;
      }
      return false;
    };

    if (typeof window !== 'undefined') {
      if (!handleTokenFromUrl()) {
        // If no token in URL, check local storage and fetch user if token exists
        const storedToken = localStorage.getItem('auth_token');
        if (storedToken) {
          fetchUser(storedToken);
        }
      }
    }
  }, []);


  // Login function
  const login = async () => {
    try {
      // Send current path as intended URL to backend
      const intendedUrl = window.location.href;
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${apiBaseUrl}/auth/redirect`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ intended_url: intendedUrl })
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.redirect_url;
      } else {
        console.error('Failed to get redirect URL');
        throw new Error('Failed to get redirect URL');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    if (token) {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        await fetch(`${apiBaseUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    setTokenWithEvents(null);
    setUserWithEvents(null);

    // Clean URL
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Broadcast logout so any listener can react
    dispatchAuthEvent('auth:logout');
  };

  // Update user data
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUserWithEvents(updatedUser);
    }
  };

  // Permission checking
  const can = (permission: string, resource?: any) => {
    if (!user || !isAuthenticated) {
      return false;
    }

    // Basic permission checking logic
    if (resource && resource.user && user) {
      return resource.user.id === user.id;
    }

    // You can extend this with more sophisticated permission logic
    return false;
  };

  // Get user initials
  const getInitials = (name?: string) => {
    const nameToUse = name || user?.name;
    if (!nameToUse) return '?';
    return nameToUse
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // Enhanced cross-tab synchronization and event listeners
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token') {
        const newToken = localStorage.getItem('auth_token');
        if (newToken !== token) {
          setTokenWithEvents(newToken);
          if (newToken) {
            fetchUser(newToken);
          } else {
            setUserWithEvents(null);
            dispatchAuthEvent('auth:logout');
          }
        }
      }
      if (e.key === 'auth_user') {
        try {
          const newUser = e.newValue ? JSON.parse(e.newValue) : null;
          setUser(newUser);
        } catch (_) {
          setUser(null);
        }
      }
    };

    // React to explicit auth logout events (e.g., from API interceptors on 401)
    const handleAuthLogout = () => {
      setTokenWithEvents(null);
      setUserWithEvents(null);
    };

    // React to token change broadcasts within same tab
    const handleAuthToken = (e: CustomEvent) => {
      const nextToken = e?.detail?.token || null;
      if (nextToken !== token) {
        setTokenWithEvents(nextToken);
        if (nextToken) {
          // Ensure we have fresh user data
          fetchUser(nextToken);
        } else {
          setUserWithEvents(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth:logout', handleAuthLogout);
    window.addEventListener('auth:token', handleAuthToken as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth:logout', handleAuthLogout);
      window.removeEventListener('auth:token', handleAuthToken as EventListener);
    };
  }, [token]);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
    can,
    getInitials,
    fetchUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
