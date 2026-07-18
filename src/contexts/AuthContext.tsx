import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

// Define types for authentication
interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: (token: string, refreshToken: string, userData: any) => void;
  logout: () => void;
}

// Create auth context
export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
});

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any | null>(null);
  const logoutRef = useRef<() => void>(() => {});

  // Login function
  const login = (token: string, refreshToken: string, userData: any) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('user_data', JSON.stringify(userData));

    // Set auth header for future requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    setIsAuthenticated(true);
    setUser(userData);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');

    delete axios.defaults.headers.common['Authorization'];

    setIsAuthenticated(false);
    setUser(null);
  };

  // Keep a stable ref so the interceptor (registered once) always calls the latest logout
  logoutRef.current = logout;

  // Check for existing tokens on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user_data');

    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));

      // Set auth header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // Register a response interceptor once: on a 401, try to refresh the access token
  // using the stored refresh token and retry the original request. If refresh fails,
  // log the user out. Without this, sessions silently die 30 minutes after login.
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status !== 401 || originalRequest._retry) {
          return Promise.reject(error);
        }

        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
          const { data } = await axios.post(`${API_BASE_URL}/users/api/token/refresh/`, {
            refresh: refreshToken,
          });

          localStorage.setItem('access_token', data.access);
          axios.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;
          originalRequest.headers['Authorization'] = `Bearer ${data.access}`;

          return axios(originalRequest);
        } catch (refreshError: any) {
          // Only treat this as "your session is actually invalid" (and log
          // out) when the server responded and said so. A network error or
          // timeout on the refresh call itself (e.g. a cold-starting free-tier
          // backend) is not proof the refresh token is bad — logging the user
          // out in that case silently wipes a perfectly valid session and
          // leaves stale protected-page content on screen with no explanation.
          if (refreshError.response) {
            logoutRef.current();
          }
          return Promise.reject(refreshError);
        }
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);
