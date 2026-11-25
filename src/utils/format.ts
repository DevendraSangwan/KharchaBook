import { AppLanguage, TRANSLATIONS } from './i18n';

export function formatINR(amount: number): string {
  const sign = amount < 0 ? '-' : '';
  return `${sign}₹${Math.round(Math.abs(amount)).toLocaleString('en-IN')}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
}

export function getDayKey(isoString: string): string {
  const d = new Date(isoString);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatDayHeading(isoString: string, lang: AppLanguage = 'en'): string {
  const date = new Date(isoString);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const t = TRANSLATIONS[lang];
  if (isSameDay(date, now)) return t.today;
  if (isSameDay(date, yesterday)) return t.yesterday;

  return date.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export function formatExpenseDate(isoString: string, lang: AppLanguage = 'en'): string {
  const date = new Date(isoString);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const t = TRANSLATIONS[lang];
  const locale = lang === 'hi' ? 'hi-IN' : 'en-IN';
  const timeStr = date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  if (isSameDay(date, now)) return `${t.today}, ${timeStr}`;
  if (isSameDay(date, yesterday)) return `${t.yesterday}, ${timeStr}`;

  const dateStr = date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
  });
  return `${dateStr}, ${timeStr}`;
}

export function formatMonthYear(year: number, month: number, lang: AppLanguage = 'en'): string {
  const d = new Date(year, month, 1);
  return d.toLocaleString(lang === 'hi' ? 'hi-IN' : 'en-IN', {
    month: 'long',
    year: 'numeric',
  });
}
