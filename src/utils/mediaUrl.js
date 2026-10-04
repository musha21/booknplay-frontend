const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1').replace(/\/api\/v1\/?$/, '');

/** Resolve API-hosted media. Leave Vite-bundled and absolute browser URLs untouched. */
export const mediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('data:')) return path;
  // Backend uploads (and similar) need the API origin.
  if (path.startsWith('/uploads/')) return `${API_ORIGIN}${path}`;
  // Vite assets (/assets/..., /src/...) and other frontend-absolute paths stay on the app origin.
  if (path.startsWith('/')) return path;
  return `${API_ORIGIN}/${path}`;
};

export default mediaUrl;
