export const generateUniqueId = () => {
  return '_' + Math.random().toString(36).substr(2, 9);
};

export const sortClientsByName = (clients) => {
  return [...clients].sort((a, b) => {
    const nameA = (a.name || '').toLowerCase();
    const nameB = (b.name || '').toLowerCase();
    return nameA.localeCompare(nameB);
  });
};