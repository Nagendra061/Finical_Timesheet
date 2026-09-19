import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Download,
  Filter,
  Calendar,
  DollarSign,
  TrendingUp,
  Building2,
  Users,
  Clock,
  Receipt,
  CreditCard
} from 'lucide-react';
import { useStaffing } from '../../context/StaffingContext';
import { Badge } from '../common/Badge';
import {
  formatCurrency,
  formatDate,
  formatPercent,
  calculateStaffingMargin,
  getARAgingCategory,
  getAPAgingCategory
} from '../../utils/formatters';

type ReportType =
  | 'revenue-by-client'
  | 'employee-profitability'
  | 'client-profitability'
  | 'timesheet-report'
  | 'ar-report'
  | 'ap-report';

export const ReportsView: React.FC = () => {
  const {
    incomes,
    clients,
    employees,
    placements,
    timesheets,
    invoices,
    apBills
  } = useStaffing();

  const [activeReport, setActiveReport] = useState<ReportType>('employee-profitability');
  const [selectedClientFilter, setSelectedClientFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  // Report 1: Revenue by Client
  const revenueByClientData = useMemo(() => {
    const map: Record<string, { clientName: string; totalRevenue: number; count: number }> = {};
    incomes.forEach(inc => {
      const client = clients.find(c => c.id === inc.clientId);
      const name = client?.name || inc.clientId;
      if (!map[name]) map[name] = { clientName: name, totalRevenue: 0, count: 0 };
      map[name].totalRevenue += inc.totalIncome;
      map[name].count += 1;
    });
    return Object.values(map).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [incomes, clients]);

  // Report 2: Employee Profitability
  const employeeProfitabilityData = useMemo(() => {
    return employees.map(emp => {
      const empIncomes = incomes.filter(i => i.employeeId === emp.id);
      const empBills = apBills.filter(b => b.employeeId === emp.id);

      const rev = empIncomes.reduce((acc, i) => acc + i.totalIncome, 0);
      const cost = empBills.reduce((acc, b) => acc + b.totalPayable, 0);
      const { grossMargin, grossMarginPercent } = calculateStaffingMargin(rev, cost);

      return {
        id: emp.id,
        name: `${emp.firstName} ${emp.lastName}`,
        type: emp.employeeType,
        revenue: rev,
        cost,
        grossMargin,
        grossMarginPercent
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [employees, incomes, apBills]);

  // Report 3: Client Profitability
  const clientProfitabilityData = useMemo(() => {
    return clients.map(cli => {
      const cliIncomes = incomes.filter(i => i.clientId === cli.id);
      const placementIds = placements.filter(p => p.clientId === cli.id).map(p => p.id);
      const cliBills = apBills.filter(b => placementIds.includes(b.placementId));

      const rev = cliIncomes.reduce((acc, i) => acc + i.totalIncome, 0);
      const cost = cliBills.reduce((acc, b) => acc + b.totalPayable, 0);
      const { grossMargin, grossMarginPercent } = calculateStaffingMargin(rev, cost);

      return {
        id: cli.id,
        name: cli.name,
        paymentTerms: cli.paymentTerms,
        revenue: rev,
        cost,
        grossMargin,
        grossMarginPercent
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [clients, incomes, placements, apBills]);

  // Report 4: Timesheet Report
  const timesheetReportData = useMemo(() => {
    return timesheets
      .filter(t => {
        const matchesClient = selectedClientFilter === 'ALL' || t.clientId === selectedClientFilter;
        const matchesStatus = selectedStatusFilter === 'ALL' || t.status === selectedStatusFilter;
        return matchesClient && matchesStatus;
      })
      .map(t => {
        const emp = employees.find(e => e.id === t.employeeId);
        const cli = clients.find(c => c.id === t.clientId);
        return {
          id: t.id,
          employeeName: emp ? `${emp.firstName} ${emp.lastName}` : t.employeeId,
          clientName: cli?.name || t.clientId,
          period: `${formatDate(t.periodStartDate)} – ${formatDate(t.periodEndDate)}`,
          regularHours: t.regularHours,
          overtimeHours: t.overtimeHours,
          totalHours: t.totalHours,
          status: t.status
        };
      });
  }, [timesheets, employees, clients, selectedClientFilter, selectedStatusFilter]);

  // Report 5: AR Report
  const arReportData = useMemo(() => {
    return invoices
      .filter(i => {
        const matchesClient = selectedClientFilter === 'ALL' || i.clientId === selectedClientFilter;
        const matchesStatus = selectedStatusFilter === 'ALL' || i.status === selectedStatusFilter;
        return matchesClient && matchesStatus;
      })
      .map(inv => {
        const cli = clients.find(c => c.id === inv.clientId);
        return {
          invoiceNumber: inv.invoiceNumber,
          clientName: cli?.name || inv.clientId,
          invoiceDate: inv.invoiceDate,
          dueDate: inv.dueDate,
          amount: inv.total,
          amountPaid: inv.amountPaid,
          balance: inv.balance,
          aging: getARAgingCategory(inv.dueDate),
          status: inv.status
        };
      });
  }, [invoices, clients, selectedClientFilter, selectedStatusFilter]);

  // Report 6: AP Report
  const apReportData = useMemo(() => {
    return apBills
      .filter(b => {
        const matchesStatus = selectedStatusFilter === 'ALL' || b.status === selectedStatusFilter;
        return matchesStatus;
      })
      .map(bill => {
        const emp = employees.find(e => e.id === bill.employeeId);
        return {
          billId: bill.id,
          timesheetId: bill.timesheetId,
          employeeName: emp ? `${emp.firstName} ${emp.lastName}` : bill.employeeId,
          dueDate: bill.dueDate,
          totalPayable: bill.totalPayable,
          amountPaid: bill.amountPaid,
          balance: bill.balance,
          status: bill.status,
          scheduleBucket: getAPAgingCategory(bill.dueDate)
        };
      });
  }, [apBills, employees, selectedStatusFilter]);

  // CSV Export
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = `${activeReport}-${new Date().toISOString().split('T')[0]}.csv`;

    if (activeReport === 'revenue-by-client') {
      headers = ['Client Name', 'Timesheet Count', 'Total Accrued Revenue'];
      rows = revenueByClientData.map(d => [`"${d.clientName}"`, d.count, d.totalRevenue]);
    } else if (activeReport === 'employee-profitability') {
      headers = ['Employee ID', 'Employee Name', 'Worker Type', 'Revenue', 'Cost', 'Gross Margin', 'Gross Margin %'];
      rows = employeeProfitabilityData.map(d => [d.id, `"${d.name}"`, d.type, d.revenue, d.cost, d.grossMargin, d.grossMarginPercent.toFixed(2)]);
    } else if (activeReport === 'client-profitability') {
      headers = ['Client ID', 'Client Name', 'Payment Terms', 'Revenue', 'Cost', 'Gross Margin', 'Gross Margin %'];
      rows = clientProfitabilityData.map(d => [d.id, `"${d.name}"`, d.paymentTerms, d.revenue, d.cost, d.grossMargin, d.grossMarginPercent.toFixed(2)]);
    } else if (activeReport === 'timesheet-report') {
      headers = ['Timesheet ID', 'Employee', 'Client', 'Period', 'Reg Hours', 'OT Hours', 'Total Hours', 'Status'];
      rows = timesheetReportData.map(d => [d.id, `"${d.employeeName}"`, `"${d.clientName}"`, `"${d.period}"`, d.regularHours, d.overtimeHours, d.totalHours, d.status]);
    } else if (activeReport === 'ar-report') {
      headers = ['Invoice #', 'Client', 'Due Date', 'Total Amount', 'Amount Paid', 'Balance', 'Aging Category', 'Status'];
      rows = arReportData.map(d => [d.invoiceNumber, `"${d.clientName}"`, d.dueDate, d.amount, d.amountPaid, d.balance, d.aging, d.status]);
    } else if (activeReport === 'ap-report') {
      headers = ['Bill ID', 'Timesheet ID', 'Worker', 'Due Date', 'Total Payable', 'Amount Paid', 'Balance', 'Status', 'Schedule Bucket'];
      rows = apReportData.map(d => [d.billId, d.timesheetId, `"${d.employeeName}"`, d.dueDate, d.totalPayable, d.amountPaid, d.balance, d.status, d.scheduleBucket]);
    }

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reportsList = [
    { id: 'employee-profitability', label: 'Employee Profitability', icon: Users },
    { id: 'client-profitability', label: 'Client Profitability', icon: Building2 },
    { id: 'revenue-by-client', label: 'Revenue by Client', icon: DollarSign },
    { id: 'timesheet-report', label: 'Timesheets Report', icon: Clock },
    { id: 'ar-report', label: 'Accounts Receivable (AR) Report', icon: Receipt },
    { id: 'ap-report', label: 'Accounts Payable (AP) Report', icon: CreditCard },
  ];

  return (
    <div className="space-y-4">
      {/* Report Selection Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-3">
        {reportsList.map(rep => {
          const Icon = rep.icon;
          const isActive = activeReport === rep.id;
          return (
            <button
              key={rep.id}
              type="button"
              onClick={() => setActiveReport(rep.id as ReportType)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                isActive
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{rep.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter and Export Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {(activeReport === 'timesheet-report' || activeReport === 'ar-report') && (
            <select
              value={selectedClientFilter}
              onChange={e => setSelectedClientFilter(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700"
            >
              <option value="ALL">All Clients</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          {(activeReport === 'timesheet-report' || activeReport === 'ar-report' || activeReport === 'ap-report') && (
            <select
              value={selectedStatusFilter}
              onChange={e => setSelectedStatusFilter(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700"
            >
              <option value="ALL">All Statuses</option>
              {activeReport === 'timesheet-report' && (
                <>
                  <option value="Submitted">Submitted</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </>
              )}
              {activeReport === 'ar-report' && (
                <>
                  <option value="Open">Open</option>
                  <option value="Partially Paid">Partially Paid</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                </>
              )}
              {activeReport === 'ap-report' && (
                <>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Partially Paid">Partially Paid</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                </>
              )}
            </select>
          )}
        </div>

        <button
          id="export-current-report-button"
          type="button"
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Report to CSV</span>
        </button>
      </div>

      {/* Report Tables */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        {/* 1. Employee Profitability */}
        {activeReport === 'employee-profitability' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50/80 border-b border-stone-200 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Employee ID</th>
                  <th className="px-4 py-3">Employee Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3 text-right">Revenue</th>
                  <th className="px-4 py-3 text-right">Direct Cost</th>
                  <th className="px-4 py-3 text-right">Gross Margin ($)</th>
                  <th className="px-4 py-3 text-right">Gross Margin (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {employeeProfitabilityData.map(emp => (
                  <tr key={emp.id} className="hover:bg-stone-50/60">
                    <td className="px-4 py-3 font-mono font-medium text-stone-900">{emp.id}</td>
                    <td className="px-4 py-3 font-semibold text-stone-900">{emp.name}</td>
                    <td className="px-4 py-3"><Badge variant={emp.type === 'W2' ? 'purple' : 'info'}>{emp.type}</Badge></td>
                    <td className="px-4 py-3 text-right font-bold text-stone-900">{formatCurrency(emp.revenue)}</td>
                    <td className="px-4 py-3 text-right text-rose-700 font-medium">{formatCurrency(emp.cost)}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-700">{formatCurrency(emp.grossMargin)}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-700">{formatPercent(emp.grossMarginPercent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. Client Profitability */}
        {activeReport === 'client-profitability' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50/80 border-b border-stone-200 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Client ID</th>
                  <th className="px-4 py-3">Client Name</th>
                  <th className="px-4 py-3">Payment Terms</th>
                  <th className="px-4 py-3 text-right">Revenue</th>
                  <th className="px-4 py-3 text-right">Direct Cost</th>
                  <th className="px-4 py-3 text-right">Gross Margin ($)</th>
                  <th className="px-4 py-3 text-right">Gross Margin (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {clientProfitabilityData.map(c => (
                  <tr key={c.id} className="hover:bg-stone-50/60">
                    <td className="px-4 py-3 font-mono font-medium text-stone-900">{c.id}</td>
                    <td className="px-4 py-3 font-semibold text-stone-900">{c.name}</td>
                    <td className="px-4 py-3 text-stone-600">{c.paymentTerms}</td>
                    <td className="px-4 py-3 text-right font-bold text-stone-900">{formatCurrency(c.revenue)}</td>
                    <td className="px-4 py-3 text-right text-rose-700 font-medium">{formatCurrency(c.cost)}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-700">{formatCurrency(c.grossMargin)}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-700">{formatPercent(c.grossMarginPercent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. Revenue by Client */}
        {activeReport === 'revenue-by-client' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50/80 border-b border-stone-200 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Client Account</th>
                  <th className="px-4 py-3 text-center">Accrued Records Count</th>
                  <th className="px-4 py-3 text-right">Total Staffing Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {revenueByClientData.map(c => (
                  <tr key={c.clientName} className="hover:bg-stone-50/60">
                    <td className="px-4 py-3 font-semibold text-stone-900">{c.clientName}</td>
                    <td className="px-4 py-3 text-center font-bold text-stone-700">{c.count}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-700 text-sm">{formatCurrency(c.totalRevenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. Timesheet Report */}
        {activeReport === 'timesheet-report' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50/80 border-b border-stone-200 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Timesheet ID</th>
                  <th className="px-4 py-3">Worker</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Cycle Period</th>
                  <th className="px-4 py-3 text-center">Reg / OT</th>
                  <th className="px-4 py-3 text-right">Total Hours</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {timesheetReportData.map(t => (
                  <tr key={t.id} className="hover:bg-stone-50/60">
                    <td className="px-4 py-3 font-mono font-medium text-stone-900">{t.id}</td>
                    <td className="px-4 py-3 font-semibold text-stone-900">{t.employeeName}</td>
                    <td className="px-4 py-3 text-stone-800">{t.clientName}</td>
                    <td className="px-4 py-3 text-stone-600">{t.period}</td>
                    <td className="px-4 py-3 text-center font-mono">{t.regularHours}r / {t.overtimeHours}ot</td>
                    <td className="px-4 py-3 text-right font-bold text-stone-900">{t.totalHours} hrs</td>
                    <td className="px-4 py-3"><Badge variant={t.status === 'Approved' ? 'success' : 'warning'}>{t.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. AR Report */}
        {activeReport === 'ar-report' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50/80 border-b border-stone-200 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Invoice #</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-right">Paid</th>
                  <th className="px-4 py-3 text-right">Balance</th>
                  <th className="px-4 py-3">Aging Bucket</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {arReportData.map(inv => (
                  <tr key={inv.invoiceNumber} className="hover:bg-stone-50/60">
                    <td className="px-4 py-3 font-mono font-bold text-stone-900">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3 font-semibold text-stone-900">{inv.clientName}</td>
                    <td className="px-4 py-3 text-stone-600">{formatDate(inv.dueDate)}</td>
                    <td className="px-4 py-3 text-right font-bold text-stone-900">{formatCurrency(inv.amount)}</td>
                    <td className="px-4 py-3 text-right text-emerald-700">{formatCurrency(inv.amountPaid)}</td>
                    <td className="px-4 py-3 text-right font-bold text-stone-900">{formatCurrency(inv.balance)}</td>
                    <td className="px-4 py-3"><Badge variant={inv.aging === 'Current' ? 'success' : 'danger'}>{inv.aging}</Badge></td>
                    <td className="px-4 py-3"><Badge variant={inv.status === 'Paid' ? 'success' : 'warning'}>{inv.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 6. AP Report */}
        {activeReport === 'ap-report' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50/80 border-b border-stone-200 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Bill ID</th>
                  <th className="px-4 py-3">Timesheet</th>
                  <th className="px-4 py-3">Worker Recipient</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3 text-right">Total Payable</th>
                  <th className="px-4 py-3 text-right">Paid</th>
                  <th className="px-4 py-3 text-right">Balance</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {apReportData.map(b => (
                  <tr key={b.billId} className="hover:bg-stone-50/60">
                    <td className="px-4 py-3 font-mono font-medium text-stone-900">{b.billId}</td>
                    <td className="px-4 py-3 font-mono text-stone-600">{b.timesheetId}</td>
                    <td className="px-4 py-3 font-semibold text-stone-900">{b.employeeName}</td>
                    <td className="px-4 py-3 text-stone-600">{formatDate(b.dueDate)}</td>
                    <td className="px-4 py-3 text-right font-bold text-stone-900">{formatCurrency(b.totalPayable)}</td>
                    <td className="px-4 py-3 text-right text-emerald-700">{formatCurrency(b.amountPaid)}</td>
                    <td className="px-4 py-3 text-right font-bold text-stone-900">{formatCurrency(b.balance)}</td>
                    <td className="px-4 py-3"><Badge variant={b.status === 'Paid' ? 'success' : 'danger'}>{b.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
