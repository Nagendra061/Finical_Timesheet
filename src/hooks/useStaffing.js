/**
 * useStaffing
 *
 * Primary application custom hook connecting React components to the Redux store
 * and the Service Layer.
 *
 * Architecture:
 * React Components -> useStaffing -> Redux Store / Services -> JSON Data Layer
 *
 * Preserves 100% backward compatibility with all views, layout components, and modals
 * while routing all state through Redux slices and all persistence through the service layer.
 */

import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';

// Slice actions
import {
  setEmployees,
  addEmployee as addEmployeeAction,
  updateEmployee as updateEmployeeAction,
  deleteEmployee as deleteEmployeeAction,
  selectAllEmployees
} from '../store/slices/employeesSlice';

import {
  setClients,
  addClient as addClientAction,
  updateClient as updateClientAction,
  deleteClient as deleteClientAction,
  selectAllClients
} from '../store/slices/clientsSlice';

import {
  setJobs,
  addJob as addJobAction,
  updateJob as updateJobAction,
  deleteJob as deleteJobAction,
  selectAllJobs
} from '../store/slices/jobsSlice';

import {
  setPlacements,
  addPlacement as addPlacementAction,
  updatePlacement as updatePlacementAction,
  deletePlacement as deletePlacementAction,
  selectAllPlacements
} from '../store/slices/placementsSlice';

import {
  setTimesheets,
  addTimesheet as addTimesheetAction,
  updateTimesheet as updateTimesheetAction,
  deleteTimesheet as deleteTimesheetAction,
  selectAllTimesheets
} from '../store/slices/timesheetsSlice';

import {
  setIncomes,
  addIncome as addIncomeAction,
  updateIncome as updateIncomeAction,
  selectAllIncomes
} from '../store/slices/incomeSlice';

import {
  setInvoices,
  addInvoices as addInvoicesAction,
  updateInvoice as updateInvoiceAction,
  selectAllInvoices
} from '../store/slices/invoicesSlice';

import {
  setArPayments,
  addArPayment as addArPaymentAction,
  selectAllArPayments
} from '../store/slices/arSlice';

import {
  setApBills,
  addApBill as addApBillAction,
  updateApBill as updateApBillAction,
  setApPayments,
  addApPayment as addApPaymentAction,
  selectAllApBills,
  selectAllApPayments
} from '../store/slices/apSlice';

import {
  setTransactions,
  addTransactions as addTransactionsAction,
  selectAllLedgerEntries
} from '../store/slices/ledgerSlice';

import {
  setAuditLogs,
  addAuditLog as addAuditLogAction,
  selectAllAuditLogs
} from '../store/slices/auditLogsSlice';

import {
  setImportBatches,
  addImportBatch as addImportBatchAction,
  selectAllImportBatches
} from '../store/slices/importsSlice';

import {
  setConfig,
  updateConfig as updateConfigAction,
  incrementNextNumber,
  selectConfig
} from '../store/slices/configSlice';

// Services
import { employeeService } from '../services/employeeService';
import { clientService } from '../services/clientService';
import { jobService } from '../services/jobService';
import { placementService } from '../services/placementService';
import { timesheetService } from '../services/timesheetService';
import { incomeService } from '../services/incomeService';
import { invoiceService } from '../services/invoiceService';
import { arService } from '../services/arService';
import { apService } from '../services/apService';
import { ledgerService } from '../services/ledgerService';
import { auditService } from '../services/auditService';
import { importService } from '../services/importService';
import { configService } from '../services/configService';
import {
  resetStorageToDefaults,
  exportFullBackupJSON,
  importFullBackupJSON
} from '../services/apiClient';

import { generateNextId } from '../utils/idGenerator';
import { parseCSV, validateCSVRows } from '../utils/csvHelper';

