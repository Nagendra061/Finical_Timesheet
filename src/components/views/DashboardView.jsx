/**
 * DashboardView
 *
 * Operational dashboard displaying the 9 critical business KPIs:
 * 1. Active Employees (W2 & 1099)
 * 2. Active Clients
 * 3. Active Placements
 * 4. Hours This Period
 * 5. Billable Hours & Utilization
 * 6. Revenue (Accrued Income)
 * 7. AP / Direct Payroll Worker Cost
 * 8. Gross Margin ($)
 * 9. Gross Margin (%)
 *
 * Plus AR Aging distribution, AP Obligations schedule, Top Clients by Revenue,
 * and quick workflow navigation shortcuts.
 *
 * Data Source:
 * Redux store via useStaffing hook
 *
 * Props:
 * @param {(tab: string) => void} onNavigate - Routing callback to change active tab
 */

import React from 'react';
import {
  Users,
  Building2,
  UserCheck,
  Clock,
  DollarSign,
  TrendingUp,
  CreditCard,
  ArrowUpRight,
  ArrowRight,
  Receipt,
  FileSpreadsheet
} from 'lucide-react';
import { useStaffing } from '../../hooks/useStaffing';
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  getARAgingCategory,
  getAPAgingCategory,
  calculateStaffingMargin
} from '../../utils/formatters';

