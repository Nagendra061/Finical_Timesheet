/**
 * Staffing Financial & Timesheet Management System
 * ID Generation Utility
 */

/**
 * Generates the next sequential formatted ID for an entity type.
 * @param {string} key 'EMP' | 'CLI' | 'JOB' | 'PLC' | 'TS' | 'INC' | 'INV' | 'PAY' | 'BIL'
 * @param {Record<string, number>} nextNumbers
 * @param {string} [prefix]
 * @returns {string}
 */
export function generateNextId(key, nextNumbers = {}, prefix = '') {
  const currentNum = nextNumbers[key] || 100;
  const currentYear = new Date().getFullYear();

  switch (key) {
    case 'EMP':
      return `EMP${String(currentNum).padStart(5, '0')}`;
    case 'CLI':
      return `CLI${currentYear}${String(currentNum).padStart(3, '0')}`;
    case 'JOB':
      return `JOB${currentYear}${String(currentNum).padStart(4, '0')}`;
    case 'PLC':
      return `PLC${currentYear}${String(currentNum).padStart(4, '0')}`;
    case 'TS':
      return `TS${currentYear}${String(currentNum).padStart(4, '0')}`;
    case 'INC':
      return `INC${currentYear}${String(currentNum).padStart(4, '0')}`;
    case 'INV':
      return `INV-${currentYear}-${String(currentNum).padStart(4, '0')}`;
    case 'PAY':
      return `PAY${currentYear}${String(currentNum).padStart(4, '0')}`;
    case 'BIL':
      return `BIL${currentYear}${String(currentNum).padStart(4, '0')}`;
    default:
      return `${prefix || key}${Date.now().toString().slice(-6)}`;
  }
}
