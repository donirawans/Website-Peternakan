export const getImageUrl = (cattle) => {
  let mediaUrls = [];
  if (cattle.media_urls) {
    if (Array.isArray(cattle.media_urls)) {
      mediaUrls = cattle.media_urls;
    } else if (typeof cattle.media_urls === 'string') {
      try {
        mediaUrls = JSON.parse(cattle.media_urls);
      } catch {
        mediaUrls = cattle.media_urls.split(',').filter(Boolean);
      }
    }
  }
  
  let url = mediaUrls[0] || cattle.photo_url || cattle.image;
  
  if (url && url.startsWith('/uploads')) {
    url = `http://localhost:8080${url}`;
  }
  
  return url || 'https://via.placeholder.com/400x300?text=No+Image';
};

export const getAllMediaUrls = (cattle) => {
  let mediaUrls = [];
  if (cattle.media_urls) {
    if (Array.isArray(cattle.media_urls)) {
      mediaUrls = cattle.media_urls;
    } else if (typeof cattle.media_urls === 'string') {
      try {
        mediaUrls = JSON.parse(cattle.media_urls);
      } catch {
        mediaUrls = cattle.media_urls.split(',').filter(Boolean);
      }
    }
  }
  
  return mediaUrls.map(url => {
    if (url.startsWith('/uploads')) {
      return `http://localhost:8080${url}`;
    }
    return url;
  });
};

export const isVideoUrl = (url) => {
  return url && (url.endsWith('.mp4') || url.endsWith('.webm') || url.includes('video'));
};

export const resolveImageUrl = (url) => {
  if (!url) return 'https://via.placeholder.com/400x300?text=No+Image';
  if (url.startsWith('/uploads')) return `http://localhost:8080${url}`;
  return url;
};
