/**
 * Staffing Financial & Timesheet Management System
 * CSV Parser, Validator, and Template Exporter
 */

/**
 * Parses raw CSV text into header array and array of row objects.
 * Handles quoted cells with commas and escaped quotes.
 * @param {string} csvText
 * @returns {{ headers: string[], rows: Record<string, string>[], rawText: string }}
 */
export function parseCSV(csvText) {
  const cleanText = (csvText || '').trim();
  if (!cleanText) {
    return { headers: [], rows: [], rawText: csvText };
  }

  const lines = cleanText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) {
    return { headers: [], rows: [], rawText: csvText };
  }

  const parseLine = (line) => {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  };

  const headers = parseLine(lines[0]).map(h => h.trim().toLowerCase());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const rawValues = parseLine(lines[i]);
    const rowObj = {};
    headers.forEach((header, idx) => {
      rowObj[header] = rawValues[idx] !== undefined ? rawValues[idx] : '';
    });
    rows.push(rowObj);
  }

  return { headers, rows, rawText: csvText };
}

/**
 * Validates parsed CSV rows against schema constraints and relational foreign keys.
 * @param {string} fileType
 * @param {Record<string, string>[]} rows
 * @param {{
 *   existingEmployees: { id: string }[],
 *   existingClients: { id: string }[],
 *   existingJobs: { id: string }[],
 *   existingPlacements: { id: string }[],
 *   existingInvoices: { id: string, balance: number }[]
 * }} ctx
 * @returns {{
 *   recordsRead: number,
 *   validRecords: Record<string, string>[],
 *   rejectedRecords: { row: number, data: Record<string, string>, errors: string[] }[],
 *   errors: { row: number, field: string, error: string, rawData?: Record<string, string> }[]
 * }}
 */
