const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export class ApiError extends Error {
  status: number;
  details?: any;

  constructor(message: string, status: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let token = localStorage.getItem('aios_access_token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle Token Expiration & Automatic Refresh (401)
  if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
    const refreshToken = localStorage.getItem('aios_refresh_token');
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          localStorage.setItem('aios_access_token', refreshData.access_token);
          localStorage.setItem('aios_refresh_token', refreshData.refresh_token);

          // Retry original request with new token
          headers['Authorization'] = `Bearer ${refreshData.access_token}`;
          response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers,
          });
        } else {
          // Token refresh failed - clear storage
          localStorage.removeItem('aios_access_token');
          localStorage.removeItem('aios_refresh_token');
          window.location.href = '/login';
        }
      } catch {
        localStorage.removeItem('aios_access_token');
        localStorage.removeItem('aios_refresh_token');
        window.location.href = '/login';
      }
    }
  }

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { error: { message: response.statusText } };
    }
    const message = errorData?.error?.message || errorData?.detail || 'An unknown network error occurred';
    throw new ApiError(message, response.status, errorData?.error?.details);
  }

  return response.json() as Promise<T>;
}
