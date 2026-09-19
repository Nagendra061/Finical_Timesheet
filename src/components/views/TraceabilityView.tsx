import React, { useState } from 'react';
import {
  GitCommit,
  Search,
  ArrowRight,
  CheckCircle2,
  Receipt,
  CreditCard,
  BookOpen,
  History,
  Clock,
  User,
  Building2,
  Briefcase
} from 'lucide-react';
import { useStaffing } from '../../context/StaffingContext';
import { Badge } from '../common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const TraceabilityView: React.FC = () => {
  const {
    getTraceabilityLineage,
    timesheets,
    invoices,
    apBills,
    incomes,
    employees,
    placements
  } = useStaffing();

  const [searchTargetId, setSearchTargetId] = useState<string>('TS-001');
  const [selectedEntityId, setSelectedEntityId] = useState<string>('TS-001');

  const lineage = getTraceabilityLineage(selectedEntityId);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTargetId.trim()) {
      setSelectedEntityId(searchTargetId.trim());
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <GitCommit className="w-4 h-4 text-stone-700" />
              Operational & Financial Traceability Lineage
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Inspect complete audit lineage: Employee ➔ Placement ➔ Timesheet ➔ Income ➔ Invoice ➔ Remittance / AP
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <input
              id="traceability-search-input"
              type="text"
              placeholder="Enter TS-001, INV-001, AP-001..."
              value={searchTargetId}
              onChange={e => setSearchTargetId(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-stone-50 focus:bg-white text-stone-900 font-mono w-48"
            />
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs"
            >
              Trace ID
            </button>
          </form>
        </div>

        {/* Quick select pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-stone-400 font-medium">Quick inspect:</span>
          {timesheets.slice(0, 3).map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setSelectedEntityId(t.id);
                setSearchTargetId(t.id);
              }}
              className={`px-2 py-0.5 rounded font-mono text-[11px] border transition-colors ${
                selectedEntityId === t.id
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              {t.id}
            </button>
          ))}
          {invoices.slice(0, 2).map(inv => (
            <button
              key={inv.id}
              type="button"
              onClick={() => {
                setSelectedEntityId(inv.id);
                setSearchTargetId(inv.id);
              }}
              className={`px-2 py-0.5 rounded font-mono text-[11px] border transition-colors ${
                selectedEntityId === inv.id
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              {inv.invoiceNumber}
            </button>
          ))}
          {apBills.slice(0, 2).map(b => (
            <button
              key={b.id}
              type="button"
              onClick={() => {
                setSelectedEntityId(b.id);
                setSearchTargetId(b.id);
              }}
              className={`px-2 py-0.5 rounded font-mono text-[11px] border transition-colors ${
                selectedEntityId === b.id
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              {b.id}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Pipeline */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
            Trace Pipeline for: <span className="font-mono text-stone-900">{selectedEntityId}</span>
          </span>
          <span className="text-xs text-stone-400">
            Audit status: All transactions linked & verified
          </span>
        </div>

        {/* Step 1 & 2: Employee & Placement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-stone-500" />
                1. Employee / Contractor Master
              </span>
              <span className="font-mono text-xs font-bold text-stone-900">{lineage.employee?.id || '—'}</span>
            </div>
            {lineage.employee ? (
              <div className="text-xs text-stone-600 mt-2 space-y-0.5">
                <p className="font-bold text-stone-900">{lineage.employee.firstName} {lineage.employee.lastName}</p>
                <p>{lineage.employee.email} • {lineage.employee.employeeType}</p>
                <p className="text-[11px] text-stone-400">Pay Frequency: {lineage.employee.paymentFrequency}</p>
              </div>
            ) : (
              <p className="text-xs text-stone-400 italic">No employee record linked</p>
            )}
          </div>

          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-stone-500" />
                2. Placement Contract
              </span>
              <span className="font-mono text-xs font-bold text-stone-900">{lineage.placement?.id || '—'}</span>
            </div>
            {lineage.placement ? (
              <div className="text-xs text-stone-600 mt-2 space-y-0.5">
                <p className="font-bold text-stone-900">{lineage.client?.name}</p>
                <p>Bill: ${lineage.placement.billingRate}/hr | Pay: ${lineage.placement.payRate}/hr</p>
                <p className="text-[11px] text-stone-400">OT Multiplier: {lineage.placement.overtimeMultiplier}×</p>
              </div>
            ) : (
              <p className="text-xs text-stone-400 italic">No placement record linked</p>
            )}
          </div>
        </div>

        {/* Step 3: Timesheet */}
        <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-stone-500" />
              3. Operational Timesheet
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-stone-900">{lineage.timesheet?.id || '—'}</span>
              {lineage.timesheet && (
                <Badge variant={lineage.timesheet.status === 'Approved' ? 'success' : 'warning'}>
                  {lineage.timesheet.status}
                </Badge>
              )}
            </div>
          </div>
          {lineage.timesheet ? (
            <div className="text-xs text-stone-700 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div>
                <span className="text-[10px] text-stone-400 block">Cycle Period</span>
                <span className="font-medium">{formatDate(lineage.timesheet.periodStartDate)} – {formatDate(lineage.timesheet.periodEndDate)}</span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 block">Hours Breakdown</span>
                <span className="font-mono font-bold">{lineage.timesheet.regularHours}r + {lineage.timesheet.overtimeHours}ot = {lineage.timesheet.totalHours} hrs</span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 block">Approval Signoff</span>
                <span>{lineage.timesheet.approvedBy || 'Pending'}</span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 block">Approval Date</span>
                <span>{lineage.timesheet.approvedAt ? formatDate(lineage.timesheet.approvedAt) : 'Pending'}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-stone-400 italic">No timesheet record linked</p>
          )}
        </div>

        {/* Bifurcation: AR Stream vs AP Stream */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* AR Stream (Revenue & Invoice) */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
              <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-emerald-700" />
                Revenue & Accounts Receivable (AR) Stream
              </span>
              <span className="text-[10px] font-bold text-emerald-700 uppercase">Client Side</span>
            </div>

            {lineage.income ? (
              <div className="p-2.5 rounded-lg bg-white border border-emerald-100 text-xs space-y-1">
                <div className="flex justify-between font-semibold text-stone-900">
                  <span>Income Record: {lineage.income.id}</span>
                  <span className="text-emerald-700 font-bold">{formatCurrency(lineage.income.totalIncome)}</span>
                </div>
                <p className="text-[11px] text-stone-500">Status: {lineage.income.status}</p>
              </div>
            ) : (
              <p className="text-xs text-stone-400 italic">No income accrual found</p>
            )}

            {lineage.invoice ? (
              <div className="p-2.5 rounded-lg bg-white border border-emerald-100 text-xs space-y-1">
                <div className="flex justify-between font-bold text-stone-900">
                  <span>Invoice: {lineage.invoice.invoiceNumber}</span>
                  <span>{formatCurrency(lineage.invoice.total)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-stone-600">
                  <span>Paid: {formatCurrency(lineage.invoice.amountPaid)}</span>
                  <span>Balance: {formatCurrency(lineage.invoice.balance)}</span>
                </div>
                <p className="text-[10px] text-stone-400">Due Date: {formatDate(lineage.invoice.dueDate)}</p>
              </div>
            ) : (
              <p className="text-xs text-stone-400 italic">No client invoice bundled yet</p>
            )}

            {lineage.arPayments.length > 0 && (
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-emerald-900 block">Applied Client Remittances:</span>
                {lineage.arPayments.map(p => (
                  <div key={p.id} className="p-2 rounded bg-white border border-emerald-100 flex justify-between text-[11px]">
                    <span>{formatDate(p.paymentDate)} via {p.paymentMethod} ({p.referenceNumber})</span>
                    <span className="font-bold text-emerald-700">{formatCurrency(p.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AP Stream (Worker Obligation & Disbursement) */}
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/20 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-rose-100">
              <span className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-rose-700" />
                Accounts Payable (AP) Worker Stream
              </span>
              <span className="text-[10px] font-bold text-rose-700 uppercase">Worker Side</span>
            </div>

            {lineage.apBill ? (
              <div className="p-2.5 rounded-lg bg-white border border-rose-100 text-xs space-y-1">
                <div className="flex justify-between font-semibold text-stone-900">
                  <span>AP Bill: {lineage.apBill.id}</span>
                  <span className="text-rose-700 font-bold">{formatCurrency(lineage.apBill.totalPayable)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-stone-600">
                  <span>Disbursed: {formatCurrency(lineage.apBill.amountPaid)}</span>
                  <span>Balance: {formatCurrency(lineage.apBill.balance)}</span>
                </div>
                <p className="text-[10px] text-stone-400">Due: {formatDate(lineage.apBill.dueDate)}</p>
              </div>
            ) : (
              <p className="text-xs text-stone-400 italic">No AP Bill created</p>
            )}

            {lineage.apPayments.length > 0 && (
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-rose-900 block">Disbursed Payments:</span>
                {lineage.apPayments.map(p => (
                  <div key={p.id} className="p-2 rounded bg-white border border-rose-100 flex justify-between text-[11px]">
                    <span>{formatDate(p.paymentDate)} via {p.paymentMethod} ({p.referenceNumber})</span>
                    <span className="font-bold text-rose-700">{formatCurrency(p.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Associated Ledger & Audit Entries */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-stone-600" />
            Generated Ledger Transactions ({(lineage.ledgerEntries || lineage.transactions || []).length})
          </h4>
          <div className="border border-stone-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-stone-50 text-[11px] font-sans font-semibold text-stone-500">
                <tr>
                  <th className="px-3 py-2">Entry ID</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Account</th>
                  <th className="px-3 py-2 text-right">Debit</th>
                  <th className="px-3 py-2 text-right">Credit</th>
                  <th className="px-3 py-2 font-sans">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {(lineage.ledgerEntries || lineage.transactions || []).map((e: any) => (
                  <tr key={e.id} className="hover:bg-stone-50/60">
                    <td className="px-3 py-2 text-stone-900">{e.id}</td>
                    <td className="px-3 py-2 font-sans"><Badge size="sm">{e.transactionType}</Badge></td>
                    <td className="px-3 py-2 font-sans text-stone-800">{e.account}</td>
                    <td className="px-3 py-2 text-right">{e.debit > 0 ? formatCurrency(e.debit) : '—'}</td>
                    <td className="px-3 py-2 text-right">{e.credit > 0 ? formatCurrency(e.credit) : '—'}</td>
                    <td className="px-3 py-2 font-sans text-stone-600 truncate max-w-xs">{e.description}</td>
                  </tr>
                ))}
                {(lineage.ledgerEntries || lineage.transactions || []).length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-4 text-center font-sans text-stone-400">
                      No ledger records directly tied to this entity.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
