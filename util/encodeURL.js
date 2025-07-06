module.exports = str => {
  return Array.from(str).map(char => {
    return /[A-Za-z0-9]/.test(char)
      ? char
      : '%' + new TextEncoder().encode(char)[0].toString(16).toUpperCase().padStart(2, '0');
  }).join('');
};