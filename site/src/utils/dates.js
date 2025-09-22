const LOCALE = 'pt-BR';
const DEFAULT_TIMEZONE = 'America/Sao_Paulo';

export const toDate = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatDate = (value, options = {}) => {
  const date = toDate(value);
  if (!date) return '';

  return new Intl.DateTimeFormat(LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: DEFAULT_TIMEZONE,
    ...options,
  }).format(date);
};

export const formatDateTime = (value) => {
  const date = toDate(value);
  if (!date) return '';

  return new Intl.DateTimeFormat(LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: DEFAULT_TIMEZONE,
  }).format(date);
};

export const compareByPublishedDesc = (a, b) => {
  const dateA = toDate(a?.publicadoEm) ?? new Date(0);
  const dateB = toDate(b?.publicadoEm) ?? new Date(0);
  return dateB.getTime() - dateA.getTime();
};

export const isFuture = (value) => {
  const date = toDate(value);
  if (!date) return false;
  return date.getTime() > Date.now();
};

export const isPastOrNow = (value) => {
  const date = toDate(value);
  if (!date) return false;
  return date.getTime() <= Date.now();
};
