/**
 * Staffing Financial & Timesheet Management System
 * Central Business Logic and State Context
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Employee,
  Client,
  Job,
  Placement,
  Timesheet,
  IncomeRecord,
  Invoice,
  ARPayment,
  APBill,
  APPayment,
  TransactionLedgerEntry,
  AuditLog,
  ImportBatch,
  OrganizationConfig,
  ImportFileType,
  DailyTimesheetEntry
} from '../types';
import {
  INITIAL_CONFIG,
  INITIAL_EMPLOYEES,
  INITIAL_CLIENTS,
  INITIAL_JOBS,
  INITIAL_PLACEMENTS,
  INITIAL_TIMESHEETS,
  INITIAL_INCOME,
  INITIAL_INVOICES,
  INITIAL_AR_PAYMENTS,
  INITIAL_AP_BILLS,
  INITIAL_AP_PAYMENTS,
  INITIAL_TRANSACTIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_IMPORT_BATCHES
} from '../data/initialData';
import { parseCSV, validateCSVRows } from '../utils/csvHelper';

export interface TraceabilityLineage {
  employee?: Employee;
  client?: Client;
  job?: Job;
  placement?: Placement;
  timesheet?: Timesheet;
  income?: IncomeRecord;
  invoice?: Invoice;
  arPayments: ARPayment[];
  apBill?: APBill;
  apPayments: APPayment[];
  transactions: TransactionLedgerEntry[];
  ledgerEntries?: TransactionLedgerEntry[];
  auditLogs: AuditLog[];
}

interface StaffingContextType {
  // Entities
  employees: Employee[];
  clients: Client[];
  jobs: Job[];
  placements: Placement[];
  timesheets: Timesheet[];
  incomes: IncomeRecord[];
  invoices: Invoice[];
  arPayments: ARPayment[];
  apBills: APBill[];
  apPayments: APPayment[];
  transactions: TransactionLedgerEntry[];
  ledger: TransactionLedgerEntry[];
  auditLogs: AuditLog[];
  importBatches: ImportBatch[];
  config: OrganizationConfig;

  // CRUD & Operations
  addEmployee: (emp: Omit<Employee, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => Employee;
  updateEmployee: (id: string, emp: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;

  addClient: (cli: Omit<Client, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => Client;
  updateClient: (id: string, cli: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  addJob: (job: Omit<Job, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => Job;
  updateJob: (id: string, job: Partial<Job>) => void;
  deleteJob: (id: string) => void;

  addPlacement: (plc: Omit<Placement, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => Placement;
  updatePlacement: (id: string, plc: Partial<Placement>) => void;
  deletePlacement: (id: string) => void;

  addTimesheet: (ts: Omit<Timesheet, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => Timesheet;
  updateTimesheet: (id: string, ts: Partial<Timesheet>) => void;
  submitTimesheet: (id: string) => void;
  approveTimesheet: (id: string, approverName: string) => { income: IncomeRecord; apBill: APBill } | undefined;
  rejectTimesheet: (id: string, reason: string) => void;
  deleteTimesheet: (id: string) => void;

  // Financial Generation Workflows
  generateInvoiceFromIncome: (
    incomeIds: string[],
    invoiceDate: string,
    dueDate: string,
    notes?: string
  ) => Invoice[];
  recordARPayment: (
    invoiceIdOrData: string | { invoiceId: string; amount: number; paymentDate: string; paymentMethod: any; referenceNumber?: string; notes?: string },
    amount?: number,
    paymentDate?: string,
    paymentMethod?: any,
    referenceNumber?: string,
    notes?: string
  ) => ARPayment;
  recordAPPayment: (
    billIdOrData: string | { apBillId?: string; billId?: string; amount: number; paymentDate: string; paymentMethod: any; referenceNumber?: string; notes?: string },
    amount?: number,
    paymentDate?: string,
    paymentMethod?: any,
    referenceNumber?: string,
    notes?: string
  ) => APPayment;

  // CSV Import
  processCSVImport: (
    fileType: ImportFileType,
    csvContent: string,
    fileName: string
  ) => ImportBatch;

  // Traceability & System Ops
  getTraceabilityLineage: (sourceTypeOrId: string, maybeSourceId?: string) => TraceabilityLineage;
  resetToInitialData: () => void;
  resetDatabaseToDefaults: () => void;
  exportSystemDataJSON: () => string;
  exportFullDatabaseJSON: () => string;
  importSystemDataJSON: (jsonStr: string) => boolean;
  updateConfig: (cfg: Partial<OrganizationConfig>) => void;
}

const StaffingContext = createContext<StaffingContextType | undefined>(undefined);

const STORAGE_KEY = 'staffing_mgmt_phase1_db_v1';

export const StaffingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Try loading from localStorage, else fallback to initial data
  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_employees`);
      return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
    } catch {
      return INITIAL_EMPLOYEES;
    }
  });

  const [clients, setClients] = useState<Client[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_clients`);
      return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
    } catch {
      return INITIAL_CLIENTS;
    }
  });

  const [jobs, setJobs] = useState<Job[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_jobs`);
      return saved ? JSON.parse(saved) : INITIAL_JOBS;
    } catch {
      return INITIAL_JOBS;
    }
  });

  const [placements, setPlacements] = useState<Placement[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_placements`);
      return saved ? JSON.parse(saved) : INITIAL_PLACEMENTS;
    } catch {
      return INITIAL_PLACEMENTS;
    }
  });

  const [timesheets, setTimesheets] = useState<Timesheet[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_timesheets`);
      return saved ? JSON.parse(saved) : INITIAL_TIMESHEETS;
    } catch {
      return INITIAL_TIMESHEETS;
    }
  });

  const [incomes, setIncomes] = useState<IncomeRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_incomes`);
      return saved ? JSON.parse(saved) : INITIAL_INCOME;
    } catch {
      return INITIAL_INCOME;
    }
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_invoices`);
      return saved ? JSON.parse(saved) : INITIAL_INVOICES;
    } catch {
      return INITIAL_INVOICES;
    }
  });

  const [arPayments, setArPayments] = useState<ARPayment[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_ar_payments`);
      return saved ? JSON.parse(saved) : INITIAL_AR_PAYMENTS;
    } catch {
      return INITIAL_AR_PAYMENTS;
    }
  });

  const [apBills, setApBills] = useState<APBill[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_ap_bills`);
      return saved ? JSON.parse(saved) : INITIAL_AP_BILLS;
    } catch {
      return INITIAL_AP_BILLS;
    }
  });

  const [apPayments, setApPayments] = useState<APPayment[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_ap_payments`);
      return saved ? JSON.parse(saved) : INITIAL_AP_PAYMENTS;
    } catch {
      return INITIAL_AP_PAYMENTS;
    }
  });

  const [transactions, setTransactions] = useState<TransactionLedgerEntry[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_transactions`);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_audit_logs`);
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  const [importBatches, setImportBatches] = useState<ImportBatch[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_import_batches`);
      return saved ? JSON.parse(saved) : INITIAL_IMPORT_BATCHES;
    } catch {
      return INITIAL_IMPORT_BATCHES;
    }
  });

  const [config, setConfig] = useState<OrganizationConfig>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_config`);
      return saved ? JSON.parse(saved) : INITIAL_CONFIG;
    } catch {
      return INITIAL_CONFIG;
    }
  });

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_employees`, JSON.stringify(employees));
      localStorage.setItem(`${STORAGE_KEY}_clients`, JSON.stringify(clients));
      localStorage.setItem(`${STORAGE_KEY}_jobs`, JSON.stringify(jobs));
      localStorage.setItem(`${STORAGE_KEY}_placements`, JSON.stringify(placements));
      localStorage.setItem(`${STORAGE_KEY}_timesheets`, JSON.stringify(timesheets));
      localStorage.setItem(`${STORAGE_KEY}_incomes`, JSON.stringify(incomes));
      localStorage.setItem(`${STORAGE_KEY}_invoices`, JSON.stringify(invoices));
      localStorage.setItem(`${STORAGE_KEY}_ar_payments`, JSON.stringify(arPayments));
      localStorage.setItem(`${STORAGE_KEY}_ap_bills`, JSON.stringify(apBills));
      localStorage.setItem(`${STORAGE_KEY}_ap_payments`, JSON.stringify(apPayments));
      localStorage.setItem(`${STORAGE_KEY}_transactions`, JSON.stringify(transactions));
      localStorage.setItem(`${STORAGE_KEY}_audit_logs`, JSON.stringify(auditLogs));
      localStorage.setItem(`${STORAGE_KEY}_import_batches`, JSON.stringify(importBatches));
      localStorage.setItem(`${STORAGE_KEY}_config`, JSON.stringify(config));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [
    employees,
    clients,
    jobs,
    placements,
    timesheets,
    incomes,
    invoices,
    arPayments,
    apBills,
    apPayments,
    transactions,
    auditLogs,
    importBatches,
    config
  ]);

  // ID Generation helper
  const generateNextId = (key: keyof OrganizationConfig['numbering']['nextNumbers'], prefix: string): string => {
    const currentNum = config.numbering.nextNumbers[key] || 101;
    const padded = String(currentNum).padStart(currentNum < 1000 ? (key === 'JOB' ? 8 : 5) : 5, '0');
    const newId = `${prefix}${padded}`;
    setConfig(prev => ({
      ...prev,
      numbering: {
        ...prev.numbering,
        nextNumbers: {
          ...prev.numbering.nextNumbers,
          [key]: currentNum + 1
        }
      }
    }));
    return newId;
  };

  const logAudit = (
    action: AuditLog['action'],
    entity: string,
    entityId: string,
    details: string,
    previousValue?: string,
    newValue?: string
  ) => {
    const newLog: AuditLog = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      organizationId: config.id,
      action,
      entity,
      entityId,
      user: 'Operations Manager',
      timestamp: new Date().toISOString(),
      previousValue,
      newValue,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // 1. Employees
  const addEmployee = (empData: Omit<Employee, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>): Employee => {
    const id = generateNextId('EMP', config.numbering.employeePrefix);
    const now = new Date().toISOString();
    const newEmp: Employee = {
      ...empData,
      id,
      organizationId: config.id,
      createdAt: now,
      updatedAt: now,
      version: 1
    };
    setEmployees(prev => [newEmp, ...prev]);
    logAudit('CREATE', 'Employee', id, `Created ${newEmp.employeeType} employee ${newEmp.firstName} ${newEmp.lastName}`);
    return newEmp;
  };

  const updateEmployee = (id: string, empData: Partial<Employee>) => {
    const prevEmp = employees.find(e => e.id === id);
    setEmployees(prev =>
      prev.map(e => (e.id === id ? { ...e, ...empData, updatedAt: new Date().toISOString() } : e))
    );
    logAudit('UPDATE', 'Employee', id, `Updated employee ${id}`, prevEmp?.status, empData.status);
  };

  const deleteEmployee = (id: string) => {
    const target = employees.find(e => e.id === id);
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, status: 'Inactive', updatedAt: new Date().toISOString() } : e));
    logAudit('DELETE', 'Employee', id, `Deactivated employee ${target?.firstName} ${target?.lastName} (${id})`);
  };

  // 2. Clients
  const addClient = (cliData: Omit<Client, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>): Client => {
    const id = generateNextId('CLI', config.numbering.clientPrefix);
    const now = new Date().toISOString();
    const newCli: Client = {
      ...cliData,
      id,
      organizationId: config.id,
      createdAt: now,
      updatedAt: now,
      version: 1
    };
    setClients(prev => [newCli, ...prev]);
    logAudit('CREATE', 'Client', id, `Created client ${newCli.name} (${id})`);
    return newCli;
  };

  const updateClient = (id: string, cliData: Partial<Client>) => {
    setClients(prev =>
      prev.map(c => (c.id === id ? { ...c, ...cliData, updatedAt: new Date().toISOString() } : c))
    );
    logAudit('UPDATE', 'Client', id, `Updated client ${id}`);
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, status: 'Inactive', updatedAt: new Date().toISOString() } : c));
    logAudit('DELETE', 'Client', id, `Deactivated client ${id}`);
  };

  // 3. Jobs
  const addJob = (jobData: Omit<Job, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>): Job => {
    const id = `JOB2026${String(config.numbering.nextNumbers.JOB || 50).padStart(4, '0')}`;
    setConfig(prev => ({
      ...prev,
      numbering: {
        ...prev.numbering,
        nextNumbers: { ...prev.numbering.nextNumbers, JOB: (prev.numbering.nextNumbers.JOB || 50) + 1 }
      }
    }));
    const now = new Date().toISOString();
    const newJob: Job = {
      ...jobData,
      id,
      organizationId: config.id,
      createdAt: now,
      updatedAt: now,
      version: 1
    };
    setJobs(prev => [newJob, ...prev]);
    logAudit('CREATE', 'Job', id, `Created job position "${newJob.title}" (${id})`);
    return newJob;
  };

  const updateJob = (id: string, jobData: Partial<Job>) => {
    setJobs(prev =>
      prev.map(j => (j.id === id ? { ...j, ...jobData, updatedAt: new Date().toISOString() } : j))
    );
    logAudit('UPDATE', 'Job', id, `Updated job position ${id}`);
  };

  const deleteJob = (id: string) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'Closed', updatedAt: new Date().toISOString() } : j));
    logAudit('DELETE', 'Job', id, `Closed job ${id}`);
  };

  // 4. Placements
  const addPlacement = (plcData: Omit<Placement, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>): Placement => {
    const id = `PLC2026${String(config.numbering.nextNumbers.PLC || 130).padStart(4, '0')}`;
    setConfig(prev => ({
      ...prev,
      numbering: {
        ...prev.numbering,
        nextNumbers: { ...prev.numbering.nextNumbers, PLC: (prev.numbering.nextNumbers.PLC || 130) + 1 }
      }
    }));
    const now = new Date().toISOString();
    const newPlc: Placement = {
      ...plcData,
      id,
      organizationId: config.id,
      createdAt: now,
      updatedAt: now,
      version: 1
    };
    setPlacements(prev => [newPlc, ...prev]);

    // Update employee current placement
    setEmployees(prev =>
      prev.map(e => (e.id === plcData.employeeId ? { ...e, currentPlacementId: id } : e))
    );

    logAudit('CREATE', 'Placement', id, `Assigned employee ${plcData.employeeId} to placement ${id} at client ${plcData.clientId}`);
    return newPlc;
  };

  const updatePlacement = (id: string, plcData: Partial<Placement>) => {
    setPlacements(prev =>
      prev.map(p => (p.id === id ? { ...p, ...plcData, updatedAt: new Date().toISOString() } : p))
    );
    logAudit('UPDATE', 'Placement', id, `Updated placement ${id}`);
  };

  const deletePlacement = (id: string) => {
    setPlacements(prev => prev.map(p => p.id === id ? { ...p, status: 'Terminated', updatedAt: new Date().toISOString() } : p));
    logAudit('DELETE', 'Placement', id, `Terminated placement ${id}`);
  };

  // 5. Timesheets & Approval Engine
  const addTimesheet = (tsData: Omit<Timesheet, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>): Timesheet => {
    const id = `TS2026${String(config.numbering.nextNumbers.TS || 110).padStart(4, '0')}`;
    setConfig(prev => ({
      ...prev,
      numbering: {
        ...prev.numbering,
        nextNumbers: { ...prev.numbering.nextNumbers, TS: (prev.numbering.nextNumbers.TS || 110) + 1 }
      }
    }));
    const now = new Date().toISOString();

    const reg = tsData.dailyEntries.reduce((acc, d) => acc + (d.regularHours || 0), 0);
    const ot = tsData.dailyEntries.reduce((acc, d) => acc + (d.overtimeHours || 0), 0);
    const hol = tsData.dailyEntries.reduce((acc, d) => acc + (d.holidayHours || 0), 0);
    const total = reg + ot + hol;

    const newTs: Timesheet = {
      ...tsData,
      id,
      organizationId: config.id,
      regularHours: reg,
      overtimeHours: ot,
      holidayHours: hol,
      totalHours: total,
      createdAt: now,
      updatedAt: now,
      version: 1
    };
    setTimesheets(prev => [newTs, ...prev]);
    logAudit('CREATE', 'Timesheet', id, `Created timesheet ${id} for period ${newTs.periodStartDate} to ${newTs.periodEndDate}`);
    return newTs;
  };

  const updateTimesheet = (id: string, tsData: Partial<Timesheet>) => {
    setTimesheets(prev =>
      prev.map(t => {
        if (t.id !== id) return t;
        const updated = { ...t, ...tsData, updatedAt: new Date().toISOString() };
        if (tsData.dailyEntries) {
          const reg = updated.dailyEntries.reduce((acc, d) => acc + (d.regularHours || 0), 0);
          const ot = updated.dailyEntries.reduce((acc, d) => acc + (d.overtimeHours || 0), 0);
          const hol = updated.dailyEntries.reduce((acc, d) => acc + (d.holidayHours || 0), 0);
          updated.regularHours = reg;
          updated.overtimeHours = ot;
          updated.holidayHours = hol;
          updated.totalHours = reg + ot + hol;
        }
        return updated;
      })
    );
    logAudit('UPDATE', 'Timesheet', id, `Updated timesheet ${id}`);
  };

  const submitTimesheet = (id: string) => {
    const now = new Date().toISOString();
    setTimesheets(prev =>
      prev.map(t =>
        t.id === id ? { ...t, status: 'Submitted', submittedAt: now, updatedAt: now } : t
      )
    );
    logAudit('UPDATE', 'Timesheet', id, `Submitted timesheet ${id} for operational review`, 'Draft', 'Submitted');
  };

  // CORE SPECIFICATION: Approving a timesheet generates Income & AP!
  const approveTimesheet = (id: string, approverName: string) => {
    const ts = timesheets.find(t => t.id === id);
    if (!ts) return;

    const placement = placements.find(p => p.id === ts.placementId);
    if (!placement) return;

    const now = new Date().toISOString();
    const billingRate = placement.billingRate;
    const otBillingRate = placement.overtimeBillingRate || billingRate * 1.5;
    const payRate = placement.payRate;
    const otPayRate = placement.overtimePayRate || payRate * 1.5;

    // Income calculation
    const regularIncome = ts.regularHours * billingRate;
    const overtimeIncome = ts.overtimeHours * otBillingRate;
    const holidayIncome = ts.holidayHours * billingRate;
    const totalIncome = regularIncome + overtimeIncome + holidayIncome;

    // AP Bill calculation
    const regularPay = ts.regularHours * payRate;
    const overtimePay = ts.overtimeHours * otPayRate;
    const holidayPay = ts.holidayHours * payRate;
    const totalPayable = regularPay + overtimePay + holidayPay;

    // Generate IDs
    const incomeId = `INC2026${String(config.numbering.nextNumbers.INC || 108).padStart(4, '0')}`;
    const billId = `BIL2026${String(config.numbering.nextNumbers.BIL || 108).padStart(4, '0')}`;

    setConfig(prev => ({
      ...prev,
      numbering: {
        ...prev.numbering,
        nextNumbers: {
          ...prev.numbering.nextNumbers,
          INC: (prev.numbering.nextNumbers.INC || 108) + 1,
          BIL: (prev.numbering.nextNumbers.BIL || 108) + 1
        }
      }
    }));

    // 1. Create Income Record
    const newIncome: IncomeRecord = {
      id: incomeId,
      organizationId: config.id,
      sourceType: 'Timesheet',
      sourceId: ts.id,
      employeeId: ts.employeeId,
      clientId: ts.clientId,
      placementId: ts.placementId,
      timesheetId: ts.id,
      periodStartDate: ts.periodStartDate,
      periodEndDate: ts.periodEndDate,
      regularHours: ts.regularHours,
      overtimeHours: ts.overtimeHours,
      holidayHours: ts.holidayHours,
      billingRate,
      overtimeBillingRate: otBillingRate,
      totalIncome,
      status: 'Unbilled',
      createdAt: now,
      updatedAt: now,
      version: 1
    };

    // 2. Create AP Bill
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // Due next payroll week
    const newBill: APBill = {
      id: billId,
      organizationId: config.id,
      sourceType: 'Timesheet',
      sourceId: ts.id,
      timesheetId: ts.id,
      employeeId: ts.employeeId,
      placementId: ts.placementId,
      periodStartDate: ts.periodStartDate,
      periodEndDate: ts.periodEndDate,
      regularHours: ts.regularHours,
      regularRate: payRate,
      regularAmount: regularPay,
      overtimeHours: ts.overtimeHours,
      overtimeRate: otPayRate,
      overtimeAmount: overtimePay,
      holidayHours: ts.holidayHours,
      holidayAmount: holidayPay,
      totalPayable,
      amountPaid: 0,
      balance: totalPayable,
      dueDate: dueDate.toISOString().split('T')[0],
      status: 'Unpaid',
      createdAt: now,
      updatedAt: now,
      version: 1
    };

    // 3. Update Timesheet
    setTimesheets(prev =>
      prev.map(t =>
        t.id === id
          ? {
              ...t,
              status: 'Approved',
              approvedBy: approverName || 'Staffing Approver',
              approvalDate: now,
              incomeId,
              billId,
              updatedAt: now
            }
          : t
      )
    );

    // Save income and bills
    setIncomes(prev => [newIncome, ...prev]);
    setApBills(prev => [newBill, ...prev]);

    // 4. Record in Transaction Ledger
    const incomeTxn: TransactionLedgerEntry = {
      id: `TXN-${Date.now()}-1`,
      organizationId: config.id,
      transactionType: 'Income Accrual',
      sourceType: 'Timesheet',
      sourceId: ts.id,
      date: now.split('T')[0],
      debit: totalIncome,
      credit: 0,
      account: '1200 - Unbilled Accounts Receivable',
      currency: config.currency,
      description: `Income accrued from Approved Timesheet ${ts.id} (${ts.totalHours} hrs @ placement ${placement.id})`,
      createdAt: now
    };

    const apTxn: TransactionLedgerEntry = {
      id: `TXN-${Date.now()}-2`,
      organizationId: config.id,
      transactionType: 'AP Accrual',
      sourceType: 'Timesheet',
      sourceId: ts.id,
      date: now.split('T')[0],
      debit: 0,
      credit: totalPayable,
      account: '2100 - Accounts Payable (Worker Obligation)',
      currency: config.currency,
      description: `Worker compensation accrued from Approved Timesheet ${ts.id} ($${totalPayable.toFixed(2)})`,
      createdAt: now
    };

    setTransactions(prev => [incomeTxn, apTxn, ...prev]);

    // 5. Audit log
    logAudit(
      'APPROVE',
      'Timesheet',
      id,
      `Approved timesheet ${id} by ${approverName}. Generated Income ${incomeId} ($${totalIncome.toFixed(2)}) and AP Bill ${billId} ($${totalPayable.toFixed(2)})`,
      'Submitted',
      'Approved'
    );

    return { income: newIncome, apBill: newBill };
  };

  const rejectTimesheet = (id: string, reason: string) => {
    const now = new Date().toISOString();
    setTimesheets(prev =>
      prev.map(t =>
        t.id === id
          ? { ...t, status: 'Rejected', rejectionReason: reason, updatedAt: now }
          : t
      )
    );
    logAudit('REJECT', 'Timesheet', id, `Rejected timesheet ${id}: "${reason}"`, 'Submitted', 'Rejected');
  };

  const deleteTimesheet = (id: string) => {
    setTimesheets(prev => prev.filter(t => t.id !== id));
    logAudit('DELETE', 'Timesheet', id, `Deleted timesheet ${id}`);
  };

  // 6. Invoicing from Income
  const generateInvoiceFromIncome = (
    incomeIds: string[],
    invoiceDate: string,
    dueDate: string,
    notes?: string
  ): Invoice[] => {
    const selected = incomes.filter(inc => incomeIds.includes(inc.id) && inc.status === 'Unbilled');
    if (selected.length === 0) return [];

    // Group by client
    const byClient: Record<string, IncomeRecord[]> = {};
    selected.forEach(inc => {
      if (!byClient[inc.clientId]) byClient[inc.clientId] = [];
      byClient[inc.clientId].push(inc);
    });

    const now = new Date().toISOString();
    const generatedInvoices: Invoice[] = [];

    Object.entries(byClient).forEach(([clientId, clientIncomes]) => {
      const invNum = `INV-2026-${String(config.numbering.nextNumbers.INV || 106).padStart(4, '0')}`;
      const invId = `INV2026${String(config.numbering.nextNumbers.INV || 106).padStart(4, '0')}`;

      setConfig(prev => ({
        ...prev,
        numbering: {
          ...prev.numbering,
          nextNumbers: { ...prev.numbering.nextNumbers, INV: (prev.numbering.nextNumbers.INV || 106) + 1 }
        }
      }));

      const client = clients.find(c => c.id === clientId);

      const lineItems = clientIncomes.map((inc, idx) => {
        const emp = employees.find(e => e.id === inc.employeeId);
        const empName = emp ? `${emp.firstName} ${emp.lastName}` : inc.employeeId;
        return {
          id: `L-${invId}-${idx + 1}`,
          incomeId: inc.id,
          description: `Professional Staffing Services (${empName}) - Period ${inc.periodStartDate} to ${inc.periodEndDate}`,
          quantity: inc.regularHours + inc.overtimeHours + inc.holidayHours,
          rate: inc.billingRate,
          amount: inc.totalIncome
        };
      });

      const subtotal = lineItems.reduce((acc, item) => acc + item.amount, 0);
      const tax = 0;
      const total = subtotal + tax;

      const newInv: Invoice = {
        id: invId,
        organizationId: config.id,
        clientId,
        invoiceNumber: invNum,
        invoiceDate,
        dueDate,
        lineItems,
        subtotal,
        tax,
        total,
        amountPaid: 0,
        balance: total,
        status: 'Open',
        paymentTerms: client?.paymentTerms || '30 days',
        notes: notes || 'Standard billing for operational hours.',
        createdAt: now,
        updatedAt: now,
        version: 1
      };

      generatedInvoices.push(newInv);

      // Ledger entry
      const ledgerEntry: TransactionLedgerEntry = {
        id: `TXN-${Date.now()}-${invId}`,
        organizationId: config.id,
        transactionType: 'Invoice Generation',
        sourceType: 'Invoice',
        sourceId: invId,
        date: invoiceDate,
        debit: total,
        credit: total,
        account: '1100 - Accounts Receivable / 4000 - Billed Revenue',
        currency: config.currency,
        description: `Generated Invoice ${invNum} for client ${client?.name || clientId} ($${total.toFixed(2)})`,
        createdAt: now
      };

      setTransactions(prev => [ledgerEntry, ...prev]);

      logAudit(
        'GENERATE_INVOICE',
        'Invoice',
        invId,
        `Generated Invoice ${invNum} with ${lineItems.length} lines totaling $${total.toFixed(2)}`
      );
    });

    // Update income records to Billed
    const processedIds = new Set(selected.map(s => s.id));
    setIncomes(prev =>
      prev.map(inc => {
        if (processedIds.has(inc.id)) {
          const matchedInv = generatedInvoices.find(inv => inv.clientId === inc.clientId);
          return {
            ...inc,
            status: 'Billed',
            invoiceId: matchedInv?.id,
            updatedAt: now
          };
        }
        return inc;
      })
    );

    setInvoices(prev => [...generatedInvoices, ...prev]);
    return generatedInvoices;
  };

  // 7. AR Payment
  const recordARPayment = (
    invoiceIdOrData: string | { invoiceId: string; amount: number; paymentDate: string; paymentMethod: any; referenceNumber?: string; notes?: string },
    amountArg?: number,
    paymentDateArg?: string,
    paymentMethodArg?: any,
    referenceNumberArg?: string,
    notesArg?: string
  ): ARPayment => {
    let invoiceId: string;
    let amount: number;
    let paymentDate: string;
    let paymentMethod: any;
    let referenceNumber: string | undefined;
    let notes: string | undefined;

    if (typeof invoiceIdOrData === 'object') {
      invoiceId = invoiceIdOrData.invoiceId;
      amount = invoiceIdOrData.amount;
      paymentDate = invoiceIdOrData.paymentDate;
      paymentMethod = invoiceIdOrData.paymentMethod;
      referenceNumber = invoiceIdOrData.referenceNumber;
      notes = invoiceIdOrData.notes;
    } else {
      invoiceId = invoiceIdOrData;
      amount = amountArg!;
      paymentDate = paymentDateArg!;
      paymentMethod = paymentMethodArg!;
      referenceNumber = referenceNumberArg;
      notes = notesArg;
    }

    const inv = invoices.find(i => i.id === invoiceId);
    if (!inv) throw new Error('Invoice not found');

    const paymentId = `PAY2026${String(config.numbering.nextNumbers.PAY || 105).padStart(4, '0')}`;
    setConfig(prev => ({
      ...prev,
      numbering: {
        ...prev.numbering,
        nextNumbers: { ...prev.numbering.nextNumbers, PAY: (prev.numbering.nextNumbers.PAY || 105) + 1 }
      }
    }));

    const now = new Date().toISOString();
    const newPaid = inv.amountPaid + amount;
    const newBalance = Math.max(0, inv.total - newPaid);
    const newStatus: Invoice['status'] = newBalance <= 0.01 ? 'Paid' : 'Partially Paid';

    const newPayment: ARPayment = {
      id: paymentId,
      organizationId: config.id,
      invoiceId,
      clientId: inv.clientId,
      paymentDate,
      amount,
      paymentMethod,
      referenceNumber,
      status: 'Completed',
      notes,
      createdAt: now,
      updatedAt: now
    };

    // Update invoice
    setInvoices(prev =>
      prev.map(i =>
        i.id === invoiceId
          ? {
              ...i,
              amountPaid: newPaid,
              balance: newBalance,
              status: newStatus,
              updatedAt: now
            }
          : i
      )
    );

    setArPayments(prev => [newPayment, ...prev]);

    // Ledger entry
    const txn: TransactionLedgerEntry = {
      id: `TXN-${Date.now()}-${paymentId}`,
      organizationId: config.id,
      transactionType: 'AR Payment',
      sourceType: 'Payment',
      sourceId: paymentId,
      date: paymentDate,
      debit: amount,
      credit: amount,
      account: '1010 - Operating Cash / 1100 - Accounts Receivable',
      currency: config.currency,
      description: `Client remittance received (${paymentMethod} ${referenceNumber || ''}) for ${inv.invoiceNumber}`,
      createdAt: now
    };
    setTransactions(prev => [txn, ...prev]);

    logAudit(
      'RECORD_PAYMENT',
      'ARPayment',
      paymentId,
      `Recorded AR payment of $${amount.toFixed(2)} on invoice ${inv.invoiceNumber}. New balance: $${newBalance.toFixed(2)}`,
      `Balance $${inv.balance.toFixed(2)} (${inv.status})`,
      `Balance $${newBalance.toFixed(2)} (${newStatus})`
    );

    return newPayment;
  };

  // 8. AP Payment
  const recordAPPayment = (
    billIdOrData: string | { apBillId?: string; billId?: string; amount: number; paymentDate: string; paymentMethod: any; referenceNumber?: string; notes?: string },
    amountArg?: number,
    paymentDateArg?: string,
    paymentMethodArg?: any,
    referenceNumberArg?: string,
    notesArg?: string
  ): APPayment => {
    let billId: string;
    let amount: number;
    let paymentDate: string;
    let paymentMethod: any;
    let referenceNumber: string | undefined;
    let notes: string | undefined;

    if (typeof billIdOrData === 'object') {
      billId = billIdOrData.billId || billIdOrData.apBillId || '';
      amount = billIdOrData.amount;
      paymentDate = billIdOrData.paymentDate;
      paymentMethod = billIdOrData.paymentMethod;
      referenceNumber = billIdOrData.referenceNumber;
      notes = billIdOrData.notes;
    } else {
      billId = billIdOrData;
      amount = amountArg!;
      paymentDate = paymentDateArg!;
      paymentMethod = paymentMethodArg!;
      referenceNumber = referenceNumberArg;
      notes = notesArg;
    }

    const bill = apBills.find(b => b.id === billId);
    if (!bill) throw new Error('AP Bill not found');

    const paymentId = `APPAY2026${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString();
    const newPaid = bill.amountPaid + amount;
    const newBalance = Math.max(0, bill.totalPayable - newPaid);
    const newStatus: APBill['status'] = newBalance <= 0.01 ? 'Paid' : 'Partially Paid';

    const newPayment: APPayment = {
      id: paymentId,
      organizationId: config.id,
      billId,
      employeeId: bill.employeeId,
      paymentDate,
      amount,
      paymentMethod,
      referenceNumber,
      status: 'Completed',
      notes,
      createdAt: now,
      updatedAt: now
    };

    setApBills(prev =>
      prev.map(b =>
        b.id === billId
          ? {
              ...b,
              amountPaid: newPaid,
              balance: newBalance,
              status: newStatus,
              updatedAt: now
            }
          : b
      )
    );

    setApPayments(prev => [newPayment, ...prev]);

    // Ledger entry
    const txn: TransactionLedgerEntry = {
      id: `TXN-${Date.now()}-${paymentId}`,
      organizationId: config.id,
      transactionType: 'AP Payment',
      sourceType: 'Bill',
      sourceId: paymentId,
      date: paymentDate,
      debit: amount,
      credit: amount,
      account: '2100 - Accounts Payable / 1010 - Cash',
      currency: config.currency,
      description: `Disbursed AP Payment (${paymentMethod} ${referenceNumber || ''}) for Bill ${bill.id}`,
      createdAt: now
    };
    setTransactions(prev => [txn, ...prev]);

    logAudit(
      'RECORD_PAYMENT',
      'APPayment',
      paymentId,
      `Disbursed AP payment of $${amount.toFixed(2)} for Bill ${bill.id}. New balance: $${newBalance.toFixed(2)}`
    );

    return newPayment;
  };

  // 9. CSV Import Processing
  const processCSVImport = (
    fileType: ImportFileType,
    csvContent: string,
    fileName: string
  ): ImportBatch => {
    const parsed = parseCSV(csvContent);
    const validation = validateCSVRows(fileType, parsed.rows, {
      existingEmployees: employees,
      existingClients: clients,
      existingJobs: jobs,
      existingPlacements: placements,
      existingInvoices: invoices
    });

    const now = new Date().toISOString();
    const batchId = `IMP-2026-${Date.now().toString().slice(-4)}`;
    const status: ImportBatch['status'] =
      validation.errors.length === 0
        ? 'Completed'
        : validation.validRecords.length > 0
        ? 'Completed with Errors'
        : 'Failed';

    const batch: ImportBatch = {
      id: batchId,
      fileName,
      fileType,
      receivedDate: now,
      recordsRead: validation.recordsRead,
      recordsImported: validation.validRecords.length,
      recordsRejected: validation.rejectedRecords.length,
      status,
      errors: validation.errors,
      rawContent: csvContent
    };

    // Apply valid records to the database
    if (validation.validRecords.length > 0) {
      switch (fileType) {
        case 'employees': {
          const newEmps: Employee[] = validation.validRecords.map(r => ({
            id: r.employee_id || r.id,
            organizationId: config.id,
            employeeType: (r.employee_type?.toUpperCase() as any) || 'W2',
            firstName: r.first_name || '',
            lastName: r.last_name || '',
            email: r.email || '',
            phone: r.phone || '',
            status: (r.status as any) || 'Active',
            hireDate: r.hire_date || now.split('T')[0],
            department: r.department || 'General',
            createdAt: now,
            updatedAt: now,
            version: 1
          }));
          setEmployees(prev => [...newEmps, ...prev]);
          break;
        }
        case 'clients': {
          const newClis: Client[] = validation.validRecords.map(r => ({
            id: r.client_id || r.id,
            organizationId: config.id,
            name: r.name || r.client_name || '',
            status: (r.status as any) || 'Active',
            paymentTerms: r.payment_terms || '30 days',
            contacts: [
              {
                id: `CON-${Date.now()}`,
                name: r.contact_name || '',
                email: r.contact_email || '',
                phone: r.phone || '',
                isPrimary: true
              }
            ],
            primaryContactName: r.contact_name || '',
            primaryContactEmail: r.contact_email || '',
            industry: r.industry || 'General',
            createdAt: now,
            updatedAt: now,
            version: 1
          }));
          setClients(prev => [...newClis, ...prev]);
          break;
        }
        case 'placements': {
          const newPlcs: Placement[] = validation.validRecords.map(r => ({
            id: r.placement_id || r.id,
            organizationId: config.id,
            employeeId: r.employee_id,
            clientId: r.client_id,
            jobId: r.job_id || '',
            startDate: r.start_date || now.split('T')[0],
            endDate: r.end_date || '',
            billingRate: parseFloat(r.billing_rate || '0'),
            payRate: parseFloat(r.pay_rate || '0'),
            billingUnit: (r.billing_unit as any) || 'Hour',
            payUnit: (r.pay_unit as any) || 'Hour',
            status: (r.status as any) || 'Active',
            createdAt: now,
            updatedAt: now,
            version: 1
          }));
          setPlacements(prev => [...newPlcs, ...prev]);
          break;
        }
        case 'payments': {
          validation.validRecords.forEach(r => {
            const invId = r.invoice_id;
            const amt = parseFloat(r.amount);
            if (invId && amt > 0) {
              recordARPayment(invId, amt, r.payment_date || now.split('T')[0], (r.payment_method as any) || 'ACH', r.reference_number);
            }
          });
          break;
        }
      }
    }

    setImportBatches(prev => [batch, ...prev]);
    logAudit(
      'IMPORT',
      'ImportBatch',
      batchId,
      `Imported ${validation.validRecords.length}/${validation.recordsRead} records from "${fileName}" (${fileType})`
    );

    return batch;
  };

  // 10. Traceability Explorer Lineage Resolver
  const getTraceabilityLineage = (sourceTypeOrId: string, maybeSourceId?: string): TraceabilityLineage => {
    let sourceType = sourceTypeOrId;
    let sourceId = maybeSourceId;

    if (!sourceId) {
      sourceId = sourceTypeOrId;
      if (timesheets.some(t => t.id === sourceId)) sourceType = 'Timesheet';
      else if (invoices.some(i => i.id === sourceId)) sourceType = 'Invoice';
      else if (incomes.some(i => i.id === sourceId)) sourceType = 'Income';
      else if (apBills.some(b => b.id === sourceId)) sourceType = 'Bill';
      else if (placements.some(p => p.id === sourceId)) sourceType = 'Placement';
      else if (employees.some(e => e.id === sourceId)) sourceType = 'Employee';
      else if (clients.some(c => c.id === sourceId)) sourceType = 'Client';
      else if (jobs.some(j => j.id === sourceId)) sourceType = 'Job';
      else sourceType = 'Timesheet';
    }

    let emp: Employee | undefined;
    let cli: Client | undefined;
    let job: Job | undefined;
    let plc: Placement | undefined;
    let ts: Timesheet | undefined;
    let inc: IncomeRecord | undefined;
    let inv: Invoice | undefined;
    let bill: APBill | undefined;

    // Direct lookup by entity type
    if (sourceType === 'Timesheet') {
      ts = timesheets.find(t => t.id === sourceId);
    } else if (sourceType === 'Invoice') {
      inv = invoices.find(i => i.id === sourceId);
      const incLine = inv?.lineItems.find(l => l.incomeId);
      if (incLine?.incomeId) {
        inc = incomes.find(i => i.id === incLine.incomeId);
      }
    } else if (sourceType === 'Income') {
      inc = incomes.find(i => i.id === sourceId);
    } else if (sourceType === 'Bill') {
      bill = apBills.find(b => b.id === sourceId);
    } else if (sourceType === 'Placement') {
      plc = placements.find(p => p.id === sourceId);
    } else if (sourceType === 'Employee') {
      emp = employees.find(e => e.id === sourceId);
    } else if (sourceType === 'Client') {
      cli = clients.find(c => c.id === sourceId);
    }

    // Trace from income or timesheet if found
    if (!ts && inc) {
      ts = timesheets.find(t => t.id === inc?.timesheetId);
    }
    if (!ts && bill) {
      ts = timesheets.find(t => t.id === bill?.timesheetId);
    }

    if (ts) {
      plc = placements.find(p => p.id === ts.placementId);
      emp = employees.find(e => e.id === ts.employeeId);
      cli = clients.find(c => c.id === ts.clientId);
      job = jobs.find(j => j.id === ts.jobId);
      inc = incomes.find(i => i.timesheetId === ts?.id);
      bill = apBills.find(b => b.timesheetId === ts?.id);
    }

    if (plc && !emp) emp = employees.find(e => e.id === plc?.employeeId);
    if (plc && !cli) cli = clients.find(c => c.id === plc?.clientId);
    if (plc && !job) job = jobs.find(j => j.id === plc?.jobId);

    if (inc && !inv && inc.invoiceId) {
      inv = invoices.find(i => i.id === inc?.invoiceId);
    }

    const linkedArPayments = inv ? arPayments.filter(p => p.invoiceId === inv?.id) : [];
    const linkedApPayments = bill ? apPayments.filter(p => p.billId === bill?.id) : [];

    const relevantSourceIds = new Set(
      [ts?.id, inc?.id, inv?.id, bill?.id, plc?.id, emp?.id, cli?.id].filter(Boolean) as string[]
    );

    const linkedTxns = transactions.filter(t => relevantSourceIds.has(t.sourceId));
    const linkedAudits = auditLogs.filter(a => relevantSourceIds.has(a.entityId));

    return {
      employee: emp,
      client: cli,
      job,
      placement: plc,
      timesheet: ts,
      income: inc,
      invoice: inv,
      arPayments: linkedArPayments,
      apBill: bill,
      apPayments: linkedApPayments,
      transactions: linkedTxns,
      ledgerEntries: linkedTxns,
      auditLogs: linkedAudits
    };
  };

  // Reset to initial realistic demo data
  const resetToInitialData = () => {
    localStorage.clear();
    setEmployees(INITIAL_EMPLOYEES);
    setClients(INITIAL_CLIENTS);
    setJobs(INITIAL_JOBS);
    setPlacements(INITIAL_PLACEMENTS);
    setTimesheets(INITIAL_TIMESHEETS);
    setIncomes(INITIAL_INCOME);
    setInvoices(INITIAL_INVOICES);
    setArPayments(INITIAL_AR_PAYMENTS);
    setApBills(INITIAL_AP_BILLS);
    setApPayments(INITIAL_AP_PAYMENTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setImportBatches(INITIAL_IMPORT_BATCHES);
    setConfig(INITIAL_CONFIG);
  };

  // Export full JSON structure representing Phase-1 filesystem
  const exportSystemDataJSON = (): string => {
    const backup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      organization: config,
      '/staffing-data/master': {
        employees,
        clients,
        jobs,
        placements
      },
      '/staffing-data/timesheets': timesheets,
      '/staffing-data/income': incomes,
      '/staffing-data/ar': {
        invoices,
        payments: arPayments
      },
      '/staffing-data/ap': {
        bills: apBills,
        payments: apPayments
      },
      '/staffing-data/ledger': transactions,
      '/staffing-data/audit': auditLogs,
      '/staffing-data/imports': importBatches
    };
    return JSON.stringify(backup, null, 2);
  };

  const importSystemDataJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data['/staffing-data/master']) {
        setEmployees(data['/staffing-data/master'].employees || []);
        setClients(data['/staffing-data/master'].clients || []);
        setJobs(data['/staffing-data/master'].jobs || []);
        setPlacements(data['/staffing-data/master'].placements || []);
      }
      if (data['/staffing-data/timesheets']) setTimesheets(data['/staffing-data/timesheets']);
      if (data['/staffing-data/income']) setIncomes(data['/staffing-data/income']);
      if (data['/staffing-data/ar']) {
        setInvoices(data['/staffing-data/ar'].invoices || []);
        setArPayments(data['/staffing-data/ar'].payments || []);
      }
      if (data['/staffing-data/ap']) {
        setApBills(data['/staffing-data/ap'].bills || []);
        setApPayments(data['/staffing-data/ap'].payments || []);
      }
      if (data['/staffing-data/ledger']) setTransactions(data['/staffing-data/ledger']);
      if (data['/staffing-data/audit']) setAuditLogs(data['/staffing-data/audit']);
      if (data['/staffing-data/imports']) setImportBatches(data['/staffing-data/imports']);
      if (data.organization) setConfig(data.organization);
      return true;
    } catch {
      return false;
    }
  };

  const updateConfig = (newCfg: Partial<OrganizationConfig>) => {
    setConfig(prev => ({ ...prev, ...newCfg }));
  };

  return (
    <StaffingContext.Provider
      value={{
        employees,
        clients,
        jobs,
        placements,
        timesheets,
        incomes,
        invoices,
        arPayments,
        apBills,
        apPayments,
        transactions,
        ledger: transactions,
        auditLogs,
        importBatches,
        config,

        addEmployee,
        updateEmployee,
        deleteEmployee,

        addClient,
        updateClient,
        deleteClient,

        addJob,
        updateJob,
        deleteJob,

        addPlacement,
        updatePlacement,
        deletePlacement,

        addTimesheet,
        updateTimesheet,
        submitTimesheet,
        approveTimesheet,
        rejectTimesheet,
        deleteTimesheet,

        generateInvoiceFromIncome,
        recordARPayment,
        recordAPPayment,

        processCSVImport,
        getTraceabilityLineage,
        resetToInitialData,
        resetDatabaseToDefaults: resetToInitialData,
        exportSystemDataJSON,
        exportFullDatabaseJSON: exportSystemDataJSON,
        importSystemDataJSON,
        updateConfig
      }}
    >
      {children}
    </StaffingContext.Provider>
  );
};

export const useStaffing = () => {
  const context = useContext(StaffingContext);
  if (!context) {
    throw new Error('useStaffing must be used within a StaffingProvider');
  }
  return context;
};
