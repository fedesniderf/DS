export const generateUniqueId = () => {
  // Usar timestamp + parte aleatoria para garantizar orden cronológico
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 4);
  return `${timestamp}_${random}`;
};

export const sortClientsByName = (clients) => {
  return [...clients].sort((a, b) => {
    const nameA = (a.full_name || a.fullName || a.name || '').toLowerCase();
    const nameB = (b.full_name || b.fullName || b.name || '').toLowerCase();
    return nameA.localeCompare(nameB);
  });
};