import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Download,
  RotateCcw,
  Search,
  Save,
  CheckCircle2,
  AlertCircle,
  Database
} from 'lucide-react';
import { useStaffing } from '../../context/StaffingContext';
import { Badge } from '../common/Badge';
import { formatDate, safeConfirm } from '../../utils/formatters';

interface SettingsViewProps {
  initialTab?: 'config' | 'audit' | 'database';
}

export const SettingsView: React.FC<SettingsViewProps> = ({ initialTab = 'config' }) => {
  const {
    auditLogs,
    exportFullDatabaseJSON,
    resetDatabaseToDefaults
  } = useStaffing();

  const [searchAudit, setSearchAudit] = useState('');
  const [activeTab, setActiveTab] = useState<'config' | 'audit' | 'database'>(initialTab);

  // Configuration state
  const [config, setConfig] = useState({
    defaultPaymentTerms: 'Net 30',
    defaultOvertimeMultiplier: 1.5,
    weeklyOvertimeThreshold: 40,
    currencySymbol: 'USD ($)',
    approvalRoleRequired: 'Manager / Director',
    autoAccrueIncome: true,
    autoAccrueAP: true,
  });
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const filteredLogs = auditLogs.filter(log =>
    `${log.id} ${log.action} ${log.entityType || log.entity} ${log.entityId} ${log.user} ${log.details || ''}`
      .toLowerCase()
      .includes(searchAudit.toLowerCase())
  );

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMessage('System operational configuration preferences updated successfully.');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleReset = () => {
    if (safeConfirm('Are you sure you want to reset the system to the initial Phase 1 seed data? All user changes will be reinitialized.')) {
      resetDatabaseToDefaults();
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Tabs */}
      <div className="flex border-b border-stone-200 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'config'
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Operational Settings
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'audit'
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Compliance Audit Trail ({auditLogs.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('database')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'database'
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          System-of-Record (JSON)
        </button>
      </div>

      {saveMessage && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Tab 1: Operational Settings */}
      {activeTab === 'config' && (
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs max-w-2xl">
          <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-stone-900 pb-2 border-b border-stone-100">
              Operational & Billing Defaults
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Default Client Payment Terms</label>
                <select
                  value={config.defaultPaymentTerms}
                  onChange={e => setConfig({ ...config, defaultPaymentTerms: e.target.value })}
                  className="w-full p-2 rounded-lg border border-stone-200 bg-white"
                >
                  <option value="Net 15">Net 15</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Net 45">Net 45</option>
                  <option value="Net 60">Net 60</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Standard Overtime Multiplier</label>
                <input
                  type="number"
                  step="0.1"
                  value={config.defaultOvertimeMultiplier}
                  onChange={e => setConfig({ ...config, defaultOvertimeMultiplier: parseFloat(e.target.value) || 1.5 })}
                  className="w-full p-2 rounded-lg border border-stone-200"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Weekly Standard Threshold (Hours)</label>
                <input
                  type="number"
                  value={config.weeklyOvertimeThreshold}
                  onChange={e => setConfig({ ...config, weeklyOvertimeThreshold: parseInt(e.target.value) || 40 })}
                  className="w-full p-2 rounded-lg border border-stone-200"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Reporting Currency</label>
                <input
                  type="text"
                  disabled
                  value={config.currencySymbol}
                  className="w-full p-2 rounded-lg border border-stone-200 bg-stone-100 text-stone-600"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 space-y-2">
              <h4 className="font-semibold text-stone-800">Operational Automation Controls</h4>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.autoAccrueIncome}
                  onChange={e => setConfig({ ...config, autoAccrueIncome: e.target.checked })}
                  className="rounded border-stone-300 text-stone-900"
                />
                <span className="text-stone-700">Auto-generate Income record upon Timesheet approval</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.autoAccrueAP}
                  onChange={e => setConfig({ ...config, autoAccrueAP: e.target.checked })}
                  className="rounded border-stone-300 text-stone-900"
                />
                <span className="text-stone-700">Auto-generate AP Bill payable upon Timesheet approval</span>
              </label>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Save className="w-4 h-4" />
                Save Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Compliance Audit Trail */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <input
                id="audit-search-input"
                type="text"
                placeholder="Search audit trail by user, entity, action..."
                value={searchAudit}
                onChange={e => setSearchAudit(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-stone-50 focus:bg-white text-stone-900"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5 pointer-events-none" />
            </div>
            <span className="text-xs text-stone-500 font-medium">
              {filteredLogs.length} Immutable Log Events
            </span>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table id="audit-logs-table" className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50/80 border-b border-stone-200 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Entity Type</th>
                    <th className="px-4 py-3">Entity ID</th>
                    <th className="px-4 py-3">User / Actor</th>
                    <th className="px-4 py-3">Audit Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-stone-50/60">
                      <td className="px-4 py-3 text-stone-600 whitespace-nowrap">
                        {formatDate(log.timestamp)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-stone-900">
                        <Badge
                          variant={
                            log.action.includes('CREATE') || log.action.includes('APPROVE')
                              ? 'success'
                              : log.action.includes('PAYMENT')
                              ? 'purple'
                              : log.action.includes('REJECT') || log.action.includes('DELETE')
                              ? 'danger'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {log.action}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-medium text-stone-800 capitalize">
                        {log.entityType || log.entity}
                      </td>
                      <td className="px-4 py-3 font-mono text-stone-600">
                        {log.entityId}
                      </td>
                      <td className="px-4 py-3 font-medium text-stone-900">
                        {log.user}
                      </td>
                      <td className="px-4 py-3 text-stone-600">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-stone-400">
                        No audit events match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: System of Record Database JSON */}
      {activeTab === 'database' && (
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs max-w-2xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-stone-900">Phase-1 JSON System-of-Record Storage</h3>
            <p className="text-xs text-stone-500 mt-1">
              Per specification, the system stores all entities, transactions, and audit records in persistent JSON schema storage.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-stone-900">Backup Complete Database (JSON)</h4>
                <p className="text-stone-500 text-[11px]">
                  Downloads a complete export file containing all employees, placements, timesheets, incomes, invoices, AP bills, and ledger transactions.
                </p>
              </div>
              <button
                type="button"
                onClick={exportFullDatabaseJSON}
                className="px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold flex items-center gap-1.5 shadow-xs shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                Export JSON
              </button>
            </div>

            <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-rose-900">Reset System Database</h4>
                <p className="text-stone-500 text-[11px]">
                  Reinitialize the application back to the standard Phase 1 seed dataset.
                </p>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-1.5 rounded-lg border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 font-semibold flex items-center gap-1.5 shadow-xs shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
