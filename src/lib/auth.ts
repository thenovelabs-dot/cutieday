const STORAGE_KEY = "cutieday_user_key";
let _userKey: string | null = null;

export function setUserKey(key: string): void {
  _userKey = key;
  try { localStorage.setItem(STORAGE_KEY, key); } catch { /* ignore */ }
}

export function getUserKey(): string | null {
  if (!_userKey) {
    try { _userKey = localStorage.getItem(STORAGE_KEY); } catch { /* ignore */ }
  }
  return _userKey;
}

export function clearUserKey(): void {
  _userKey = null;
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}
