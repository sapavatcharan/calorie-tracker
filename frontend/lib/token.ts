const KEY = "calorie-tracker-token";

export const tokenStore = {
  get: () => (typeof window === "undefined" ? null : localStorage.getItem(KEY)),
  set: (token: string) => localStorage.setItem(KEY, token),
  clear: () => localStorage.removeItem(KEY),
};