export function useStaffing() {
  const dispatch = useDispatch();

  // Selectors
  const employees = useSelector(selectAllEmployees);
  const clients = useSelector(selectAllClients);
  const jobs = useSelector(selectAllJobs);
  const placements = useSelector(selectAllPlacements);
  const timesheets = useSelector(selectAllTimesheets);
  const incomes = useSelector(selectAllIncomes);
  const invoices = useSelector(selectAllInvoices);
  const arPayments = useSelector(selectAllArPayments);
  const apBills = useSelector(selectAllApBills);
  const apPayments = useSelector(selectAllApPayments);
  const transactions = useSelector(selectAllLedgerEntries);
  const auditLogs = useSelector(selectAllAuditLogs);
  const importBatches = useSelector(selectAllImportBatches);
  const config = useSelector(selectConfig);

  // Helper to log an audit entry
  const logAudit = useCallback((action, entity, entityId, details = '', prevVal = '', newVal = '') => {
    auditService.log(action, entity, entityId, details, prevVal, newVal).then(newLog => {
      dispatch(addAuditLogAction(newLog));
    });
  }, [dispatch]);

  // EMPLOYEES CRUD
  const addEmployee = useCallback((empData) => {
    const nextNum = config?.numbering?.nextNumbers?.EMP || 132;
    const newId = generateNextId('EMP', { EMP: nextNum });
    dispatch(incrementNextNumber('EMP'));
    configService.incrementNextNumber('EMP');

    const newEmp = {
      ...empData,
      id: newId,
      organizationId: config.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1
    };

    employeeService.create(newEmp);
    dispatch(addEmployeeAction(newEmp));
    logAudit('CREATE', 'Employee', newId, `Added employee ${newEmp.firstName} ${newEmp.lastName} (${newEmp.employeeType})`);
    return newEmp;
  }, [config, dispatch, logAudit]);

  const updateEmployee = useCallback((id, empData) => {
    employeeService.update(id, empData);
    dispatch(updateEmployeeAction({ id, ...empData, updatedAt: new Date().toISOString() }));
    logAudit('UPDATE', 'Employee', id, `Updated employee ${id}`);
  }, [dispatch, logAudit]);

  const deleteEmployee = useCallback((id) => {
    employeeService.delete(id);
    dispatch(deleteEmployeeAction(id));
    logAudit('DELETE', 'Employee', id, `Deleted employee ${id}`);
  }, [dispatch, logAudit]);

  // CLIENTS CRUD
  const addClient = useCallback((cliData) => {
    const nextNum = config?.numbering?.nextNumbers?.CLI || 125;
    const newId = generateNextId('CLI', { CLI: nextNum });
    dispatch(incrementNextNumber('CLI'));
    configService.incrementNextNumber('CLI');

    const newCli = {
      ...cliData,
      id: newId,
      organizationId: config.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1
    };

    clientService.create(newCli);
    dispatch(addClientAction(newCli));
    logAudit('CREATE', 'Client', newId, `Added client ${newCli.name}`);
    return newCli;
  }, [config, dispatch, logAudit]);

  const updateClient = useCallback((id, cliData) => {
    clientService.update(id, cliData);
    dispatch(updateClientAction({ id, ...cliData, updatedAt: new Date().toISOString() }));
    logAudit('UPDATE', 'Client', id, `Updated client ${id}`);
  }, [dispatch, logAudit]);

  const deleteClient = useCallback((id) => {
    clientService.delete(id);
    dispatch(deleteClientAction(id));
    logAudit('DELETE', 'Client', id, `Deleted client ${id}`);
  }, [dispatch, logAudit]);

  // JOBS CRUD
  const addJob = useCallback((jobData) => {
    const nextNum = config?.numbering?.nextNumbers?.JOB || 52;
    const newId = generateNextId('JOB', { JOB: nextNum });
    dispatch(incrementNextNumber('JOB'));
    configService.incrementNextNumber('JOB');

    const newJob = {
      ...jobData,
      id: newId,
      organizationId: config.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1
    };

    jobService.create(newJob);
    dispatch(addJobAction(newJob));
    logAudit('CREATE', 'Job', newId, `Added job ${newJob.title}`);
    return newJob;
  }, [config, dispatch, logAudit]);

  const updateJob = useCallback((id, jobData) => {
    jobService.update(id, jobData);
    dispatch(updateJobAction({ id, ...jobData, updatedAt: new Date().toISOString() }));
    logAudit('UPDATE', 'Job', id, `Updated job ${id}`);
  }, [dispatch, logAudit]);

  const deleteJob = useCallback((id) => {
    jobService.delete(id);
    dispatch(deleteJobAction(id));
    logAudit('DELETE', 'Job', id, `Deleted job ${id}`);
  }, [dispatch, logAudit]);

  // PLACEMENTS CRUD
  const addPlacement = useCallback((plcData) => {
    const nextNum = config?.numbering?.nextNumbers?.PLC || 130;
    const newId = generateNextId('PLC', { PLC: nextNum });
    dispatch(incrementNextNumber('PLC'));
    configService.incrementNextNumber('PLC');

    const newPlc = {
      ...plcData,
      id: newId,
      organizationId: config.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1
    };

    placementService.create(newPlc);
    dispatch(addPlacementAction(newPlc));
    logAudit('CREATE', 'Placement', newId, `Created placement ${newId} (Rate $${newPlc.billingRate}/hr, Pay $${newPlc.payRate}/hr)`);
    return newPlc;
  }, [config, dispatch, logAudit]);

  const updatePlacement = useCallback((id, plcData) => {
    placementService.update(id, plcData);
    dispatch(updatePlacementAction({ id, ...plcData, updatedAt: new Date().toISOString() }));
    logAudit('UPDATE', 'Placement', id, `Updated placement ${id}`);
  }, [dispatch, logAudit]);

  const deletePlacement = useCallback((id) => {
    placementService.delete(id);
    dispatch(deletePlacementAction(id));
    logAudit('DELETE', 'Placement', id, `Deleted placement ${id}`);
  }, [dispatch, logAudit]);

  // TIMESHEETS CRUD & APPROVAL WORKFLOW
  const addTimesheet = useCallback((tsData) => {
    const nextNum = config?.numbering?.nextNumbers?.TS || 110;
    const newId = generateNextId('TS', { TS: nextNum });
    dispatch(incrementNextNumber('TS'));
    configService.incrementNextNumber('TS');

    const newTs = {
      ...tsData,
      id: newId,
      organizationId: config.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1
    };

    timesheetService.create(newTs);
    dispatch(addTimesheetAction(newTs));
    logAudit('CREATE', 'Timesheet', newId, `Created timesheet ${newId} for ${newTs.totalHours} hrs`);
    return newTs;
  }, [config, dispatch, logAudit]);

  const updateTimesheet = useCallback((id, tsData) => {
    timesheetService.update(id, tsData);
    dispatch(updateTimesheetAction({ id, ...tsData, updatedAt: new Date().toISOString() }));
    logAudit('UPDATE', 'Timesheet', id, `Updated timesheet ${id}`);
  }, [dispatch, logAudit]);

  const submitTimesheet = useCallback((id) => {
    timesheetService.submit(id);
    const now = new Date().toISOString();
    dispatch(updateTimesheetAction({ id, status: 'Submitted', submittedAt: now, updatedAt: now }));
    logAudit('UPDATE', 'Timesheet', id, `Submitted timesheet ${id} for approval`, 'Draft', 'Submitted');
  }, [dispatch, logAudit]);

  const approveTimesheet = useCallback((id, approverName) => {
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
    const regularIncome = (ts.regularHours || 0) * billingRate;
    const overtimeIncome = (ts.overtimeHours || 0) * otBillingRate;
    const holidayIncome = (ts.holidayHours || 0) * billingRate;
    const totalIncome = regularIncome + overtimeIncome + holidayIncome;

    // AP Bill calculation
    const regularPay = (ts.regularHours || 0) * payRate;
    const overtimePay = (ts.overtimeHours || 0) * otPayRate;
    const holidayPay = (ts.holidayHours || 0) * payRate;
    const totalPayable = regularPay + overtimePay + holidayPay;

    // Generate IDs
    const incNext = config?.numbering?.nextNumbers?.INC || 108;
    const bilNext = config?.numbering?.nextNumbers?.BIL || 108;
    const incomeId = generateNextId('INC', { INC: incNext });
    const billId = generateNextId('BIL', { BIL: bilNext });

    dispatch(incrementNextNumber('INC'));
    dispatch(incrementNextNumber('BIL'));
    configService.incrementNextNumber('INC');
    configService.incrementNextNumber('BIL');

    // 1. Create Income Record
    const newIncome = {
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
      regularHours: ts.regularHours || 0,
      overtimeHours: ts.overtimeHours || 0,
      holidayHours: ts.holidayHours || 0,
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
    dueDate.setDate(dueDate.getDate() + 7);
    const newBill = {
      id: billId,
      organizationId: config.id,
      sourceType: 'Timesheet',
      sourceId: ts.id,
      timesheetId: ts.id,
      employeeId: ts.employeeId,
      placementId: ts.placementId,
      periodStartDate: ts.periodStartDate,
      periodEndDate: ts.periodEndDate,
      regularHours: ts.regularHours || 0,
      regularRate: payRate,
      regularAmount: regularPay,
      overtimeHours: ts.overtimeHours || 0,
      overtimeRate: otPayRate,
      overtimeAmount: overtimePay,
      holidayHours: ts.holidayHours || 0,
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
    const updatedTs = {
      id,
      status: 'Approved',
      approvedBy: approverName || 'Staffing Approver',
      approvalDate: now,
      incomeId,
      billId,
      updatedAt: now
    };

    // 4. Ledger Entries
    const incomeTxn = {
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

    const apTxn = {
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

    // Persist via services
    timesheetService.update(id, updatedTs);
    incomeService.create(newIncome);
    apService.createBill(newBill);
    ledgerService.addEntries([incomeTxn, apTxn]);

    // Dispatch to Redux
    dispatch(updateTimesheetAction(updatedTs));
    dispatch(addIncomeAction(newIncome));
    dispatch(addApBillAction(newBill));
    dispatch(addTransactionsAction([incomeTxn, apTxn]));

    logAudit(
      'APPROVE',
      'Timesheet',
      id,
      `Approved timesheet ${id} by ${approverName}. Generated Income ${incomeId} ($${totalIncome.toFixed(2)}) and AP Bill ${billId} ($${totalPayable.toFixed(2)})`,
      'Submitted',
      'Approved'
    );

    return { income: newIncome, apBill: newBill };
  }, [timesheets, placements, config, dispatch, logAudit]);

  const rejectTimesheet = useCallback((id, reason) => {
    timesheetService.reject(id, reason);
    const now = new Date().toISOString();
    dispatch(updateTimesheetAction({ id, status: 'Rejected', rejectionReason: reason, updatedAt: now }));
    logAudit('REJECT', 'Timesheet', id, `Rejected timesheet ${id}: "${reason}"`, 'Submitted', 'Rejected');
  }, [dispatch, logAudit]);

  const deleteTimesheet = useCallback((id) => {
    timesheetService.delete(id);
    dispatch(deleteTimesheetAction(id));
    logAudit('DELETE', 'Timesheet', id, `Deleted timesheet ${id}`);
  }, [dispatch, logAudit]);

  // INVOICING FROM UNBILLED INCOME
  const generateInvoiceFromIncome = useCallback((incomeIds, invoiceDate, dueDate, notes) => {
    const selected = incomes.filter(inc => incomeIds.includes(inc.id) && inc.status === 'Unbilled');
    if (selected.length === 0) return [];

    const byClient = {};
    selected.forEach(inc => {
      if (!byClient[inc.clientId]) byClient[inc.clientId] = [];
      byClient[inc.clientId].push(inc);
    });

    const now = new Date().toISOString();
    const generatedInvoices = [];
    const newTxns = [];

    Object.entries(byClient).forEach(([clientId, clientIncomes]) => {
      const invNext = config?.numbering?.nextNumbers?.INV || 106;
      const invNum = generateNextId('INV', { INV: invNext });
      const invId = `INV2026${String(invNext).padStart(4, '0')}`;

      dispatch(incrementNextNumber('INV'));
      configService.incrementNextNumber('INV');

      const client = clients.find(c => c.id === clientId);

      const lineItems = clientIncomes.map((inc, idx) => {
        const emp = employees.find(e => e.id === inc.employeeId);
        const empName = emp ? `${emp.firstName} ${emp.lastName}` : inc.employeeId;
        return {
          id: `L-${invId}-${idx + 1}`,
          incomeId: inc.id,
          description: `Professional Staffing Services (${empName}) - Period ${inc.periodStartDate} to ${inc.periodEndDate}`,
          quantity: (inc.regularHours || 0) + (inc.overtimeHours || 0) + (inc.holidayHours || 0),
          rate: inc.billingRate,
          amount: inc.totalIncome
        };
      });

      const subtotal = lineItems.reduce((acc, item) => acc + item.amount, 0);
      const tax = 0;
      const total = subtotal + tax;

      const newInv = {
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
      invoiceService.create(newInv);

      const ledgerEntry = {
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
      newTxns.push(ledgerEntry);

      logAudit(
        'GENERATE_INVOICE',
        'Invoice',
        invId,
        `Generated Invoice ${invNum} with ${lineItems.length} lines totaling $${total.toFixed(2)}`
      );
    });

    // Update income records
    const processedIds = new Set(selected.map(s => s.id));
    selected.forEach(inc => {
      const matchedInv = generatedInvoices.find(inv => inv.clientId === inc.clientId);
      if (matchedInv) {
        incomeService.update(inc.id, { status: 'Billed', invoiceId: matchedInv.id, updatedAt: now });
        dispatch(updateIncomeAction({ id: inc.id, status: 'Billed', invoiceId: matchedInv.id, updatedAt: now }));
      }
    });

    dispatch(addInvoicesAction(generatedInvoices));
    dispatch(addTransactionsAction(newTxns));
    ledgerService.addEntries(newTxns);

    return generatedInvoices;
  }, [incomes, clients, employees, config, dispatch, logAudit]);

  // AR PAYMENT RECORDING
  const recordARPayment = useCallback((invoiceIdOrData, amountArg, paymentDateArg, paymentMethodArg, referenceNumberArg, notesArg) => {
    let invoiceId, amount, paymentDate, paymentMethod, referenceNumber, notes;

    if (typeof invoiceIdOrData === 'object') {
      invoiceId = invoiceIdOrData.invoiceId;
      amount = invoiceIdOrData.amount;
      paymentDate = invoiceIdOrData.paymentDate;
      paymentMethod = invoiceIdOrData.paymentMethod;
      referenceNumber = invoiceIdOrData.referenceNumber;
      notes = invoiceIdOrData.notes;
    } else {
      invoiceId = invoiceIdOrData;
      amount = amountArg;
      paymentDate = paymentDateArg;
      paymentMethod = paymentMethodArg;
      referenceNumber = referenceNumberArg;
      notes = notesArg;
    }

    const inv = invoices.find(i => i.id === invoiceId);
    if (!inv) throw new Error('Invoice not found');

    const payNext = config?.numbering?.nextNumbers?.PAY || 105;
    const paymentId = generateNextId('PAY', { PAY: payNext });
    dispatch(incrementNextNumber('PAY'));
    configService.incrementNextNumber('PAY');

    const now = new Date().toISOString();
    const newPaid = (inv.amountPaid || 0) + amount;
    const newBalance = Math.max(0, (inv.total || 0) - newPaid);
    const newStatus = newBalance <= 0.01 ? 'Paid' : 'Partially Paid';

    const newPayment = {
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
    invoiceService.update(invoiceId, { amountPaid: newPaid, balance: newBalance, status: newStatus });
    dispatch(updateInvoiceAction({ id: invoiceId, amountPaid: newPaid, balance: newBalance, status: newStatus }));

    // Record AR payment
    arService.recordPayment(newPayment);
    dispatch(addArPaymentAction(newPayment));

    // Ledger entry
    const txn = {
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
    ledgerService.addEntries(txn);
    dispatch(addTransactionsAction(txn));

    logAudit(
      'RECORD_PAYMENT',
      'ARPayment',
      paymentId,
      `Recorded AR payment of $${amount.toFixed(2)} on invoice ${inv.invoiceNumber}. New balance: $${newBalance.toFixed(2)}`,
      `Balance $${inv.balance.toFixed(2)} (${inv.status})`,
      `Balance $${newBalance.toFixed(2)} (${newStatus})`
    );

    return newPayment;
  }, [invoices, config, dispatch, logAudit]);

  // AP PAYMENT RECORDING
  const recordAPPayment = useCallback((billIdOrData, amountArg, paymentDateArg, paymentMethodArg, referenceNumberArg, notesArg) => {
    let billId, amount, paymentDate, paymentMethod, referenceNumber, notes;

    if (typeof billIdOrData === 'object') {
      billId = billIdOrData.billId || billIdOrData.apBillId || '';
      amount = billIdOrData.amount;
      paymentDate = billIdOrData.paymentDate;
      paymentMethod = billIdOrData.paymentMethod;
      referenceNumber = billIdOrData.referenceNumber;
      notes = billIdOrData.notes;
    } else {
      billId = billIdOrData;
      amount = amountArg;
      paymentDate = paymentDateArg;
      paymentMethod = paymentMethodArg;
      referenceNumber = referenceNumberArg;
      notes = notesArg;
    }

    const bill = apBills.find(b => b.id === billId);
    if (!bill) throw new Error('AP Bill not found');

    const paymentId = `APPAY2026${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString();
    const newPaid = (bill.amountPaid || 0) + amount;
    const newBalance = Math.max(0, (bill.totalPayable || 0) - newPaid);
    const newStatus = newBalance <= 0.01 ? 'Paid' : 'Partially Paid';

    const newPayment = {
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

    apService.updateBill(billId, { amountPaid: newPaid, balance: newBalance, status: newStatus });
    dispatch(updateApBillAction({ id: billId, amountPaid: newPaid, balance: newBalance, status: newStatus }));

    apService.recordPayment(newPayment);
    dispatch(addApPaymentAction(newPayment));

    const txn = {
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
    ledgerService.addEntries(txn);
    dispatch(addTransactionsAction(txn));

    logAudit(
      'RECORD_PAYMENT',
      'APPayment',
      paymentId,
      `Disbursed AP payment of $${amount.toFixed(2)} for Bill ${bill.id}. New balance: $${newBalance.toFixed(2)}`
    );

    return newPayment;
  }, [apBills, config, dispatch, logAudit]);

  // CSV IMPORT PROCESSING
  const processCSVImport = useCallback((fileType, csvContent, fileName) => {
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
    const status =
      validation.errors.length === 0
        ? 'Completed'
        : validation.validRecords.length > 0
        ? 'Completed with Errors'
        : 'Failed';

    const batch = {
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

    if (validation.validRecords.length > 0) {
      switch (fileType) {
        case 'employees': {
          const newEmps = validation.validRecords.map(r => ({
            id: r.employee_id || r.id,
            organizationId: config.id,
            employeeType: (r.employee_type?.toUpperCase()) || 'W2',
            firstName: r.first_name || '',
            lastName: r.last_name || '',
            email: r.email || '',
            phone: r.phone || '',
            status: r.status || 'Active',
            hireDate: r.hire_date || now.split('T')[0],
            department: r.department || 'General',
            createdAt: now,
            updatedAt: now,
            version: 1
          }));
          newEmps.forEach(e => {
            employeeService.create(e);
            dispatch(addEmployeeAction(e));
          });
          break;
        }
        case 'clients': {
          const newClis = validation.validRecords.map(r => ({
            id: r.client_id || r.id,
            organizationId: config.id,
            name: r.name || r.client_name || '',
            status: r.status || 'Active',
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
          newClis.forEach(c => {
            clientService.create(c);
            dispatch(addClientAction(c));
          });
          break;
        }
        case 'placements': {
          const newPlcs = validation.validRecords.map(r => ({
            id: r.placement_id || r.id,
            organizationId: config.id,
            employeeId: r.employee_id,
            clientId: r.client_id,
            jobId: r.job_id || '',
            startDate: r.start_date || now.split('T')[0],
            endDate: r.end_date || '',
            billingRate: parseFloat(r.billing_rate || '0'),
            payRate: parseFloat(r.pay_rate || '0'),
            billingUnit: r.billing_unit || 'Hour',
            payUnit: r.pay_unit || 'Hour',
            status: r.status || 'Active',
            createdAt: now,
            updatedAt: now,
            version: 1
          }));
          newPlcs.forEach(p => {
            placementService.create(p);
            dispatch(addPlacementAction(p));
          });
          break;
        }
        case 'payments': {
          validation.validRecords.forEach(r => {
            const invId = r.invoice_id;
            const amt = parseFloat(r.amount);
            if (invId && amt > 0) {
              recordARPayment(invId, amt, r.payment_date || now.split('T')[0], r.payment_method || 'ACH', r.reference_number);
            }
          });
          break;
        }
        default:
          break;
      }
    }

    importService.addBatch(batch);
    dispatch(addImportBatchAction(batch));

    logAudit(
      'IMPORT',
      'ImportBatch',
      batchId,
      `Imported ${validation.validRecords.length}/${validation.recordsRead} records from "${fileName}" (${fileType})`
    );

    return batch;
  }, [employees, clients, jobs, placements, invoices, config, dispatch, logAudit, recordARPayment]);

  // TRACEABILITY LINEAGE RESOLVER
  const getTraceabilityLineage = useCallback((sourceTypeOrId, maybeSourceId) => {
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

    let emp, cli, job, plc, ts, inc, inv, bill;

    if (sourceType === 'Timesheet') {
      ts = timesheets.find(t => t.id === sourceId);
    } else if (sourceType === 'Invoice') {
      inv = invoices.find(i => i.id === sourceId);
      const incLine = inv?.lineItems?.find(l => l.incomeId);
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

    if (!ts && inc) ts = timesheets.find(t => t.id === inc?.timesheetId);
    if (!ts && bill) ts = timesheets.find(t => t.id === bill?.timesheetId);

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
      [ts?.id, inc?.id, inv?.id, bill?.id, plc?.id, emp?.id, cli?.id].filter(Boolean)
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
  }, [timesheets, invoices, incomes, apBills, placements, employees, clients, jobs, arPayments, apPayments, transactions, auditLogs]);

  // RESET TO INITIAL DATA
  const resetToInitialData = useCallback(() => {
    const defaults = resetStorageToDefaults();
    dispatch(setEmployees(defaults.employees));
    dispatch(setClients(defaults.clients));
    dispatch(setJobs(defaults.jobs));
    dispatch(setPlacements(defaults.placements));
    dispatch(setTimesheets(defaults.timesheets));
    dispatch(setIncomes(defaults.income));
    dispatch(setInvoices(defaults.invoices));
    dispatch(setArPayments(defaults.arPayments));
    dispatch(setApBills(defaults.apBills));
    dispatch(setApPayments(defaults.apPayments));
    dispatch(setTransactions(defaults.transactions));
    dispatch(setAuditLogs(defaults.auditLogs));
    dispatch(setImportBatches(defaults.importBatches));
    dispatch(setConfig(defaults.config));
  }, [dispatch]);

  // EXPORT & IMPORT BACKUPS
  const exportSystemDataJSON = useCallback(() => {
    return exportFullBackupJSON();
  }, []);

  const importSystemDataJSON = useCallback((jsonStr) => {
    const success = importFullBackupJSON(jsonStr);
    if (success) {
      resetToInitialData();
    }
    return success;
  }, [resetToInitialData]);

  const updateConfigFn = useCallback((newCfg) => {
    configService.updateConfig(newCfg);
    dispatch(updateConfigAction(newCfg));
  }, [dispatch]);

  return {
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
    updateConfig: updateConfigFn
  };
}
