/**
 * Header
 *
 * Top navigation bar containing dynamic route headers, contextual subtitles,
 * omni-search bar with entity drop-down, operational notifications,
 * database backup export/reset tools, and user profile management.
 *
 * Data Source:
 * Redux store via useStaffing hook
 *
 * Props:
 * @param {string} currentTab - Current active navigation key
 * @param {() => void} onOpenMobileSidebar - Mobile menu toggle
 * @param {(tab: string) => void} onNavigate - Navigation routing handler
 */

import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  RotateCcw,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { useStaffing } from '../../hooks/useStaffing';
import { formatCurrency, formatDate, safeConfirm } from '../../utils/formatters';

export const Header = ({
  currentTab,
  onOpenMobileSidebar,
  onNavigate,
}) => {
  const {
    timesheets = [],
    invoices = [],
    apBills = [],
    employees = [],
    clients = [],
    resetToInitialData,
    exportSystemDataJSON
  } = useStaffing();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const titles = {
    dashboard: { title: 'Staffing Dashboard', subtitle: 'Real-time financial performance, AR/AP aging & operational KPIs' },
    employees: { title: 'Employees & Contractors', subtitle: 'Manage W2 staff, 1099 contractors, assignments and hire records' },
    clients: { title: 'Clients & Accounts', subtitle: 'Client profiles, commercial terms, billing contacts and active placements' },
    jobs: { title: 'Jobs & Requisitions', subtitle: 'Client staffing requisitions, departments and open assignment roles' },
    placements: { title: 'Placements & Assignments', subtitle: 'Core operational links connecting workers to clients with pay & bill rates' },
    timesheets: { title: 'Timesheet Management', subtitle: 'Daily hour entries, multi-tier approvals, and financial transaction generation' },
    income: { title: 'Income & Revenue', subtitle: 'Approved timesheet revenue ledger and unbilled-to-invoice generation' },
    ar: { title: 'Accounts Receivable', subtitle: 'Client invoices, payment remittance tracking and aging analysis' },
    ap: { title: 'Accounts Payable', subtitle: 'Worker compensation obligations, AP bills and disbursement tracking' },
    imports: { title: 'CSV Import Pipeline', subtitle: 'Upload and validate master data, timesheets and payment remittances' },
    history: { title: 'Import History & Batches', subtitle: 'Review historical imports, audit statistics, and row-level rejection logs' },
    reports: { title: 'Financial & Operational Reports', subtitle: 'Revenue by client, employee profitability, margin analysis and AR/AP aging' },
    ledger: { title: 'Transaction Ledger', subtitle: 'Traceable double-entry financial log for revenue, AP and cash movements' },
    audit: { title: 'Audit Trail & Compliance', subtitle: 'Complete system action history with user timestamps and value changes' },
    traceability: { title: 'End-to-End Traceability Explorer', subtitle: 'Trace operational lineage: Employee → Placement → Timesheet → Income → Invoice → AR' },
    settings: { title: 'System Settings', subtitle: 'Organization configuration, numbering conventions, and JSON data store' },
  };

  const pendingApprovals = timesheets.filter(t => t.status === 'Submitted');
  const overdueInvoices = invoices.filter(i => i.status === 'Overdue');
  const totalNotifications = pendingApprovals.length + overdueInvoices.length;

  const showFeedback = (msg) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const handleExport = () => {
    const jsonStr = exportSystemDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `staffing-system-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showFeedback('System JSON backup exported successfully.');
  };

  const handleReset = () => {
    if (safeConfirm('Reset all records to initial realistic sample data? Any unexported edits will be replaced.')) {
      resetToInitialData();
      showFeedback('Database reset to initial sample data.');
    }
  };

  // Global search filtering
  const matchingEmployees = searchQuery.trim()
    ? employees.filter(e =>
        `${e.firstName} ${e.lastName} ${e.id} ${e.email}`.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 3)
    : [];

  const matchingClients = searchQuery.trim()
    ? clients.filter(c =>
        `${c.name} ${c.id} ${c.primaryContactName}`.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 3)
    : [];

  const matchingTimesheets = searchQuery.trim()
    ? timesheets.filter(t =>
        `${t.id} ${t.employeeId} ${t.clientId}`.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 3)
    : [];

  const matchingInvoices = searchQuery.trim()
    ? invoices.filter(i =>
        `${i.invoiceNumber} ${i.id} ${i.clientId}`.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 3)
    : [];

  const totalResults =
    matchingEmployees.length + matchingClients.length + matchingTimesheets.length + matchingInvoices.length;

  return (
    <header id="app-header" className="h-16 bg-white border-b border-stone-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          id="mobile-sidebar-toggle"
          type="button"
          onClick={onOpenMobileSidebar}
          className="p-2 rounded-lg text-stone-600 hover:bg-stone-100 lg:hidden cursor-pointer"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-stone-900 leading-tight">
              {titles[currentTab]?.title || 'Staffing Management'}
            </h2>
            <span className="hidden md:inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-stone-100 text-stone-600 border border-stone-200">
              Sep 18, 2026 (Operational Cycle)
            </span>
          </div>
          <p className="hidden sm:block text-xs text-stone-500 truncate max-w-md">
            {titles[currentTab]?.subtitle}
          </p>
        </div>
      </div>

      {/* Center/Right: Global Search, Quick Tools, Notifications, User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Feedback pill */}
        {feedbackMessage && (
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 animate-fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Global Search Bar */}
        <div className="relative">
          <div className="flex items-center">
            <input
              id="global-search-input"
              type="text"
              placeholder="Quick search (ID, Client, Worker)..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(e.target.value.trim().length > 0);
              }}
              onFocus={() => {
                if (searchQuery.trim().length > 0) setIsSearchOpen(true);
              }}
              className="w-36 sm:w-60 md:w-72 pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-400 text-stone-900 placeholder:text-stone-400"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 pointer-events-none" />
          </div>

          {/* Search Dropdown */}
          {isSearchOpen && (
            <div
              id="global-search-dropdown"
              className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-stone-200 p-2 z-50 text-xs"
            >
              <div className="flex items-center justify-between px-2 py-1.5 border-b border-stone-100 font-semibold text-stone-500">
                <span>Search Results</span>
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  Close
                </button>
              </div>

              {totalResults === 0 ? (
                <div className="py-4 text-center text-stone-400">
                  No records matching "{searchQuery}"
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
                  {matchingEmployees.length > 0 && (
                    <div className="py-1">
                      <span className="px-2 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                        Employees ({matchingEmployees.length})
                      </span>
                      {matchingEmployees.map(emp => (
                        <button
                          key={emp.id}
                          type="button"
                          onClick={() => {
                            onNavigate('employees');
                            setIsSearchOpen(false);
                          }}
                          className="w-full text-left px-2 py-1.5 hover:bg-stone-50 rounded flex items-center justify-between cursor-pointer"
                        >
                          <div>
                            <p className="font-semibold text-stone-900">{emp.firstName} {emp.lastName}</p>
                            <p className="text-stone-500 text-[10px]">{emp.id} • {emp.employeeType} • {emp.department}</p>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-700">{emp.status}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {matchingClients.length > 0 && (
                    <div className="py-1">
                      <span className="px-2 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                        Clients ({matchingClients.length})
                      </span>
                      {matchingClients.map(cli => (
                        <button
                          key={cli.id}
                          type="button"
                          onClick={() => {
                            onNavigate('clients');
                            setIsSearchOpen(false);
                          }}
                          className="w-full text-left px-2 py-1.5 hover:bg-stone-50 rounded flex items-center justify-between cursor-pointer"
                        >
                          <div>
                            <p className="font-semibold text-stone-900">{cli.name}</p>
                            <p className="text-stone-500 text-[10px]">{cli.id} • {cli.primaryContactName}</p>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-700">{cli.paymentTerms}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {matchingTimesheets.length > 0 && (
                    <div className="py-1">
                      <span className="px-2 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                        Timesheets ({matchingTimesheets.length})
                      </span>
                      {matchingTimesheets.map(ts => (
                        <button
                          key={ts.id}
                          type="button"
                          onClick={() => {
                            onNavigate('timesheets');
                            setIsSearchOpen(false);
                          }}
                          className="w-full text-left px-2 py-1.5 hover:bg-stone-50 rounded flex items-center justify-between cursor-pointer"
                        >
                          <div>
                            <p className="font-semibold text-stone-900">{ts.id}</p>
                            <p className="text-stone-500 text-[10px]">{ts.periodStartDate} to {ts.periodEndDate} ({ts.totalHours} hrs)</p>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">{ts.status}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {matchingInvoices.length > 0 && (
                    <div className="py-1">
                      <span className="px-2 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                        Invoices ({matchingInvoices.length})
                      </span>
                      {matchingInvoices.map(inv => (
                        <button
                          key={inv.id}
                          type="button"
                          onClick={() => {
                            onNavigate('ar');
                            setIsSearchOpen(false);
                          }}
                          className="w-full text-left px-2 py-1.5 hover:bg-stone-50 rounded flex items-center justify-between cursor-pointer"
                        >
                          <div>
                            <p className="font-semibold text-stone-900">{inv.invoiceNumber}</p>
                            <p className="text-stone-500 text-[10px]">{formatCurrency(inv.total)} • Due: {formatDate(inv.dueDate)}</p>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-100 text-sky-800">{inv.status}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Export JSON Button */}
        <button
          id="header-export-json"
          type="button"
          onClick={handleExport}
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg border border-stone-200 transition-colors cursor-pointer"
          title="Export complete JSON system of record"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Export JSON</span>
        </button>

        {/* Reset Demo Data Button */}
        <button
          id="header-reset-demo"
          type="button"
          onClick={handleReset}
          className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg border border-stone-200 transition-colors flex items-center gap-1 cursor-pointer"
          title="Reset database to initial sample data"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Reset Data</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            id="notifications-button"
            type="button"
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsProfileOpen(false);
            }}
            className="relative p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {totalNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {isNotificationsOpen && (
            <div
              id="notifications-dropdown"
              className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-stone-200 p-3 z-50 text-xs"
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100 font-semibold text-stone-900">
                <span>Alerts & Notifications</span>
                <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">
                  {totalNotifications} New
                </span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {pendingApprovals.map(t => (
                  <div
                    key={t.id}
                    onClick={() => {
                      onNavigate('timesheets');
                      setIsNotificationsOpen(false);
                    }}
                    className="p-2 rounded-lg bg-amber-50/70 border border-amber-200 cursor-pointer hover:bg-amber-100/60"
                  >
                    <div className="flex items-center gap-1.5 text-amber-800 font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Pending Timesheet Approval</span>
                    </div>
                    <p className="text-stone-700 text-[11px] mt-0.5">
                      Timesheet {t.id} ({t.totalHours} hrs) is waiting for review.
                    </p>
                  </div>
                ))}

                {overdueInvoices.map(inv => (
                  <div
                    key={inv.id}
                    onClick={() => {
                      onNavigate('ar');
                      setIsNotificationsOpen(false);
                    }}
                    className="p-2 rounded-lg bg-rose-50/70 border border-rose-200 cursor-pointer hover:bg-rose-100/60"
                  >
                    <div className="flex items-center gap-1.5 text-rose-800 font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Overdue Client Invoice</span>
                    </div>
                    <p className="text-stone-700 text-[11px] mt-0.5">
                      {inv.invoiceNumber} balance of {formatCurrency(inv.balance)} is past due.
                    </p>
                  </div>
                ))}

                {totalNotifications === 0 && (
                  <div className="py-6 text-center text-stone-400">
                    <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-500" />
                    All timesheets and invoices are up to date!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            id="user-profile-button"
            type="button"
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotificationsOpen(false);
            }}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-stone-100 text-left transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-xs">
              JD
            </div>
            <div className="hidden xl:block leading-tight">
              <span className="font-semibold text-xs text-stone-900 block">Johnathan Doe</span>
              <span className="text-[10px] text-stone-500 block">Finance Operations</span>
            </div>
          </button>

          {isProfileOpen && (
            <div
              id="user-profile-dropdown"
              className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-stone-200 p-2 z-50 text-xs"
            >
              <div className="p-2 border-b border-stone-100">
                <p className="font-semibold text-stone-900">Johnathan Doe</p>
                <p className="text-stone-500 text-[11px]">j.doe@apexstaffing.com</p>
                <p className="text-[10px] text-emerald-700 font-medium mt-1">Staffing Administrator</p>
              </div>
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('settings');
                    setIsProfileOpen(false);
                  }}
                  className="w-full text-left px-2 py-1.5 hover:bg-stone-50 rounded text-stone-700 font-medium cursor-pointer"
                >
                  Organization Settings
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('ledger');
                    setIsProfileOpen(false);
                  }}
                  className="w-full text-left px-2 py-1.5 hover:bg-stone-50 rounded text-stone-700 font-medium cursor-pointer"
                >
                  Transaction Ledger
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('audit');
                    setIsProfileOpen(false);
                  }}
                  className="w-full text-left px-2 py-1.5 hover:bg-stone-50 rounded text-stone-700 font-medium cursor-pointer"
                >
                  Audit Trail
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
