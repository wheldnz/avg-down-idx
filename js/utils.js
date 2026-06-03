/**
 * AVG DOWN IDX — Utility Functions
 * Number formatting, validation, helpers
 */

/**
 * Format number as Indonesian Rupiah
 * @param {number} num - Number to format
 * @returns {string} Formatted string e.g. "Rp 1.234.567"
 */
function formatRupiah(num) {
  if (num === null || num === undefined || isNaN(num)) return 'Rp 0';
  const isNegative = num < 0;
  const absNum = Math.abs(Math.round(num));
  const formatted = absNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${isNegative ? '-' : ''}Rp ${formatted}`;
}

/**
 * Format number with Indonesian thousand separator (dot)
 * @param {number} num - Number to format
 * @returns {string} Formatted string e.g. "1.234.567"
 */
function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  const rounded = Math.round(num);
  return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Parse formatted number back to integer
 * Removes dots (Indonesian thousand separator)
 * @param {string} str - Formatted string e.g. "1.234" or "1234"
 * @returns {number} Parsed number e.g. 1234
 */
function parseFormattedNumber(str) {
  if (!str) return 0;
  // Remove all dots (thousand separator) and spaces
  const cleaned = str.toString().replace(/\./g, '').replace(/\s/g, '').replace(/,/g, '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Format percentage with Indonesian format
 * @param {number} num - Percentage value
 * @param {number} decimals - Decimal places (default 2)
 * @returns {string} Formatted string e.g. "+10,12%" or "-7,50%"
 */
function formatPercent(num, decimals = 2) {
  if (num === null || num === undefined || isNaN(num)) return '0,00%';
  const prefix = num > 0 ? '+' : '';
  const formatted = num.toFixed(decimals).replace('.', ',');
  return `${prefix}${formatted}%`;
}

/**
 * Auto-format input value with thousand separator on keystroke
 * @param {HTMLInputElement} input - Input element
 */
function autoFormatInput(input) {
  const cursorPos = input.selectionStart;
  const oldLength = input.value.length;
  const rawValue = input.value.replace(/\./g, '').replace(/[^\d]/g, '');
  
  if (rawValue === '') {
    input.value = '';
    return;
  }
  
  const num = parseInt(rawValue, 10);
  if (isNaN(num)) return;
  
  input.value = formatNumber(num);
  
  // Restore cursor position
  const newLength = input.value.length;
  const diff = newLength - oldLength;
  const newPos = cursorPos + diff;
  input.setSelectionRange(newPos, newPos);
}

/**
 * Auto-format decimal input (for fee percentages)
 * @param {HTMLInputElement} input - Input element
 */
function autoFormatDecimalInput(input) {
  // Allow only numbers and one comma/dot
  let val = input.value.replace(/[^\d.,]/g, '');
  // Replace comma with dot for internal parsing
  val = val.replace(',', '.');
  // Limit to one decimal point
  const parts = val.split('.');
  if (parts.length > 2) {
    val = parts[0] + '.' + parts.slice(1).join('');
  }
  // Limit decimal to 2 places
  if (parts[1] && parts[1].length > 2) {
    val = parts[0] + '.' + parts[1].substring(0, 2);
  }
  input.value = val;
}

/**
 * Validate input value against rules
 * @param {*} value - Value to validate
 * @param {Object} rules - Validation rules
 * @returns {{ valid: boolean, message: string }}
 */
function validateInput(value, rules) {
  if (rules.required && (value === '' || value === null || value === undefined)) {
    return { valid: false, message: 'Field ini wajib diisi' };
  }
  
  if (value === '' || value === null || value === undefined) {
    return { valid: true, message: '' };
  }

  const num = typeof value === 'string' ? parseFormattedNumber(value) : value;

  if (rules.numeric && isNaN(num)) {
    return { valid: false, message: 'Harus berupa angka' };
  }

  if (rules.integer && !Number.isInteger(num)) {
    return { valid: false, message: 'Harus berupa bilangan bulat' };
  }

  if (rules.min !== undefined && num < rules.min) {
    return { valid: false, message: `Nilai minimum adalah ${rules.min}` };
  }

  if (rules.max !== undefined && num > rules.max) {
    return { valid: false, message: `Nilai maksimum adalah ${formatNumber(rules.max)}` };
  }

  if (rules.pattern && !rules.pattern.test(value)) {
    return { valid: false, message: rules.patternMessage || 'Format tidak valid' };
  }

  return { valid: true, message: '' };
}

/**
 * Generate unique ID
 * @returns {string} Unique ID string
 */
function generateId() {
  return 'calc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
}

/**
 * Debounce function
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in ms
 * @returns {Function} Debounced function
 */
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Format date to Indonesian locale
 * @param {string|Date} dateStr - ISO date string or Date object
 * @returns {string} Formatted date e.g. "29 Nov 2025, 10:30"
 */
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const d = date.getDate();
  const m = months[date.getMonth()];
  const y = date.getFullYear();
  const h = date.getHours().toString().padStart(2, '0');
  const min = date.getMinutes().toString().padStart(2, '0');
  return `${d} ${m} ${y}, ${h}:${min}`;
}

export {
  formatRupiah,
  formatNumber,
  parseFormattedNumber,
  formatPercent,
  autoFormatInput,
  autoFormatDecimalInput,
  validateInput,
  generateId,
  debounce,
  formatDate
};
