let _userKey: string | null = null;

export function setUserKey(key: string): void {
  _userKey = key;
}

export function getUserKey(): string | null {
  return _userKey;
}
