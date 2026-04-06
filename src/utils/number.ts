// Numeric helpers to normalize inputs and format currency safely

export const toNumber = (value: any): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

export const toFixedSafe = (value: any, digits: number): string => {
  const n = toNumber(value);
  return n.toFixed(digits);
};

export const formatCurrencyValue = (value: any, currency: string = 'USD') => {
  const n = toNumber(value);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
};

export default { toNumber, toFixedSafe, formatCurrencyValue };
