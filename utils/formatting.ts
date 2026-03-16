export const formatIDR = (value: number | string) => {
  const num = parseFloat(String(value));
  const formatted = new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
  return `💰 ${formatted}`;
};
