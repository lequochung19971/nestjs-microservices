import createClient from 'openapi-fetch';
import { type components, type paths } from './client.generated';
import qs from 'qs';
import { convertResponseDates } from './utils';

const TOKEN_KEY = 'auth_tokens';
const USER_KEY = 'auth_user';

interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenTimestamp: number;
}

interface User {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

// Standalone authentication methods
export const getAccessToken = (): string | null => {
  try {
    const storedTokens = localStorage.getItem(TOKEN_KEY);
    if (!storedTokens) return null;

    const tokens: StoredTokens = JSON.parse(storedTokens);

    // Check if token is expired
    if (isTokenExpired(tokens.tokenTimestamp, tokens.expiresIn)) {
      return null;
    }

    return tokens.accessToken;
  } catch {
    return null;
  }
};

export const getRefreshToken = (): string | null => {
  try {
    const storedTokens = localStorage.getItem(TOKEN_KEY);
    if (!storedTokens) return null;

    const tokens: StoredTokens = JSON.parse(storedTokens);
    return tokens.refreshToken;
  } catch {
    return null;
  }
};

export const getUserInfo = (): User | null => {
  try {
    const storedUser = localStorage.getItem(USER_KEY);
    if (!storedUser) return null;

    return JSON.parse(storedUser);
  } catch {
    return null;
  }
};

const isTokenExpired = (tokenTimestamp: number, expiresIn: number): boolean => {
  const now = Date.now();
  const expirationTime = tokenTimestamp + expiresIn * 1000;
  // Add 30 second buffer to refresh before actual expiration
  return now >= expirationTime - 30000;
};

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

const clearStoredAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const handleTokenRefresh = async (): Promise<boolean> => {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    const client = createClient<paths>({
      credentials: 'include',
    });

    const response = await client.POST('/api/auth/refresh', {
      body: {
        refreshToken,
      },
    });

    if (response.error || !response.data) {
      return false;
    }

    const { accessToken, refreshToken: newRefreshToken, expiresIn } = response.data;
    const user = parseTokenPayload(accessToken);

    if (!user) return false;

    // Store new authentication data
    storeAuthData(accessToken, newRefreshToken, expiresIn, user);

    return true;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
};

export const handleLogout = async (): Promise<void> => {
  const refreshToken = getRefreshToken();

  // Call logout endpoint if refresh token exists
  if (refreshToken) {
    try {
      const client = createClient<paths>({
        credentials: 'include',
      });

      await client.POST('/api/auth/logout', {
        body: {
          refreshToken,
        },
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    }
  }

  clearStoredAuth();
};

export const handleLogin = async (username: string, password: string): Promise<User> => {
  const client = createClient<paths>({
    credentials: 'include',
  });

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

  return user;
};

export const isAuthenticated = (): boolean => {
  const token = getAccessToken();
  return token !== null;
};

export const checkTokenExpiry = (): boolean => {
  try {
    const storedTokens = localStorage.getItem(TOKEN_KEY);
    if (!storedTokens) return true; // No token means expired

    const tokens: StoredTokens = JSON.parse(storedTokens);
    return isTokenExpired(tokens.tokenTimestamp, tokens.expiresIn);
  } catch {
    return true;
  }
};

export const httpClient = () => {
  const client = createClient<paths>({
    credentials: 'include',
    fetch: async (input) => {
      /**
       * If `httpClient` is used from server side, it will collect `cookie` and attach to `headers`
       */
      let cookie;

      // Add timezone header
      input.headers.set('x-timezone', Intl.DateTimeFormat().resolvedOptions().timeZone);

      // Add authentication header if available
      const accessToken = getAccessToken();
      if (accessToken) {
        input.headers.set('Authorization', `Bearer ${accessToken}`);
      }

      // Make the request
      const response = await fetch(input, {
        headers: cookie
          ? {
              ...input.headers,
              Cookie: cookie,
            }
          : input.headers,
      });

      // Handle 401 Unauthorized responses
      if (response.status === 401) {
        // Try to refresh the token
        const refreshed = await handleTokenRefresh();

        if (refreshed) {
          // Retry the original request with new token
          const retryToken = getAccessToken();
          if (retryToken) {
            input.headers.set('Authorization', `Bearer ${retryToken}`);
            return fetch(input, {
              headers: cookie
                ? {
                    ...input.headers,
                    Cookie: cookie,
                  }
                : input.headers,
            });
          }
        } else {
          // Refresh failed, logout user
          await handleLogout();
          // Redirect to login or throw error
          window.location.href = '/login';
        }
      }

      return response;
    },
    querySerializer: (query) => {
      console.log(qs.stringify(query));
      return qs.stringify(query);
    },
  });
  // Store original methods to avoid recursive calls
  const originalDELETE = client.DELETE;
  const originalGET = client.GET;
  const originalPOST = client.POST;
  const originalPUT = client.PUT;
  const originalPATCH = client.PATCH;

  client.DELETE = ((...args: Parameters<typeof client.DELETE>) => {
    return originalDELETE(...(args as [any, any])).then((r) => {
      return {
        ...r,
        data: convertResponseDates(r.data),
      };
    });
  }) as typeof client.DELETE;

  client.GET = ((...args: Parameters<typeof client.GET>) => {
    return originalGET(...(args as [any, any])).then((r) => {
      return {
        ...r,
        data: convertResponseDates(r.data),
      };
    });
  }) as typeof client.GET;

  client.POST = ((...args: Parameters<typeof client.POST>) => {
    return originalPOST(...(args as [any, any])).then((r) => {
      return {
        ...r,
        data: convertResponseDates(r.data),
      };
    });
  }) as typeof client.POST;

  client.PUT = ((...args: Parameters<typeof client.PUT>) => {
    return originalPUT(...(args as [any, any])).then((r) => {
      return {
        ...r,
        data: convertResponseDates(r.data),
      };
    });
  }) as typeof client.PUT;

  client.PATCH = ((...args: Parameters<typeof client.PATCH>) => {
    return originalPATCH(...(args as [any, any])).then((r) => {
      return {
        ...r,
        data: convertResponseDates(r.data),
      };
    });
  }) as typeof client.PATCH;

  client.use({
    onError: (error) => {
      throw error.error;
    },
  });

  return client;
};
export type ApiSchema = components['schemas'];