export function validateCSVRows(fileType, rows, ctx) {
  const validRecords = [];
  const rejectedRecords = [];
  const errors = [];

  const employeeIds = new Set((ctx.existingEmployees || []).map(e => e.id));
  const clientIds = new Set((ctx.existingClients || []).map(c => c.id));
  const jobIds = new Set((ctx.existingJobs || []).map(j => j.id));
  const placementIds = new Set((ctx.existingPlacements || []).map(p => p.id));
  const invoiceMap = new Map((ctx.existingInvoices || []).map(i => [i.id, i.balance]));

  rows.forEach((row, index) => {
    const rowNum = index + 2; // header is row 1
    const rowErrors = [];

    switch (fileType) {
      case 'employees': {
        const id = row.employee_id || row.id;
        if (!id) {
          rowErrors.push('Missing required field: employee_id');
          errors.push({ row: rowNum, field: 'employee_id', error: 'Employee ID is required', rawData: row });
        } else if (employeeIds.has(id)) {
          rowErrors.push(`Duplicate employee_id: ${id}`);
          errors.push({ row: rowNum, field: 'employee_id', error: `Employee ID "${id}" already exists`, rawData: row });
        }

        const type = (row.employee_type || '').toUpperCase();
        if (!['W2', '1099'].includes(type)) {
          rowErrors.push(`Invalid employee_type: "${row.employee_type}". Must be W2 or 1099.`);
          errors.push({ row: rowNum, field: 'employee_type', error: 'Must be W2 or 1099', rawData: row });
        }

        if (!row.first_name) {
          rowErrors.push('Missing first_name');
          errors.push({ row: rowNum, field: 'first_name', error: 'First name is required', rawData: row });
        }
        if (!row.last_name) {
          rowErrors.push('Missing last_name');
          errors.push({ row: rowNum, field: 'last_name', error: 'Last name is required', rawData: row });
        }
        if (!row.email || !row.email.includes('@') || !row.email.includes('.')) {
          rowErrors.push(`Invalid email format: "${row.email}"`);
          errors.push({ row: rowNum, field: 'email', error: 'Invalid email address', rawData: row });
        }
        break;
      }

      case 'clients': {
        const id = row.client_id || row.id;
        if (!id) {
          rowErrors.push('Missing required client_id');
          errors.push({ row: rowNum, field: 'client_id', error: 'Client ID is required', rawData: row });
        } else if (clientIds.has(id)) {
          rowErrors.push(`Duplicate client_id: ${id}`);
          errors.push({ row: rowNum, field: 'client_id', error: `Client ID "${id}" already exists`, rawData: row });
        }
        if (!row.name && !row.client_name) {
          rowErrors.push('Missing client name');
          errors.push({ row: rowNum, field: 'name', error: 'Client name is required', rawData: row });
        }
        break;
      }

      case 'placements': {
        const id = row.placement_id || row.id;
        if (!id) {
          rowErrors.push('Missing required placement_id');
          errors.push({ row: rowNum, field: 'placement_id', error: 'Placement ID is required', rawData: row });
        } else if (placementIds.has(id)) {
          rowErrors.push(`Duplicate placement_id: ${id}`);
          errors.push({ row: rowNum, field: 'placement_id', error: `Placement ID "${id}" already exists`, rawData: row });
        }
        const empId = row.employee_id;
        if (!empId || !employeeIds.has(empId)) {
          rowErrors.push(`Referenced employee_id "${empId}" does not exist in master records`);
          errors.push({ row: rowNum, field: 'employee_id', error: `Employee ID "${empId}" does not exist`, rawData: row });
        }
        const cliId = row.client_id;
        if (!cliId || !clientIds.has(cliId)) {
          rowErrors.push(`Referenced client_id "${cliId}" does not exist in master records`);
          errors.push({ row: rowNum, field: 'client_id', error: `Client ID "${cliId}" does not exist`, rawData: row });
        }
        const jobId = row.job_id;
        if (jobId && !jobIds.has(jobId)) {
          rowErrors.push(`Referenced job_id "${jobId}" does not exist in master records`);
          errors.push({ row: rowNum, field: 'job_id', error: `Job ID "${jobId}" does not exist`, rawData: row });
        }
        const billRate = parseFloat(row.billing_rate || '0');
        const payRate = parseFloat(row.pay_rate || '0');
        if (isNaN(billRate) || billRate <= 0) {
          rowErrors.push('Billing rate must be a positive number');
          errors.push({ row: rowNum, field: 'billing_rate', error: 'Billing rate must be > 0', rawData: row });
        }
        if (isNaN(payRate) || payRate <= 0) {
          rowErrors.push('Pay rate must be a positive number');
          errors.push({ row: rowNum, field: 'pay_rate', error: 'Pay rate must be > 0', rawData: row });
        }
        break;
      }

      case 'timesheets': {
        const plcId = row.placement_id;
        if (!plcId || !placementIds.has(plcId)) {
          rowErrors.push(`Referenced placement_id "${plcId}" does not exist`);
          errors.push({ row: rowNum, field: 'placement_id', error: `Placement "${plcId}" not found`, rawData: row });
        }
        const regHours = parseFloat(row.regular_hours || '0');
        if (isNaN(regHours) || regHours < 0) {
          rowErrors.push('Regular hours cannot be negative');
          errors.push({ row: rowNum, field: 'regular_hours', error: 'Hours cannot be negative', rawData: row });
        }
        break;
      }

      case 'payments': {
        const invId = row.invoice_id;
        const amount = parseFloat(row.amount || '0');
        if (!invId) {
          rowErrors.push('Invoice ID is required');
          errors.push({ row: rowNum, field: 'invoice_id', error: 'Invoice ID required', rawData: row });
        } else if (!invoiceMap.has(invId)) {
          rowErrors.push(`Invoice "${invId}" does not exist in AR system`);
          errors.push({ row: rowNum, field: 'invoice_id', error: `Invoice "${invId}" not found`, rawData: row });
        } else {
          const bal = invoiceMap.get(invId) || 0;
          if (amount <= 0) {
            rowErrors.push('Payment amount must be greater than 0');
            errors.push({ row: rowNum, field: 'amount', error: 'Amount must be positive', rawData: row });
          } else if (amount > bal + 0.01) {
            rowErrors.push(`Payment amount ($${amount.toFixed(2)}) exceeds invoice open balance ($${bal.toFixed(2)})`);
            errors.push({ row: rowNum, field: 'amount', error: `Payment exceeds open balance ($${bal})`, rawData: row });
          }
        }
        break;
      }

      case 'vendors': {
        const id = row.vendor_id || row.id;
        if (!id) {
          rowErrors.push('Missing vendor_id');
          errors.push({ row: rowNum, field: 'vendor_id', error: 'Vendor ID required', rawData: row });
        }
        if (!row.vendor_name && !row.name) {
          rowErrors.push('Missing vendor_name');
          errors.push({ row: rowNum, field: 'vendor_name', error: 'Vendor name required', rawData: row });
        }
        break;
      }

      default:
        break;
    }

    if (rowErrors.length > 0) {
      rejectedRecords.push({ row: rowNum, data: row, errors: rowErrors });
    } else {
      validRecords.push(row);
    }
  });

  return {
    recordsRead: rows.length,
    validRecords,
    rejectedRecords,
    errors
  };
}

/**
 * Triggers a browser file download of CSV content.
 * @param {string} filename
 * @param {string} content
 */
