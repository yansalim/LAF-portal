const removeDiacritics = (text = '') =>
  text.normalize('NFD').replace(/\p{Diacritic}/gu, '');

export const slugify = (text = '') => {
  const withoutDiacritics = removeDiacritics(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

  return withoutDiacritics.replace(/-+/g, '-');
};

export const ensureUniqueSlug = (slug, existingSlugs = []) => {
  let uniqueSlug = slug;
  let counter = 1;

  while (existingSlugs.includes(uniqueSlug)) {
    uniqueSlug = `${slug}-${counter}`;
    counter += 1;
  }

  return uniqueSlug;
};

export const isValidSlug = (slug = '') => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
