
const KEY = "sh.unlockedUntil"; // epoch ms until which the app is "unlocked"

export function unlock(ttlMs = 30 * 60 * 1000) { // default: 10 minutes
  localStorage.setItem(KEY, String(Date.now() + ttlMs));
}

export function lock() {
  localStorage.removeItem(KEY);
}

export function isUnlocked() {
  const until = Number(localStorage.getItem(KEY) || 0);
  return Date.now() < until;
}