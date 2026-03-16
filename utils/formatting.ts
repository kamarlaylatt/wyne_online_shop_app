export const formatIDR = (value: number | string) => {
  const num = parseFloat(String(value));
  const formatted = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
  return `💰 ${formatted}`;
};
