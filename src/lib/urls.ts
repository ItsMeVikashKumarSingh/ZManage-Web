// URL normalization and cross-service routing utilities for ZManage

/**
 * Normalizes API base URLs to avoid relative pathing and protocol truncation
 * Handles cases where env variables are provided as 'api.zmanage.zorviktech.com' without 'https://'
 */
export function normalizeApiUrl(
  rawUrl?: string,
  defaultPort: number = 4003,
  defaultPath: string = '/api/v1'
): string {
  if (!rawUrl || !rawUrl.trim()) {
    // If running in browser on localhost, default to local port
    if (
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ) {
      return `http://localhost:${defaultPort}${defaultPath}`;
    }
    return `https://api.zmanage.zorviktech.com${defaultPath}`;
  }

  let url = rawUrl.trim();

  // If protocol is missing, prepend https:// (or http:// if explicitly localhost)
  if (!/^https?:\/\//i.test(url)) {
    if (url.startsWith('localhost') || url.startsWith('127.0.0.1')) {
      url = `http://${url}`;
    } else {
      url = `https://${url}`;
    }
  }

  // Remove trailing slashes
  url = url.replace(/\/+$/, '');

  // Ensure defaultPath (/api/v1) is appended if missing
  if (defaultPath && !url.endsWith(defaultPath)) {
    // If url already ends with /api, make it /api/v1
    if (url.endsWith('/api')) {
      url = `${url}/v1`;
    } else {
      url = `${url}${defaultPath}`;
    }
  }

  return url;
}

/**
 * Resolves Zorvik Tech Central Auth URL
 */
export function getZorvikCentralAuthUrl(): string {
  const envUrl = import.meta.env.VITE_ZORVIK_AUTH_URL;
  if (envUrl && envUrl.trim()) {
    let url = envUrl.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }
    return url;
  }

  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ) {
    return 'http://localhost:3000/api/v1/auth/login';
  }

  return 'https://www.zorviktech.com/api/v1/auth/login';
}

/**
 * Resolves Zorvik Tech Demo Request Ingestion API URL
 */
export function getZorvikDemoApiUrl(): string {
  const envUrl = import.meta.env.VITE_ZORVIK_DEMO_URL;
  if (envUrl && envUrl.trim()) {
    let url = envUrl.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }
    return url;
  }

  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ) {
    return 'http://localhost:3000/api/v1/demo-request';
  }

  return 'https://www.zorviktech.com/api/v1/demo-request';
}
