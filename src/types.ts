/**
 * Staffing Financial & Timesheet Management System
 * Core Types and Entity Definitions (Database-ready schema for Phase-1 JSON store)
 */

export type EmployeeType = 'W2' | '1099';
export type EmployeeStatus = 'Active' | 'Inactive' | 'Terminated';
export type ClientStatus = 'Active' | 'Inactive';
export type JobStatus = 'Active' | 'Filled' | 'Closed' | 'On Hold';
export type EmploymentType = 'Contract' | 'Full-time' | 'Part-time' | 'Contract-to-Hire';
export type PlacementStatus = 'Active' | 'Completed' | 'Terminated';
export type TimesheetStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
export type IncomeStatus = 'Unbilled' | 'Billed' | 'Posted';
export type InvoiceStatus = 'Open' | 'Partially Paid' | 'Paid' | 'Overdue';
export type BillStatus = 'Unpaid' | 'Partially Paid' | 'Paid' | 'Overdue';
export type PaymentMethod = 'ACH' | 'Wire' | 'Credit Card' | 'Check' | 'Direct Deposit';
export type ImportFileType = 'employees' | 'clients' | 'placements' | 'timesheets' | 'payments' | 'vendors';
export type ImportBatchStatus = 'Processing' | 'Completed' | 'Completed with Errors' | 'Failed';

export interface BaseEntity {
  id: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  version?: number;
}

export interface Employee extends BaseEntity {
  employeeType: EmployeeType;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: EmployeeStatus;
  hireDate: string;
  department?: string;
  currentPlacementId?: string;
  paymentFrequency?: string;
}

export interface ClientContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  title?: string;
  isPrimary: boolean;
}

export interface Client extends BaseEntity {
  name: string;
  status: ClientStatus;
  paymentTerms: string; // e.g., '15 days', '30 days', '45 days', '60 days'
  contacts: ClientContact[];
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone?: string;
  billingAddress?: string;
  billingEmail?: string;
  industry?: string;
}

export type PaymentTerms = string;
export type APBillStatus = BillStatus;
export type ImportEntityType = ImportFileType;

export interface CSVValidationResult {
  recordsRead: number;
  totalRows: number;
  validRows: { rowIndex: number; data: Record<string, string> }[];
  rejectedRows: { rowIndex: number; rawRow: Record<string, string>; errors: string[] }[];
  isValid: boolean;
}

export interface Job extends BaseEntity {
  clientId: string;
  title: string;
  department: string;
  location: string;
  employmentType: EmploymentType;
  status: JobStatus;
  description?: string;
}

export interface Placement extends BaseEntity {
  employeeId: string;
  clientId: string;
  jobId: string;
  startDate: string;
  endDate?: string;
  billingRate: number; // e.g. 72.00
  payRate: number;     // e.g. 48.00
  overtimeBillingRate?: number;
  overtimePayRate?: number;
  overtimeMultiplier?: number;
  billingUnit: 'Hour' | 'Day';
  payUnit: 'Hour' | 'Day';
  status: PlacementStatus;
  notes?: string;
}

export interface DailyTimesheetEntry {
  date: string; // YYYY-MM-DD
  dayOfWeek?: string; // Mon, Tue, etc.
  regularHours: number;
  overtimeHours: number;
  holidayHours: number;
  notes?: string;
}

export type DailyHourEntry = DailyTimesheetEntry;

export interface Timesheet extends BaseEntity {
  placementId: string;
  employeeId: string;
  clientId: string;
  jobId: string;
  periodStartDate: string;
  periodEndDate: string;
  dailyEntries: DailyTimesheetEntry[];
  dailyHours?: DailyTimesheetEntry[];
  regularHours: number;
  overtimeHours: number;
  holidayHours: number;
  totalHours: number;
  status: TimesheetStatus;
  approvedBy?: string;
  approvalDate?: string;
  approvedAt?: string;
  rejectionReason?: string;
  submittedAt?: string;
  incomeId?: string;
  billId?: string;
  notes?: string;
}

