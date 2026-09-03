export const FALLBACK_CATTLE_IMAGE =
  'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=500&auto=format&fit=crop&q=60';

const apiBaseUrl = () =>
  (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1').replace('/api/v1', '');

export const resolveMediaUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) return url;
  return `${apiBaseUrl()}/${url.replace(/^\//, '')}`;
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
  if (url.startsWith('http://') || url.startsWith('https://')) return url;

  return `${apiBaseUrl()}/${url.replace(/^\//, '')}`;
};