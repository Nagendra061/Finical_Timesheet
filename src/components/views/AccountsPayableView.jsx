import React, { useState, useMemo } from 'react';
import { Search, Eye, Send } from 'lucide-react';
import { useStaffing } from '../../hooks/useStaffing';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Pagination } from '../common/Pagination';
import { APBillTable } from '../accounts-payable/APBillTable';
import { formatCurrency, formatDate, getAPAgingCategory } from '../../utils/formatters';

/**
 * AccountsPayableView Component
 * Renders accounts payable obligations to workers and staffing contractors,
 * disbursement scheduling, and payroll fulfillment tracking.
 *
 * @returns {React.ReactElement}
 */
export const AccountsPayableView = () => {
  const {
    apBills,
    employees,
    placements,
    apPayments,
    recordAPPayment
  } = useStaffing();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeSubTab, setActiveSubTab] = useState('bills');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals
  const [selectedBill, setSelectedBill] = useState(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payingBill, setPayingBill] = useState(null);

  // Pay Form
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('ACH');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  const filteredBills = useMemo(() => {
    return apBills.filter(bill => {
      const emp = employees.find(e => e.id === bill.employeeId);
      const searchStr = `${bill.id} ${bill.timesheetId} ${emp?.firstName || ''} ${emp?.lastName || ''}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || bill.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [apBills, employees, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredBills.length / pageSize);
  const paginatedBills = filteredBills.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // AP Schedule Buckets
  const scheduleBuckets = useMemo(() => {
    const buckets = {
      Current: { count: 0, total: 0, bills: [] },
      'Due This Week': { count: 0, total: 0, bills: [] },
      'Due Next Week': { count: 0, total: 0, bills: [] },
      Overdue: { count: 0, total: 0, bills: [] },
    };

    apBills.forEach(bill => {
      if (bill.balance > 0) {
        const cat = getAPAgingCategory(bill.dueDate);
        if (buckets[cat]) {
          buckets[cat].count += 1;
          buckets[cat].total += bill.balance;
          buckets[cat].bills.push(bill);
        }
      }
    });

    return buckets;
  }, [apBills]);

  const totalAPOutstanding = Object.values(scheduleBuckets).reduce((acc, b) => acc + b.total, 0);

  const handleOpenPay = (bill) => {
    setPayingBill(bill);
    setPaymentAmount(bill.balance);
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('ACH');
    setReferenceNumber(`PAY-DIR-${Math.floor(100000 + Math.random() * 900000)}`);
    setPaymentNotes('Direct deposit worker disbursement');
    setIsPayModalOpen(true);
  };

  const handleRecordPaySubmit = (e) => {
    e.preventDefault();
    if (!payingBill || paymentAmount <= 0) return;

    recordAPPayment({
      apBillId: payingBill.id,
      amount: paymentAmount,
      paymentDate,
      paymentMethod,
      referenceNumber,
      notes: paymentNotes
    });

    setIsPayModalOpen(false);
    setPayingBill(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Sub-navigation */}
      <div className="flex border-b border-stone-200 gap-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('bills')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeSubTab === 'bills'
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Payable Bills ({apBills.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('schedule')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeSubTab === 'schedule'
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Disbursement Schedule ({formatCurrency(totalAPOutstanding)})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('disbursements')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeSubTab === 'disbursements'
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Payroll Disbursements ({apPayments.length})
        </button>
      </div>

      {/* Subtab 1: AP Bills */}
      {activeSubTab === 'bills' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <input
                  id="ap-search-input"
                  type="text"
                  placeholder="Search bills by ID, worker name..."
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-400 text-stone-900"
                />
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5 pointer-events-none" />
              </div>

              <select
                id="ap-status-filter"
                value={statusFilter}
                onChange={e => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs py-1.5 px-2.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700"
              >
                <option value="ALL">All Statuses</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
            <APBillTable
              bills={paginatedBills}
              employees={employees}
              onPay={handleOpenPay}
              onView={setSelectedBill}
            />

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredBills.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}

      {/* Subtab 2: Schedule */}
      {activeSubTab === 'schedule' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {Object.entries(scheduleBuckets).map(([bucket, data]) => {
              const isUrgent = bucket === 'Due This Week' || bucket === 'Overdue';
              return (
                <div
                  key={bucket}
                  className={`p-4 rounded-xl border bg-white shadow-xs ${
                    isUrgent && data.total > 0 ? 'border-rose-200 bg-rose-50/20' : 'border-stone-200'
                  }`}
                >
                  <p className="text-xs font-semibold text-stone-500">{bucket}</p>
                  <p className="text-xl font-bold text-stone-900 mt-1">{formatCurrency(data.total)}</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">{data.count} bills scheduled</p>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs">
            <h4 className="font-semibold text-stone-900 text-sm mb-3">Payables by Imminent Due Date</h4>
            <div className="space-y-2 max-h-96 overflow-y-auto divide-y divide-stone-100 text-xs">
              {apBills
                .filter(b => b.balance > 0)
                .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
                .map(bill => {
                  const emp = employees.find(e => e.id === bill.employeeId);
                  const cat = getAPAgingCategory(bill.dueDate);
                  return (
                    <div key={bill.id} className="pt-2 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-stone-900">{bill.id}</span>
                        <span className="text-stone-700 ml-2 font-medium">{emp ? `${emp.firstName} ${emp.lastName}` : bill.employeeId}</span>
                        <span className="block text-[11px] text-stone-400">Due: {formatDate(bill.dueDate)} (TS: {bill.timesheetId})</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-stone-900 block">{formatCurrency(bill.balance)}</span>
                        <Badge variant={cat === 'Overdue' ? 'danger' : cat === 'Due This Week' ? 'warning' : 'neutral'}>
                          {cat}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Subtab 3: Payroll Disbursements Log */}
      {activeSubTab === 'disbursements' && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50/80 border-b border-stone-200 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Disbursement ID</th>
                  <th className="px-4 py-3">AP Bill Reference</th>
                  <th className="px-4 py-3">Worker Recipient</th>
                  <th className="px-4 py-3">Date Disbursed</th>
                  <th className="px-4 py-3">Payment Method</th>
                  <th className="px-4 py-3">Reference #</th>
                  <th className="px-4 py-3 text-right">Amount Disbursed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {apPayments.map(p => {
                  const bill = apBills.find(b => b.id === p.apBillId);
                  const emp = bill ? employees.find(e => e.id === bill.employeeId) : null;
                  return (
                    <tr key={p.id} className="hover:bg-stone-50/60">
                      <td className="px-4 py-3 font-mono font-medium text-stone-900">{p.id}</td>
                      <td className="px-4 py-3 font-mono text-stone-600">{p.apBillId}</td>
                      <td className="px-4 py-3 font-medium text-stone-900">
                        {emp ? `${emp.firstName} ${emp.lastName}` : bill?.employeeId || '—'}
                      </td>
                      <td className="px-4 py-3 text-stone-600">{formatDate(p.paymentDate)}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-stone-100 font-mono text-[11px]">{p.paymentMethod}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-stone-600">{p.referenceNumber || 'N/A'}</td>
                      <td className="px-4 py-3 text-right font-bold text-rose-700">{formatCurrency(p.amount)}</td>
                    </tr>
                  );
                })}
                {apPayments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-stone-400">
                      No disbursements recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pay Worker Modal */}
      {payingBill && (
        <Modal
          isOpen={isPayModalOpen}
          onClose={() => setIsPayModalOpen(false)}
          title={`Disburse Worker Compensation: ${payingBill.id}`}
          subtitle={`Worker: ${employees.find(e => e.id === payingBill.employeeId)?.firstName} ${employees.find(e => e.id === payingBill.employeeId)?.lastName} • Balance Due: ${formatCurrency(payingBill.balance)}`}
          maxWidth="md"
        >
          <form onSubmit={handleRecordPaySubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-stone-700 mb-1">Disbursement Amount ($) *</label>
              <input
                id="ap-pay-amount"
                type="number"
                step="0.01"
                max={payingBill.balance}
                value={paymentAmount}
                onChange={e => setPaymentAmount(parseFloat(e.target.value) || 0)}
                className="w-full p-2 rounded-lg border border-stone-200 text-base font-bold text-stone-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Disbursement Date *</label>
                <input
                  id="ap-pay-date"
                  type="date"
                  value={paymentDate}
                  onChange={e => setPaymentDate(e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-200"
                />
              </div>
              <div>
                <label className="block font-medium text-stone-700 mb-1">Disbursement Channel *</label>
                <select
                  id="ap-pay-method"
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-200 bg-white"
                >
                  <option value="ACH">Direct Deposit (ACH)</option>
                  <option value="Check">Payroll Check</option>
                  <option value="Wire">Wire Transfer</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">Confirmation / Trace / Check #</label>
              <input
                id="ap-pay-ref"
                type="text"
                value={referenceNumber}
                onChange={e => setReferenceNumber(e.target.value)}
                placeholder="e.g. DD-847291 or Check #1042"
                className="w-full p-2 rounded-lg border border-stone-200"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">Notes</label>
              <input
                id="ap-pay-notes"
                type="text"
                value={paymentNotes}
                onChange={e => setPaymentNotes(e.target.value)}
                placeholder="Payroll batch reference or vendor notes"
                className="w-full p-2 rounded-lg border border-stone-200"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setIsPayModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-stone-200 text-stone-700 font-medium"
              >
                Cancel
              </button>
              <button
                id="confirm-disburse-submit"
                type="submit"
                className="px-4 py-2 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-semibold flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                Disburse Payment
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Bill Detail Modal */}
      {selectedBill && (
        <Modal
          isOpen={!!selectedBill}
          onClose={() => setSelectedBill(null)}
          title={`AP Bill ${selectedBill.id}`}
          subtitle={`Source Timesheet: ${selectedBill.timesheetId} • Due: ${formatDate(selectedBill.dueDate)}`}
          maxWidth="md"
        >
          {(() => {
            const emp = employees.find(e => e.id === selectedBill.employeeId);
            const placement = placements.find(p => p.id === selectedBill.placementId);

            return (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Worker / Contractor:</span>
                    <span className="font-bold text-stone-900">{emp?.firstName} {emp?.lastName} ({emp?.employeeType})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Contract Pay Rate:</span>
                    <span className="font-mono text-stone-800">${(selectedBill.payRate ?? selectedBill.regularRate ?? 0).toFixed(2)}/hr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Regular Hours:</span>
                    <span className="text-stone-800">{selectedBill.regularHours} hrs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Overtime Hours:</span>
                    <span className="text-stone-800">{selectedBill.overtimeHours} hrs (× {placement?.overtimeMultiplier || 1.5})</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-stone-200">
                    <span className="text-stone-700 font-medium">Total Bill Amount:</span>
                    <span className="font-bold text-stone-900">{formatCurrency(selectedBill.totalPayable)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>Disbursed to Date:</span>
                    <span className="font-bold">{formatCurrency(selectedBill.amountPaid)}</span>
                  </div>
                  <div className="flex justify-between text-rose-700 font-bold">
                    <span>Outstanding Payable:</span>
                    <span>{formatCurrency(selectedBill.balance)}</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
};
