const DARK_MODE_KEY = 'learning-hub-dark-mode';

export function getDarkModeSetting(): boolean {
  const saved = localStorage.getItem(DARK_MODE_KEY);
  return saved === 'true';
}

export function setDarkModeSetting(enabled: boolean): void {
  localStorage.setItem(DARK_MODE_KEY, String(enabled));
}
