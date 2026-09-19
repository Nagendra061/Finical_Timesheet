import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';

import { DashboardView } from './components/views/DashboardView';
import { EmployeesView } from './components/views/EmployeesView';
import { ClientsView } from './components/views/ClientsView';
import { JobsView } from './components/views/JobsView';
import { PlacementsView } from './components/views/PlacementsView';
import { TimesheetsView } from './components/views/TimesheetsView';
import { IncomeView } from './components/views/IncomeView';
import { AccountsReceivableView } from './components/views/AccountsReceivableView';
import { AccountsPayableView } from './components/views/AccountsPayableView';
import { TransactionLedgerView } from './components/views/TransactionLedgerView';
import { ReportsView } from './components/views/ReportsView';
import { ImportsView } from './components/views/ImportsView';
import { ImportHistoryView } from './components/views/ImportHistoryView';
import { TraceabilityView } from './components/views/TraceabilityView';
import { SettingsView } from './components/views/SettingsView';

/**
 * StaffingApp Component
 * Primary container managing active view navigation tabs and layout.
 *
 * @returns {React.ReactElement}
 */
export function StaffingApp() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const renderActiveView = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardView onNavigate={setCurrentTab} />;
      case 'employees':
        return <EmployeesView />;
      case 'clients':
        return <ClientsView />;
      case 'jobs':
        return <JobsView />;
      case 'placements':
        return <PlacementsView />;
      case 'timesheets':
        return <TimesheetsView />;
      case 'income':
        return <IncomeView />;
      case 'ar':
        return <AccountsReceivableView />;
      case 'ap':
        return <AccountsPayableView />;
      case 'ledger':
        return <TransactionLedgerView />;
      case 'reports':
        return <ReportsView />;
      case 'imports':
        return <ImportsView />;
      case 'history':
        return <ImportHistoryView />;
      case 'traceability':
        return <TraceabilityView />;
      case 'audit':
        return <SettingsView initialTab="audit" />;
      case 'settings':
        return <SettingsView initialTab="config" />;
      default:
        return <DashboardView onNavigate={setCurrentTab} />;
    }
  };

  return (
    <div id="staffing-system-root" className="min-h-screen bg-stone-100 text-stone-900 flex">
      {/* Primary Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen min-w-0">
        <Header
          currentTab={currentTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onNavigate={setCurrentTab}
        />

        <main id="main-content-view" className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}

/**
 * Root App Component
 * Integrates Redux Provider store and top-level staffing application tree.
 * 
 * @returns {React.ReactElement}
 */
export default function App() {
  return (
    <Provider store={store}>
      <StaffingApp />
    </Provider>
  );
}
