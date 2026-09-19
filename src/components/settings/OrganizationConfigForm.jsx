import React from 'react';
import { Save } from 'lucide-react';

/**
 * @typedef {Object} ConfigSettings
 * @property {string} defaultPaymentTerms
 * @property {number} defaultOvertimeMultiplier
 * @property {number} weeklyOvertimeThreshold
 * @property {string} currencySymbol
 * @property {boolean} autoAccrueIncome
 * @property {boolean} autoAccrueAP
 */

/**
 * @typedef {Object} OrganizationConfigFormProps
 * @property {ConfigSettings} config
 * @property {(config: ConfigSettings) => void} setConfig
 * @property {(e: React.FormEvent) => void} onSave
 */

/**
 * OrganizationConfigForm Component
 * Renders the configuration form for operational parameters and automation rules.
 * 
 * @param {OrganizationConfigFormProps} props
 * @returns {React.ReactElement}
 */
export const OrganizationConfigForm = ({ config, setConfig, onSave }) => {
  return (
    <form onSubmit={onSave} className="space-y-4 text-xs">
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
            onChange={e => setConfig({ ...config, weeklyOvertimeThreshold: parseInt(e.target.value, 10) || 40 })}
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
  );
};
