export const FALLBACK_CATTLE_IMAGE =
  'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=500&auto=format&fit=crop&q=60';

export const ensureHttps = (url) => {
  if (!url || typeof url !== 'string') return '';
  if (url.startsWith('blob:') || url.startsWith('data:')) return url;
  if (
    url.includes('website-peternakan') ||
    url.includes('railway.app') ||
    (typeof window !== 'undefined' && window.location.protocol === 'https:' && !url.includes('localhost') && !url.includes('127.0.0.1'))
  ) {
    return url.replace(/^http:\/\//i, 'https://');
  }
  return url;
};

const apiBaseUrl = () => {
  const base = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1').replace('/api/v1', '');
  return ensureHttps(base);
};

export const resolveMediaUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  if (url.startsWith('blob:') || url.startsWith('data:')) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return ensureHttps(url);
  }
  return ensureHttps(`${apiBaseUrl()}/${url.replace(/^\//, '')}`);
};

export const getCattleImageUrl = (mediaUrls) => {
  if (!mediaUrls) return FALLBACK_CATTLE_IMAGE;

  let url = Array.isArray(mediaUrls) ? mediaUrls[0] : mediaUrls;
  if (typeof url !== 'string') {
    url = '';
  }
  if (typeof url === 'string' && url.startsWith('[')) {
    try {
      const parsed = JSON.parse(url);
      url = Array.isArray(parsed) ? parsed[0] : parsed;
    } catch {
      url = '';
    }
  }

  if (!url || typeof url !== 'string') return FALLBACK_CATTLE_IMAGE;
  return resolveMediaUrl(url);
};