export interface IncomeRecord extends BaseEntity {
  sourceType: 'Timesheet' | 'Manual';
  sourceId: string; // Timesheet ID
  employeeId: string;
  clientId: string;
  placementId: string;
  timesheetId: string;
  periodStartDate: string;
  periodEndDate: string;
  regularHours: number;
  overtimeHours: number;
  holidayHours: number;
  billingRate: number;
  overtimeBillingRate: number;
  totalIncome: number;
  invoiceId?: string;
  status: IncomeStatus;
}

export interface InvoiceLineItem {
  id: string;
  incomeId?: string;
  timesheetId?: string;
  hours?: number;
  description: string;
  quantity: number; // hours
  rate: number;
  amount: number;
}

export interface Invoice extends BaseEntity {
  invoiceNumber: string;
  clientId: string;
  invoiceDate: string;
  dueDate: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  amountPaid: number;
  balance: number;
  status: InvoiceStatus;
  paymentTerms: string;
  notes?: string;
}

export interface ARPayment extends BaseEntity {
  invoiceId: string;
  clientId: string;
  paymentDate: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  status: 'Completed' | 'Pending' | 'Voided';
  notes?: string;
}

export interface APBill extends BaseEntity {
  sourceType: 'Timesheet' | 'Manual';
  sourceId: string; // Timesheet ID
  timesheetId: string;
  employeeId: string; // Employee or Contractor
  placementId: string;
  periodStartDate: string;
  periodEndDate: string;
  regularHours: number;
  regularRate: number;
  payRate?: number;
  regularAmount: number;
  overtimeHours: number;
  overtimeRate: number;
  overtimeAmount: number;
  holidayHours: number;
  holidayAmount: number;
  totalPayable: number;
  amountPaid: number;
  balance: number;
  dueDate: string;
  status: BillStatus;
}

export interface APPayment extends BaseEntity {
  billId: string;
  apBillId?: string;
  employeeId: string;
  paymentDate: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  status: 'Completed' | 'Voided';
  notes?: string;
}

export type TransactionType =
  | 'Income Accrual'
  | 'Invoice Generation'
  | 'AR Payment'
  | 'AP Accrual'
  | 'AP Payment'
  | 'Adjustment'
  | string;

export interface TransactionLedgerEntry {
  id: string;
  organizationId: string;
  transactionType: 'Income Accrual' | 'Invoice Generation' | 'AR Payment' | 'AP Accrual' | 'AP Payment' | 'Adjustment' | string;
  sourceType: 'Timesheet' | 'Invoice' | 'Payment' | 'Bill' | string;
  sourceId: string;
  date: string;
  transactionDate?: string;
  debit: number;
  credit: number;
  account: string;
  currency: string;
  description: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  organizationId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'GENERATE_INVOICE' | 'RECORD_PAYMENT' | 'IMPORT' | 'GENERATE_AP' | string;
  entity: string;
  entityType?: string;
  entityId: string;
  user: string;
  timestamp: string;
  previousValue?: string;
  newValue?: string;
  details?: string;
}

export interface ImportError {
  row: number;
  rowIndex?: number;
  field: string;
  error: string;
  errors?: string[];
  rawData?: Record<string, string>;
  rawRow?: Record<string, string>;
}

export interface ImportBatch {
  id: string;
  fileName: string;
  fileType: ImportFileType;
  entityType?: ImportFileType;
  receivedDate: string;
  importedAt?: string;
  recordsRead: number;
  totalRows?: number;
  recordsImported: number;
  importedRows?: number;
  recordsRejected: number;
  rejectedRows?: number;
  status: ImportBatchStatus;
  errors: ImportError[];
  rawContent?: string;
}

export interface OrganizationConfig {
  id: string;
  name: string;
  currency: string;
  timezone: string;
  fiscalYearStart: string;
  numbering: {
    employeePrefix: string;
    clientPrefix: string;
    jobPrefix: string;
    placementPrefix: string;
    timesheetPrefix: string;
    incomePrefix: string;
    invoicePrefix: string;
    paymentPrefix: string;
    billPrefix: string;
    nextNumbers: Record<string, number>;
  };
}

export type NavigationTab =
  | 'dashboard'
  | 'employees'
  | 'clients'
  | 'jobs'
  | 'placements'
  | 'timesheets'
  | 'income'
  | 'ar'
  | 'ap'
  | 'imports'
  | 'history'
  | 'reports'
  | 'ledger'
  | 'audit'
  | 'traceability'
  | 'settings';
