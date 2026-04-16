export const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
export const minLength = (min) => (val) => val && val.length >= min;
export const isRequired = (val) => val !== null && val !== undefined && String(val).trim() !== '';
export const isValidUrl = (val) => {
  if (!val) return true; // Optional by default
  try {
    new URL(val);
    return true;
  } catch (e) {
    return false;
  }
};
