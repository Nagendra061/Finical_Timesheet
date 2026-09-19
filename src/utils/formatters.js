/**
 * Staffing Financial & Timesheet Management System
 * Formatting and Financial Calculation Utilities
 */

/**
 * Formats a number as USD currency string.
 * @param {number|undefined|null} amount
 * @returns {string} e.g. "$1,234.56"
 */
export function formatCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '$0.00';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a number with comma separators.
 * @param {number|undefined|null} num
 * @returns {string}
 */
export function formatNumber(num) {
  if (num === undefined || num === null || isNaN(num)) {
    return '0';
  }
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Formats a percentage number.
 * @param {number|undefined|null} percent
 * @returns {string}
 */
export function formatPercent(percent) {
  if (percent === undefined || percent === null || isNaN(percent)) {
    return '0.0%';
  }
  return `${Number(percent).toFixed(1)}%`;
}

/**
 * Formats a date string (YYYY-MM-DD) into user-friendly locale format.
 * @param {string|undefined|null} dateString
 * @returns {string}
 */
export function formatDate(dateString) {
  if (!dateString) return '—';
  try {
    const parts = dateString.split('T')[0].split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Formats a datetime string into locale format with time.
 * @param {string|undefined|null} dateString
 * @returns {string}
 */
export function formatDateTime(dateString) {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

/**
 * Calculates days difference: referenceDate - targetDate
 * @param {string} targetDateStr
 * @param {string} [referenceDateStr='2026-09-18']
 * @returns {number}
 */
export function getDaysDiff(targetDateStr, referenceDateStr = '2026-09-18') {
  try {
    const target = new Date(targetDateStr.split('T')[0]);
    const ref = new Date(referenceDateStr.split('T')[0]);
    const diffTime = ref.getTime() - target.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

/**
 * AR Aging Categories
 * Based on invoice due date and reference date (2026-09-18)
 * @param {string} dueDateStr
 * @param {string} [referenceDateStr='2026-09-18']
 * @returns {'Current' | '1-30 Days' | '31-60 Days' | '61-90 Days' | '90+ Days'}
 */
export function getARAgingCategory(dueDateStr, referenceDateStr = '2026-09-18') {
  const daysOverdue = getDaysDiff(dueDateStr, referenceDateStr);
  if (daysOverdue <= 0) {
    return 'Current';
  } else if (daysOverdue <= 30) {
    return '1-30 Days';
  } else if (daysOverdue <= 60) {
    return '31-60 Days';
  } else if (daysOverdue <= 90) {
    return '61-90 Days';
  } else {
    return '90+ Days';
  }
}

/**
 * AP Aging Categories
 * @param {string} dueDateStr
 * @param {string} [referenceDateStr='2026-09-18']
 * @returns {'Current' | 'Due This Week' | 'Due Next Week' | 'Overdue'}
 */
export function getAPAgingCategory(dueDateStr, referenceDateStr = '2026-09-18') {
  const daysDiff = -getDaysDiff(dueDateStr, referenceDateStr); // positive means future
  if (daysDiff < 0) {
    return 'Overdue';
  } else if (daysDiff <= 7) {
    return 'Due This Week';
  } else if (daysDiff <= 14) {
    return 'Due Next Week';
  } else {
    return 'Current';
  }
}

/**
 * Calculate Gross Margin & Margin %
 * @param {number} revenue
 * @param {number} workerCost
 * @returns {{ grossMargin: number, grossMarginPercent: number }}
 */
export function calculateStaffingMargin(revenue, workerCost) {
  const grossMargin = (revenue || 0) - (workerCost || 0);
  const grossMarginPercent = revenue > 0 ? (grossMargin / revenue) * 100 : 0;
  return {
    grossMargin,
    grossMarginPercent: Math.round(grossMarginPercent * 100) / 100,
  };
}

/**
 * Safe confirm helper for browsers/environments
 * @param {string} message
 * @returns {boolean}
 */
export function safeConfirm(message) {
  try {
    if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
      return window.confirm(message);
    }
    return true;
  } catch {
    return true;
  }
}
