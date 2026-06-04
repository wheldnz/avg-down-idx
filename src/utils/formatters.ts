export function formatRupiah(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) return 'Rp 0';
  const isNegative = num < 0;
  const absNum = Math.abs(num);
  
  let formatted = '';
  if (absNum % 1 !== 0) {
    const parts = absNum.toFixed(2).split('.');
    formatted = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + parts[1];
  } else {
    formatted = absNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
  
  return `${isNegative ? '-' : ''}Rp ${formatted}`;
}

export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) return '0';
  const rounded = Math.round(num);
  return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function parseFormattedNumber(str: string | null | undefined): number {
  if (!str) return 0;
  const cleaned = str.toString().replace(/\./g, '').replace(/\s/g, '').replace(/,/g, '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export function formatPercent(num: number | null | undefined, decimals = 2): string {
  if (num === null || num === undefined || isNaN(num)) return '0,00%';
  const prefix = num > 0 ? '+' : '';
  const formatted = num.toFixed(decimals).replace('.', ',');
  return `${prefix}${formatted}%`;
}

export function generateId(): string {
  return 'calc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
}

export function formatDate(dateStr: string | Date): string {
  const date = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const d = date.getDate();
  const m = months[date.getMonth()];
  const y = date.getFullYear();
  const h = date.getHours().toString().padStart(2, '0');
  const min = date.getMinutes().toString().padStart(2, '0');
  return `${d} ${m} ${y}, ${h}:${min}`;
}
