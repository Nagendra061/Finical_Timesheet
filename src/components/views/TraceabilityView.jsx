import React, { useState } from 'react';
import { GitCommit } from 'lucide-react';
import { useStaffing } from '../../hooks/useStaffing';
import { TraceabilityExplorer } from '../traceability/TraceabilityExplorer';

/**
 * TraceabilityView Component
 * Renders full end-to-end audit traceability across all linked operational and financial entities.
 *
 * @returns {React.ReactElement}
 */
export const TraceabilityView = () => {
  const {
    getTraceabilityLineage,
    timesheets,
    invoices,
    apBills
  } = useStaffing();

  const [searchTargetId, setSearchTargetId] = useState('TS-001');
  const [selectedEntityId, setSelectedEntityId] = useState('TS-001');

  const lineage = getTraceabilityLineage(selectedEntityId);

  const handleSearch = (e) => {
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

      {/* Visual Pipeline Component */}
      <TraceabilityExplorer selectedEntityId={selectedEntityId} lineage={lineage} />
    </div>
  );
};
