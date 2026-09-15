export function formatNaira(amount: number | string | { toNumber(): number }): string {
  const num = typeof amount === 'object' && amount !== null && 'toNumber' in amount 
    ? amount.toNumber() 
    : Number(amount);

  if (isNaN(num)) return '₦0.00';

  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}
