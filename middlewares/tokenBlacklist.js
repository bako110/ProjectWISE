

// middleware/tokenBlacklist.js
const blacklist = new Set(); // en mémoire, à remplacer par Redis ou une base de données en prod

export const addToBlacklist = (token) => {
  blacklist.add(token);
};

export const isBlacklisted = (token) => {
  return blacklist.has(token);
};
