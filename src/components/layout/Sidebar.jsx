/**
 * Sidebar
 *
 * Primary navigation sidebar for the Staffing Financial Management System.
 * Displays brand identity, module navigation grouped by operational domain,
 * real-time badge counters for urgent tasks, and mobile drawer responsiveness.
 *
 * Data Source:
 * Redux store via useStaffing hook
 *
 * Props:
 * @param {string} currentTab - Active navigation identifier
 * @param {(tab: string) => void} onTabChange - Tab change handler
 * @param {boolean} isOpenMobile - Mobile drawer open state
 * @param {() => void} onCloseMobile - Mobile drawer close handler
 */

import React from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  UserCheck,
  CalendarClock,
  CircleDollarSign,
  Receipt,
  CreditCard,
  FileSpreadsheet,
  History,
  BarChart3,
  BookOpen,
  ShieldCheck,
  GitBranch,
  Settings,
  X,
  ChevronRight
} from 'lucide-react';
import { useStaffing } from '../../hooks/useStaffing';

export const Sidebar = ({
  currentTab,
  onTabChange,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { timesheets = [], invoices = [], apBills = [], config = {} } = useStaffing();

  // Badges for operational urgency
  const pendingTimesheets = timesheets.filter(t => t.status === 'Submitted').length;
  const overdueInvoices = invoices.filter(i => i.status === 'Overdue' || (i.status === 'Open' && i.balance > 0)).length;
  const unpaidBills = apBills.filter(b => b.status === 'Unpaid' || b.status === 'Overdue').length;

  const navGroups = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ]
    },
    {
      title: 'MASTER DATA',
      items: [
        { id: 'employees', label: 'Employees', icon: Users },
        { id: 'clients', label: 'Clients', icon: Building2 },
        { id: 'jobs', label: 'Jobs & Requisitions', icon: Briefcase },
        { id: 'placements', label: 'Placements', icon: UserCheck },
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        {
          id: 'timesheets',
          label: 'Timesheets',
          icon: CalendarClock,
          badge: pendingTimesheets > 0 ? pendingTimesheets : undefined,
          badgeColor: 'bg-amber-100 text-amber-800'
        },
        { id: 'income', label: 'Income & Revenue', icon: CircleDollarSign },
      ]
    },
    {
      title: 'FINANCIALS',
      items: [
        {
          id: 'ar',
          label: 'Accounts Receivable',
          icon: Receipt,
          badge: overdueInvoices > 0 ? overdueInvoices : undefined,
          badgeColor: 'bg-sky-100 text-sky-800'
        },
        {
          id: 'ap',
          label: 'Accounts Payable',
          icon: CreditCard,
          badge: unpaidBills > 0 ? unpaidBills : undefined,
          badgeColor: 'bg-rose-100 text-rose-800'
        },
        { id: 'ledger', label: 'Transaction Ledger', icon: BookOpen },
        { id: 'reports', label: 'Reports', icon: BarChart3 },
      ]
    },
    {
      title: 'DATA & AUDIT',
      items: [
        { id: 'imports', label: 'CSV Imports', icon: FileSpreadsheet },
        { id: 'history', label: 'Import History', icon: History },
        { id: 'traceability', label: 'Traceability Explorer', icon: GitBranch },
        { id: 'audit', label: 'Audit Trail', icon: ShieldCheck },
        { id: 'settings', label: 'Settings', icon: Settings },
      ]
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          id="sidebar-mobile-backdrop"
          className="fixed inset-0 z-40 bg-stone-900/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-stone-900 text-stone-300 border-r border-stone-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 px-5 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-stone-950 font-bold text-sm tracking-wider shadow-xs">
              SF
            </div>
            <div className="leading-tight">
              <h1 className="font-semibold text-stone-100 text-sm tracking-tight truncate max-w-[150px]">
                {config.name || 'Apex Staffing'}
              </h1>
              <p className="text-[11px] text-stone-400 font-medium">Financial & Timesheet</p>
            </div>
          </div>
          <button
            id="close-mobile-sidebar"
            type="button"
            onClick={onCloseMobile}
            className="p-1 rounded-md text-stone-400 hover:text-white lg:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin scrollbar-thumb-stone-800">
          {navGroups.map(group => (
            <div key={group.title} className="space-y-1">
              <p className="px-3 text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
                {group.title}
              </p>
              {group.items.map(item => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-item-${item.id}`}
                    type="button"
                    onClick={() => {
                      onTabChange(item.id);
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-stone-800 text-white font-semibold'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-stone-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${item.badgeColor || 'bg-stone-700 text-stone-200'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom system status */}
        <div className="p-3 border-t border-stone-800 text-stone-400 bg-stone-950/40">
          <div className="px-2 py-2 rounded-md bg-stone-900 border border-stone-800/80 flex items-center justify-between text-[11px]">
            <div>
              <div className="flex items-center gap-1.5 font-medium text-stone-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Phase 1 Active
              </div>
              <p className="text-[10px] text-stone-400">JSON & Redux Store</p>
            </div>
            <button
              id="sidebar-trace-quick"
              type="button"
              onClick={() => onTabChange('traceability')}
              className="p-1 rounded text-stone-400 hover:text-emerald-400 cursor-pointer"
              title="Traceability Explorer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
