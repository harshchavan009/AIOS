/**
 * AIOS Canonical API & Real-Time Environment Configuration
 * 
 * In production on Vercel:
 * All API requests use the same-origin relative path ('/api/v1/...') by default.
 * Vercel proxies '/api/(.*)' directly to the Render backend via vercel.json rewrites.
 * 
 * WebSocket connections connect directly to Render ('wss://aios-1-wc28.onrender.com/api/v1/observability/ws')
 * because Vercel HTTP proxy rewrites do not support WebSocket protocol upgrades.
 * 
 * Custom overrides can be provided via environment variables:
 * - VITE_API_URL or VITE_API_BASE_URL: Custom backend base URL
 * - VITE_WS_URL: Custom WebSocket base URL
 */

const envApiUrl = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');
const rawWsUrl = (import.meta.env.VITE_WS_URL || '').trim().replace(/\/+$/, '');

// If VITE_API_BASE_URL is '/api', normalize to empty string so relative paths '/api/v1' work cleanly
export const API_BASE_URL = (envApiUrl === '/api' || envApiUrl === '/api/v1') ? '' : envApiUrl;
export const API_V1_PREFIX = '/api/v1';

const PRODUCTION_RENDER_WS = 'wss://aios-1-wc28.onrender.com';

/**
 * Resolves an API endpoint path to the canonical URL.
 * Handles paths with or without leading '/api/v1' or '/'.
 */
export function getApiUrl(endpoint: string): string {
  const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  if (cleanPath.startsWith(API_V1_PREFIX)) {
    return API_BASE_URL ? `${API_BASE_URL}${cleanPath}` : cleanPath;
  }

  return API_BASE_URL ? `${API_BASE_URL}${API_V1_PREFIX}${cleanPath}` : `${API_V1_PREFIX}${cleanPath}`;
}

/**
 * Resolves a WebSocket endpoint to the appropriate wss:// or ws:// URL.
 * In production, connects directly to Render backend WebSocket since Vercel HTTP rewrites do not support WebSocket upgrades.
 */
export function getWsUrl(endpoint: string = '/api/v1/observability/ws'): string {
  const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  if (rawWsUrl) {
    return `${rawWsUrl}${cleanPath}`;
  }

  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isLocalhost) {
      return `${PRODUCTION_RENDER_WS}${cleanPath}`;
    }
    const isHttps = window.location.protocol === 'https:';
    const protocol = isHttps ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}${cleanPath}`;
  }

  return `ws://localhost:8000${cleanPath}`;
}

