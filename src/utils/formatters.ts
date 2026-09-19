/**
 * Staffing Financial & Timesheet Management System
 * Formatting and Financial Calculation Utilities
 */

export function formatCurrency(amount: number | undefined | null): string {
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

export function formatNumber(num: number | undefined | null): string {
  if (num === undefined || num === null || isNaN(num)) {
    return '0';
  }
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatPercent(percent: number | undefined | null): string {
  if (percent === undefined || percent === null || isNaN(percent)) {
    return '0.0%';
  }
  return `${percent.toFixed(1)}%`;
}

export function formatDate(dateString: string | undefined | null): string {
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

export function formatDateTime(dateString: string | undefined | null): string {
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
 */
export function getDaysDiff(targetDateStr: string, referenceDateStr?: string): number {
  try {
    const target = new Date(targetDateStr.split('T')[0]);
    const ref = referenceDateStr ? new Date(referenceDateStr.split('T')[0]) : new Date('2026-09-18');
    const diffTime = ref.getTime() - target.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

/**
 * AR Aging Categories
 * Based on invoice due date and reference date (2026-09-18)
 */
export type ARAgingBucket = 'Current' | '1-30 Days' | '31-60 Days' | '61-90 Days' | '90+ Days';

export function getARAgingCategory(dueDateStr: string, referenceDateStr: string = '2026-09-18'): ARAgingBucket {
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
 */
export type APAgingBucket = 'Current' | 'Due This Week' | 'Due Next Week' | 'Overdue';

export function getAPAgingCategory(dueDateStr: string, referenceDateStr: string = '2026-09-18'): APAgingBucket {
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
 */
export function calculateStaffingMargin(revenue: number, workerCost: number): {
  grossMargin: number;
  grossMarginPercent: number;
} {
  const grossMargin = revenue - workerCost;
  const grossMarginPercent = revenue > 0 ? (grossMargin / revenue) * 100 : 0;
  return {
    grossMargin,
    grossMarginPercent: Math.round(grossMarginPercent * 100) / 100,
  };
}

export function safeConfirm(message: string): boolean {
  try {
    if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
      return window.confirm(message);
    }
    return true;
  } catch {
    return true;
  }
}