export const DashboardView = ({ onNavigate }) => {
  const {
    employees = [],
    clients = [],
    placements = [],
    timesheets = [],
    incomes = [],
    invoices = [],
    apBills = []
  } = useStaffing();

  // 1. KPI Calculations
  const activeEmployees = employees.filter(e => e.status === 'Active').length;
  const activeClients = clients.filter(c => c.status === 'Active').length;
  const activePlacements = placements.filter(p => p.status === 'Active').length;

  // Hours: from all timesheets in current cycle
  const totalHours = timesheets.reduce((acc, t) => acc + (t.totalHours || 0), 0);
  const billableHours = timesheets
    .filter(t => t.status === 'Approved' || t.status === 'Submitted')
    .reduce((acc, t) => acc + ((t.regularHours || 0) + (t.overtimeHours || 0)), 0);

  // Revenue: sum of all income records generated from approved timesheets
  const totalRevenue = incomes.reduce((acc, inc) => acc + (inc.totalIncome || 0), 0);

  // AP / Payroll Cost: sum of all AP bills generated from approved timesheets
  const totalPayrollCost = apBills.reduce((acc, b) => acc + (b.totalPayable || 0), 0);

  // Gross Margin & %
  const { grossMargin, grossMarginPercent } = calculateStaffingMargin(totalRevenue, totalPayrollCost);

  // 2. AR Aging Breakdown
  const arAgingCounts = {
    Current: { count: 0, total: 0 },
    '1-30 Days': { count: 0, total: 0 },
    '31-60 Days': { count: 0, total: 0 },
    '61-90 Days': { count: 0, total: 0 },
    '90+ Days': { count: 0, total: 0 }
  };

  let totalAR = 0;
  invoices.forEach(inv => {
    if (inv.balance > 0) {
      totalAR += inv.balance;
      const category = getARAgingCategory(inv.dueDate);
      if (arAgingCounts[category]) {
        arAgingCounts[category].count += 1;
        arAgingCounts[category].total += inv.balance;
      }
    }
  });

  // 3. AP Aging Breakdown
  const apAgingCounts = {
    Current: { count: 0, total: 0 },
    'Due This Week': { count: 0, total: 0 },
    'Due Next Week': { count: 0, total: 0 },
    Overdue: { count: 0, total: 0 }
  };

  let totalAP = 0;
  apBills.forEach(bill => {
    if (bill.balance > 0) {
      totalAP += bill.balance;
      const category = getAPAgingCategory(bill.dueDate);
      if (apAgingCounts[category]) {
        apAgingCounts[category].count += 1;
        apAgingCounts[category].total += bill.balance;
      }
    }
  });

  // 4. Revenue by Client for chart
  const revenueByClientMap = {};
  incomes.forEach(inc => {
    const client = clients.find(c => c.id === inc.clientId);
    const name = client?.name || inc.clientId;
    revenueByClientMap[name] = (revenueByClientMap[name] || 0) + (inc.totalIncome || 0);
  });

  const topClients = Object.entries(revenueByClientMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  // Pending timesheets for review
  const pendingTimesheets = timesheets.filter(t => t.status === 'Submitted');

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Banner Alert for Pending Actions */}
      {pendingTimesheets.length > 0 && (
        <div className="rounded-xl p-4 bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-amber-900 text-sm">
                {pendingTimesheets.length} Timesheet{pendingTimesheets.length > 1 ? 's' : ''} Awaiting Approval
              </h4>
              <p className="text-amber-700 text-xs mt-0.5">
                Approving timesheets triggers operational Income and AP generation for active billing cycles.
              </p>
            </div>
          </div>
          <button
            id="dashboard-review-timesheets"
            type="button"
            onClick={() => onNavigate('timesheets')}
            className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs self-start sm:self-center transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            Review Timesheets
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 9 KPI Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
            Operational & Financial Metrics
          </h3>
          <span className="text-xs text-stone-500">Calculated dynamically</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4">
          {/* 1. Active Employees */}
          <div
            id="kpi-card-employees"
            onClick={() => onNavigate('employees')}
            className="p-4 bg-white rounded-xl border border-stone-200 shadow-xs hover:border-stone-300 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-stone-500">Active Employees</span>
              <div className="p-2 rounded-lg bg-stone-100 text-stone-700 group-hover:bg-stone-200 transition-colors">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-stone-900">{formatNumber(activeEmployees)}</span>
              <span className="text-xs text-emerald-600 font-medium">+100% active roster</span>
            </div>
            <p className="text-[11px] text-stone-400 mt-1">W2 staff & 1099 contractors</p>
          </div>

          {/* 2. Active Clients */}
          <div
            id="kpi-card-clients"
            onClick={() => onNavigate('clients')}
            className="p-4 bg-white rounded-xl border border-stone-200 shadow-xs hover:border-stone-300 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-stone-500">Active Clients</span>
              <div className="p-2 rounded-lg bg-stone-100 text-stone-700 group-hover:bg-stone-200 transition-colors">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-stone-900">{formatNumber(activeClients)}</span>
              <span className="text-xs text-stone-500 font-medium">Healthcare & Tech</span>
            </div>
            <p className="text-[11px] text-stone-400 mt-1">Enterprise accounts billed</p>
          </div>

          {/* 3. Active Placements */}
          <div
            id="kpi-card-placements"
            onClick={() => onNavigate('placements')}
            className="p-4 bg-white rounded-xl border border-stone-200 shadow-xs hover:border-stone-300 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-stone-500">Active Placements</span>
              <div className="p-2 rounded-lg bg-stone-100 text-stone-700 group-hover:bg-stone-200 transition-colors">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-stone-900">{formatNumber(activePlacements)}</span>
              <span className="text-xs text-emerald-600 font-medium">Active billable roles</span>
            </div>
            <p className="text-[11px] text-stone-400 mt-1">Employee-to-Client assignments</p>
          </div>

          {/* 4. Hours This Period */}
          <div
            id="kpi-card-hours-period"
            onClick={() => onNavigate('timesheets')}
            className="p-4 bg-white rounded-xl border border-stone-200 shadow-xs hover:border-stone-300 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-stone-500">Hours This Period</span>
              <div className="p-2 rounded-lg bg-stone-100 text-stone-700 group-hover:bg-stone-200 transition-colors">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-stone-900">{formatNumber(totalHours)}</span>
              <span className="text-xs text-stone-500 font-medium">Logged hours</span>
            </div>
            <p className="text-[11px] text-stone-400 mt-1">Includes regular, OT & holiday</p>
          </div>

          {/* 5. Billable Hours */}
          <div
            id="kpi-card-billable-hours"
            onClick={() => onNavigate('timesheets')}
            className="p-4 bg-white rounded-xl border border-stone-200 shadow-xs hover:border-stone-300 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-stone-500">Billable Hours</span>
              <div className="p-2 rounded-lg bg-stone-100 text-stone-700 group-hover:bg-stone-200 transition-colors">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-stone-900">{formatNumber(billableHours)}</span>
              <span className="text-xs text-emerald-600 font-medium">
                {totalHours > 0 ? `${((billableHours / totalHours) * 100).toFixed(0)}% utilization` : '0%'}
              </span>
            </div>
            <p className="text-[11px] text-stone-400 mt-1">Direct client billable hours</p>
          </div>

          {/* 6. Revenue */}
          <div
            id="kpi-card-revenue"
            onClick={() => onNavigate('income')}
            className="p-4 bg-white rounded-xl border border-stone-200 shadow-xs hover:border-stone-300 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-stone-500">Revenue (Total Income)</span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-stone-900">{formatCurrency(totalRevenue)}</span>
            </div>
            <p className="text-[11px] text-stone-400 mt-1">Hours × Placement Billing Rates</p>
          </div>

          {/* 7. AP / Payroll Cost */}
          <div
            id="kpi-card-payroll-cost"
            onClick={() => onNavigate('ap')}
            className="p-4 bg-white rounded-xl border border-stone-200 shadow-xs hover:border-stone-300 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-stone-500">AP / Payroll Cost</span>
              <div className="p-2 rounded-lg bg-rose-50 text-rose-700">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-stone-900">{formatCurrency(totalPayrollCost)}</span>
            </div>
            <p className="text-[11px] text-stone-400 mt-1">Hours × Placement Pay Rates</p>
          </div>

          {/* 8. Gross Margin */}
          <div
            id="kpi-card-gross-margin"
            onClick={() => onNavigate('reports')}
            className="p-4 bg-white rounded-xl border border-stone-200 shadow-xs hover:border-stone-300 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-stone-500">Gross Margin ($)</span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-700">{formatCurrency(grossMargin)}</span>
            </div>
            <p className="text-[11px] text-stone-400 mt-1">Revenue minus Direct Worker Cost</p>
          </div>

          {/* 9. Gross Margin % */}
          <div
            id="kpi-card-gross-margin-pct"
            onClick={() => onNavigate('reports')}
            className="p-4 bg-white rounded-xl border border-stone-200 shadow-xs hover:border-stone-300 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-stone-500">Gross Margin %</span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-700">{formatPercent(grossMarginPercent)}</span>
              <span className="text-xs text-stone-500 font-medium">Target: ≥ 28.0%</span>
            </div>
            <p className="text-[11px] text-stone-400 mt-1">(Gross Margin ÷ Revenue) × 100</p>
          </div>
        </div>
      </div>

      {/* AR & AP Summary Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AR Summary */}
        <div id="dashboard-ar-summary" className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h3 className="font-semibold text-stone-900 text-sm">Accounts Receivable (AR) Aging</h3>
              <p className="text-xs text-stone-500">Outstanding client balances by invoice aging</p>
            </div>
            <button
              id="dashboard-view-ar"
              type="button"
              onClick={() => onNavigate('ar')}
              className="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              View Invoices
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 flex items-baseline justify-between p-3 rounded-lg bg-stone-50 border border-stone-100">
            <span className="text-xs font-semibold text-stone-700">Total Outstanding AR</span>
            <span className="text-xl font-bold text-stone-900">{formatCurrency(totalAR)}</span>
          </div>

          <div className="grid grid-cols-5 gap-2 mt-4 text-center">
            {Object.entries(arAgingCounts).map(([bucket, data]) => {
              const isOverdue = bucket !== 'Current';
              return (
                <div
                  key={bucket}
                  className={`p-2.5 rounded-lg border ${
                    isOverdue && data.total > 0
                      ? 'bg-amber-50/50 border-amber-200'
                      : 'bg-white border-stone-100'
                  }`}
                >
                  <p className="text-[10px] font-semibold text-stone-500 truncate">{bucket}</p>
                  <p className="text-xs font-bold text-stone-900 mt-1">{formatCurrency(data.total)}</p>
                  <p className="text-[10px] text-stone-400 mt-0.5">{data.count} inv</p>
                </div>
              );
            })}
          </div>

          {/* Simple Visual Distribution Bar */}
          <div className="mt-4 pt-3 border-t border-stone-100">
            <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1.5">
              <span>AR Aging Proportions</span>
              <span>{totalAR > 0 ? '100%' : '0%'}</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-stone-100 overflow-hidden flex">
              {Object.entries(arAgingCounts).map(([bucket, data]) => {
                const widthPct = totalAR > 0 ? (data.total / totalAR) * 100 : 0;
                if (widthPct === 0) return null;
                const colors = {
                  Current: 'bg-emerald-500',
                  '1-30 Days': 'bg-sky-400',
                  '31-60 Days': 'bg-amber-400',
                  '61-90 Days': 'bg-orange-500',
                  '90+ Days': 'bg-rose-500'
                };
                return (
                  <div
                    key={bucket}
                    style={{ width: `${widthPct}%` }}
                    className={`${colors[bucket] || 'bg-stone-400'} h-full`}
                    title={`${bucket}: ${formatCurrency(data.total)} (${widthPct.toFixed(1)}%)`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* AP Summary */}
        <div id="dashboard-ap-summary" className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h3 className="font-semibold text-stone-900 text-sm">Accounts Payable (AP) Obligations</h3>
              <p className="text-xs text-stone-500">Worker & contractor payables schedule</p>
            </div>
            <button
              id="dashboard-view-ap"
              type="button"
              onClick={() => onNavigate('ap')}
              className="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              View AP Bills
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 flex items-baseline justify-between p-3 rounded-lg bg-stone-50 border border-stone-100">
            <span className="text-xs font-semibold text-stone-700">Total Outstanding AP</span>
            <span className="text-xl font-bold text-stone-900">{formatCurrency(totalAP)}</span>
          </div>

          <div className="grid grid-cols-4 gap-2 mt-4 text-center">
            {Object.entries(apAgingCounts).map(([bucket, data]) => {
              const isDueUrgent = bucket === 'Due This Week' || bucket === 'Overdue';
              return (
                <div
                  key={bucket}
                  className={`p-2.5 rounded-lg border ${
                    isDueUrgent && data.total > 0
                      ? 'bg-rose-50/50 border-rose-200'
                      : 'bg-white border-stone-100'
                  }`}
                >
                  <p className="text-[10px] font-semibold text-stone-500 truncate">{bucket}</p>
                  <p className="text-xs font-bold text-stone-900 mt-1">{formatCurrency(data.total)}</p>
                  <p className="text-[10px] text-stone-400 mt-0.5">{data.count} bills</p>
                </div>
              );
            })}
          </div>

          {/* Simple Visual AP Distribution Bar */}
          <div className="mt-4 pt-3 border-t border-stone-100">
            <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1.5">
              <span>AP Due Proportions</span>
              <span>{totalAP > 0 ? '100%' : '0%'}</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-stone-100 overflow-hidden flex">
              {Object.entries(apAgingCounts).map(([bucket, data]) => {
                const widthPct = totalAP > 0 ? (data.total / totalAP) * 100 : 0;
                if (widthPct === 0) return null;
                const colors = {
                  Current: 'bg-stone-400',
                  'Due This Week': 'bg-amber-400',
                  'Due Next Week': 'bg-sky-400',
                  Overdue: 'bg-rose-500'
                };
                return (
                  <div
                    key={bucket}
                    style={{ width: `${widthPct}%` }}
                    className={`${colors[bucket] || 'bg-stone-400'} h-full`}
                    title={`${bucket}: ${formatCurrency(data.total)} (${widthPct.toFixed(1)}%)`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Charts: Revenue & Margin Trends + Top Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue by Top Clients */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h3 className="font-semibold text-stone-900 text-sm">Revenue by Client</h3>
              <p className="text-xs text-stone-500">Distribution of accrued staffing income</p>
            </div>
            <button
              id="dashboard-view-reports"
              type="button"
              onClick={() => onNavigate('reports')}
              className="text-xs font-medium text-emerald-700 hover:text-emerald-800 cursor-pointer"
            >
              Full Breakdown →
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {topClients.map(([clientName, rev]) => {
              const pct = totalRevenue > 0 ? (rev / totalRevenue) * 100 : 0;
              return (
                <div key={clientName} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-stone-800 truncate max-w-[200px] sm:max-w-xs">{clientName}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900">{formatCurrency(rev)}</span>
                      <span className="text-[11px] text-stone-500 w-12 text-right">({pct.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                    />
                  </div>
                </div>
              );
            })}

            {topClients.length === 0 && (
              <div className="py-8 text-center text-xs text-stone-400">
                No revenue records recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Quick Staffing Actions */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-stone-900 text-sm">Quick Actions</h3>
            <p className="text-xs text-stone-500 mt-0.5">Streamlined operational staffing tasks</p>

            <div className="mt-4 space-y-2">
              <button
                id="quick-action-timesheet"
                type="button"
                onClick={() => onNavigate('timesheets')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-left text-xs transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-stone-100 text-stone-700">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-stone-900">Manage Timesheets</p>
                    <p className="text-[11px] text-stone-500">Log hours & run approvals</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400" />
              </button>

              <button
                id="quick-action-invoice"
                type="button"
                onClick={() => onNavigate('income')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-left text-xs transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-700">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-stone-900">Generate Invoices</p>
                    <p className="text-[11px] text-stone-500">Bill unbilled timesheet income</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400" />
              </button>

              <button
                id="quick-action-import"
                type="button"
                onClick={() => onNavigate('imports')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-left text-xs transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-stone-100 text-stone-700">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-stone-900">Import CSV Data</p>
                    <p className="text-[11px] text-stone-500">Employees, clients, timesheets</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400" />
              </button>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-stone-100 text-[11px] text-stone-500 flex items-center justify-between">
            <span>Fundamental Traceability</span>
            <button
              id="dashboard-explore-trace"
              type="button"
              onClick={() => onNavigate('traceability')}
              className="text-emerald-700 font-semibold hover:underline cursor-pointer"
            >
              Open Audit Chain →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
