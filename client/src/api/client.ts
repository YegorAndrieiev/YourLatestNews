/* eslint-disable @typescript-eslint/no-explicit-any */
let isRefreshing = false;
let refreshSubscribers: (() => Promise<void>)[] = [];
const subscribeTokenRefresh = (cb: () => Promise<void>) => {
  refreshSubscribers.push(cb);
};
const onRefreshed = async () => {
  const promises = refreshSubscribers.map((cb) => cb());
  refreshSubscribers = [];
  await Promise.all(promises);
};
export const request = async (
  url: string,
  options?: RequestInit,
): Promise<any> => {
  const baseUrl =
    typeof window === 'undefined'
      ? process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      : '';
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
  const res = await fetch(`${fullUrl}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  if (res.status === 401) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh(async () => {
          try {
            const result = await request(url, options);
            resolve(result);
          } catch (err) {
            reject(err);
          }
        });
      });
    }
    isRefreshing = true;
    try {
      const refreshUrl = `/auth/refresh`.startsWith('http')
        ? `/auth/refresh`
        : `${baseUrl}/auth/refresh`;
      const refreshRes = await fetch(refreshUrl, {
        method: 'POST',
        credentials: 'include',
      });
      if (refreshRes.ok) {
        isRefreshing = false;
        onRefreshed();
        return await request(url, options);
      } else {
        isRefreshing = false;
        refreshSubscribers = [];
        throw new Error('Unauthorized');
      }
    } catch (err) {
      isRefreshing = false;
      refreshSubscribers = [];
      throw err;
    }
  }
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
};
export const getMeRequest = () => {
  return request('/auth/me', {
    method: 'GET',
  });
};