export function downloadCSV(filename, content) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const SAMPLE_CSV_TEMPLATES = {
  employees: `employee_id,employee_type,first_name,last_name,email,phone,department
EMP2026105,W2,Marcus,Aurelius,marcus.aurelius@apexstaffing.com,415-555-0199,Engineering
EMP2026106,1099,Elena,Rostova,elena.rostova@contractor.io,415-555-0288,Product Management`,

  clients: `client_id,name,payment_terms,primary_contact_name,primary_contact_email,primary_contact_phone,billing_address
CLI2026104,Stripe Financial Labs,30 days,Sarah Jenkins,sjenkins@stripe-labs.com,415-555-4011,"510 Townsend St, San Francisco, CA"
CLI2026105,Datadog Systems,15 days,Michael Chang,mchang@datadoghq.com,415-555-4022,"620 8th Ave, New York, NY"`,

  placements: `placement_id,employee_id,client_id,job_id,start_date,end_date,billing_rate,pay_rate,overtime_multiplier
PLC2026105,EMP2026101,CLI2026101,JOB2026101,2026-09-01,2027-03-01,115.00,75.00,1.5
PLC2026106,EMP2026102,CLI2026102,JOB2026102,2026-09-01,2027-03-01,120.00,80.00,1.5`,

  timesheets: `timesheet_id,placement_id,period_start,period_end,regular_hours,overtime_hours,holiday_hours,notes
TS2026105,PLC2026101,2026-09-01,2026-09-07,40,5,0,Full cycle deployment sprint
TS2026106,PLC2026102,2026-09-01,2026-09-07,35,0,0,Standard platform sprint`,

  payments: `invoice_id,amount,payment_date,payment_method,reference_number
INV2026101,2800.00,2026-09-12,ACH Transfer,ACH-9821034
INV2026102,4200.00,2026-09-14,Wire Transfer,WIRE-2026-5519`,

  vendors: `vendor_id,vendor_name,category,contact_email
VND2026101,TriNet HR Services,Payroll Administration,support@trinet.com
VND2026102,Hiscox Business Insurance,Liability Coverage,agents@hiscox.com`
};

/**
 * Validates CSV text against simple entity requirements.
 * @param {string} csvContent
 * @param {string} entityType
 * @param {{
 *   employees?: string[],
 *   clients?: string[],
 *   placements?: string[],
 *   jobs?: string[],
 *   invoices?: string[]
 * }} [existingIds]
 * @returns {{
 *   recordsRead: number,
 *   totalRows: number,
 *   validRows: { rowIndex: number, data: Record<string, string> }[],
 *   rejectedRows: { rowIndex: number, rawRow: Record<string, string>, errors: string[] }[],
 *   isValid: boolean
 * }}
 */
export function validateCSVData(csvContent, entityType, existingIds) {
  const parsed = parseCSV(csvContent);
  const validRows = [];
  const rejectedRows = [];

  const empSet = new Set(existingIds?.employees || []);
  const cliSet = new Set(existingIds?.clients || []);
  const plcSet = new Set(existingIds?.placements || []);

  parsed.rows.forEach((row, idx) => {
    const rowNum = idx + 2;
    const errors = [];

    if (entityType === 'employees') {
      const id = row.employee_id || row.id;
      if (!id) errors.push('Missing employee_id');
      if (id && empSet.has(id)) errors.push(`Employee ID ${id} already exists`);
      if (!row.first_name) errors.push('Missing first_name');
      if (!row.last_name) errors.push('Missing last_name');
      if (!row.email) errors.push('Missing email');
    } else if (entityType === 'clients') {
      const id = row.client_id || row.id;
      if (!id) errors.push('Missing client_id');
      if (id && cliSet.has(id)) errors.push(`Client ID ${id} already exists`);
      if (!row.name) errors.push('Missing client name');
    } else if (entityType === 'placements') {
      const id = row.placement_id || row.id;
      if (!id) errors.push('Missing placement_id');
      if (!row.employee_id) errors.push('Missing employee_id');
      if (!row.client_id) errors.push('Missing client_id');
      if (!row.billing_rate) errors.push('Missing billing_rate');
      if (!row.pay_rate) errors.push('Missing pay_rate');
    } else if (entityType === 'timesheets') {
      if (!row.placement_id) errors.push('Missing placement_id');
      if (!row.period_start) errors.push('Missing period_start');
      if (!row.period_end) errors.push('Missing period_end');
      if (!row.regular_hours) errors.push('Missing regular_hours');
    } else if (entityType === 'payments') {
      if (!row.invoice_id) errors.push('Missing invoice_id');
      if (!row.amount) errors.push('Missing amount');
    }

    if (errors.length > 0) {
      rejectedRows.push({ rowIndex: rowNum, rawRow: row, errors });
    } else {
      validRows.push({ rowIndex: rowNum, data: row });
    }
  });

  return {
    recordsRead: parsed.rows.length,
    totalRows: parsed.rows.length,
    validRows,
    rejectedRows,
    isValid: rejectedRows.length === 0
  };
}
