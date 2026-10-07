/**
 * AIOS Canonical API & Real-Time Environment Configuration
 * 
 * In production on Vercel:
 * All API requests use the same-origin relative path ('/api/v1/...') by default.
 * Vercel proxies '/api/(.*)' directly to the Render backend via vercel.json rewrites.
 * 
 * Custom overrides can be provided via environment variables:
 * - VITE_API_URL: Direct backend URL (e.g. https://aios-backend.onrender.com)
 * - VITE_WS_URL: Direct WebSocket URL (e.g. wss://aios-backend.onrender.com)
 */

const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
const rawWsUrl = (import.meta.env.VITE_WS_URL || '').trim().replace(/\/+$/, '');

export const API_BASE_URL = rawApiUrl;
export const API_V1_PREFIX = '/api/v1';

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
 * In production over HTTPS, defaults to 'wss://'. Supports VITE_WS_URL for direct Render WebSocket access.
 */
export function getWsUrl(endpoint: string = '/api/v1/observability/ws'): string {
  const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  if (rawWsUrl) {
    return `${rawWsUrl}${cleanPath}`;
  }

  if (typeof window !== 'undefined') {
    const isHttps = window.location.protocol === 'https:';
    const protocol = isHttps ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}${cleanPath}`;
  }

  return `ws://localhost:8000${cleanPath}`;
}
