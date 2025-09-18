export const setDocumentTitle = (title) => {
  if (typeof document === 'undefined') return;
  document.title = title;
};

export const setMetaDescription = (description) => {
  if (typeof document === 'undefined') return;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) {
    meta.setAttribute('content', description);
  }
};

export const setCanonicalLink = (path) => {
  if (typeof document === 'undefined') return;
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) {
    const base = window.location.origin;
    canonical.setAttribute('href', `${base}${path}`);
  }
};
