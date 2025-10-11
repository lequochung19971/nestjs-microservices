import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { httpClient } from '@/http-clients';

interface User {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_tokens';
const USER_KEY = 'auth_user';

interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenTimestamp: number;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    accessToken: null,
    refreshToken: null,
    isLoading: true,
  });

  // Parse JWT token to extract user info
  const parseTokenPayload = (token: string): User | null => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.sub,
        username: payload.preferred_username || payload.username,
        email: payload.email,
        firstName: payload.given_name,
        lastName: payload.family_name,
      };
    } catch (error) {
      console.error('Failed to parse token payload:', error);
      return null;
    }
  };

  // Check if token is expired
  const isTokenExpired = (tokenTimestamp: number, expiresIn: number): boolean => {
    const now = Date.now();
    const expirationTime = tokenTimestamp + expiresIn * 1000;
    // Add 30 second buffer to refresh before actual expiration
    return now >= expirationTime - 30000;
  };

  // Load stored authentication data
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedTokens = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedTokens && storedUser) {
          const tokens: StoredTokens = JSON.parse(storedTokens);
          const user: User = JSON.parse(storedUser);

          // Check if token is expired
          if (isTokenExpired(tokens.tokenTimestamp, tokens.expiresIn)) {
            // Try to refresh token
            const refreshed = await refreshAccessToken(tokens.refreshToken);
            if (!refreshed) {
              // Refresh failed, clear stored data
              clearStoredAuth();
              setAuthState((prev) => ({ ...prev, isLoading: false }));
              return;
            }
          } else {
            // Token is still valid
            setAuthState({
              isAuthenticated: true,
              user,
              accessToken: tokens.accessToken,
              refreshToken: tokens.refreshToken,
              isLoading: false,
            });
          }
        } else {
          setAuthState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Failed to load stored authentication:', error);
        clearStoredAuth();
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    loadStoredAuth();
  }, []);

  const clearStoredAuth = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const storeAuthData = (
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
    user: User
  ) => {
    const tokens: StoredTokens = {
      accessToken,
      refreshToken,
      expiresIn,
      tokenTimestamp: Date.now(),
    };

    localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  };

  const login = async (username: string, password: string): Promise<void> => {
    const client = httpClient();

    const response = await client.POST('/api/auth/login', {
      body: {
        username,
        password,
      },
    });

    if (response.error) {
      throw new Error((response.error as any)?.message || 'Login failed');
    }

    if (!response.data) {
      throw new Error('No response data received');
    }

    const { accessToken, refreshToken, expiresIn } = response.data;
    const user = parseTokenPayload(accessToken);

    if (!user) {
      throw new Error('Failed to parse user information from token');
    }

    // Store authentication data
    storeAuthData(accessToken, refreshToken, expiresIn, user);

    setAuthState({
      isAuthenticated: true,
      user,
      accessToken,
      refreshToken,
      isLoading: false,
    });
  };

  const refreshAccessToken = async (refreshTokenToUse?: string): Promise<boolean> => {
    try {
      const tokenToUse = refreshTokenToUse || authState.refreshToken;
      if (!tokenToUse) return false;

      const client = httpClient();
      const response = await client.POST('/api/auth/refresh', {
        body: {
          refreshToken: tokenToUse,
        },
      });

      if (response.error || !response.data) {
        return false;
      }

      const { accessToken, refreshToken, expiresIn } = response.data;
      const user = parseTokenPayload(accessToken);

      if (!user) return false;

      // Store new authentication data
      storeAuthData(accessToken, refreshToken, expiresIn, user);

      setAuthState({
        isAuthenticated: true,
        user,
        accessToken,
        refreshToken,
        isLoading: false,
      });

      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  };

  const logout = () => {
    // Call logout endpoint if refresh token exists
    if (authState.refreshToken) {
      const client = httpClient();
      client
        .POST('/api/auth/logout', {
          body: {
            refreshToken: authState.refreshToken,
          },
        })
        .catch((error) => {
          console.error('Logout API call failed:', error);
        });
    }

    clearStoredAuth();

    setAuthState({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
    });
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    refreshAccessToken: () => refreshAccessToken(),
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
