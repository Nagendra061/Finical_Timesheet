import React, { useState } from 'react';
import {
  History,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Calendar,
  Search
} from 'lucide-react';
import { useStaffing } from '../../context/StaffingContext';
import { ImportBatch } from '../../types';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { formatDate } from '../../utils/formatters';

export const ImportHistoryView: React.FC = () => {
  const { importBatches } = useStaffing();
  const [selectedBatch, setSelectedBatch] = useState<ImportBatch | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBatches = importBatches.filter(b =>
    `${b.id} ${b.fileName} ${b.entityType || b.fileType}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <input
            id="history-search-input"
            type="text"
            placeholder="Search batches by ID, file name, entity..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-stone-50 focus:bg-white text-stone-900"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5 pointer-events-none" />
        </div>
        <span className="text-xs text-stone-500 font-medium">
          {importBatches.length} Historical Import Batches Logged
        </span>
      </div>

      {/* Batches Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table id="import-history-table" className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50/80 border-b border-stone-200 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Batch ID</th>
                <th className="px-4 py-3">File Name</th>
                <th className="px-4 py-3">Entity Type</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3 text-center">Total Rows</th>
                <th className="px-4 py-3 text-center">Imported</th>
                <th className="px-4 py-3 text-center">Rejected</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredBatches.map(b => (
                <tr key={b.id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="px-4 py-3 font-mono font-medium text-stone-900 whitespace-nowrap">
                    {b.id}
                  </td>
                  <td className="px-4 py-3 font-semibold text-stone-900 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-stone-400" />
                    <span>{b.fileName}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="purple">{b.entityType || b.fileType}</Badge>
                  </td>
                  <td className="px-4 py-3 text-stone-600 whitespace-nowrap">
                    {formatDate(b.importedAt || b.receivedDate)}
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-stone-900">{b.totalRows ?? b.recordsRead}</td>
                  <td className="px-4 py-3 text-center font-bold text-emerald-700">{b.importedRows ?? b.recordsImported}</td>
                  <td className="px-4 py-3 text-center font-bold text-rose-700">{b.rejectedRows ?? b.recordsRejected}</td>
                  <td className="px-4 py-3">
                    <Badge variant={b.status === 'Completed' ? 'success' : 'warning'}>
                      {b.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      id={`inspect-batch-${b.id}`}
                      type="button"
                      onClick={() => setSelectedBatch(b)}
                      className="p-1 rounded text-stone-500 hover:text-stone-900 hover:bg-stone-100"
                      title="Inspect Batch Log"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredBatches.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-stone-400">
                    No import batches found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batch Details Modal */}
      {selectedBatch && (
        <Modal
          isOpen={!!selectedBatch}
          onClose={() => setSelectedBatch(null)}
          title={`Import Batch ${selectedBatch.id}`}
          subtitle={`${selectedBatch.fileName} • Imported on ${formatDate(selectedBatch.importedAt || selectedBatch.receivedDate)}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                <span className="text-stone-500 text-[10px] block">Total Rows</span>
                <span className="text-base font-bold text-stone-900">{selectedBatch.totalRows ?? selectedBatch.recordsRead}</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <span className="text-emerald-800 text-[10px] block">Imported Successfully</span>
                <span className="text-base font-bold text-emerald-700">{selectedBatch.importedRows ?? selectedBatch.recordsImported}</span>
              </div>
              <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
                <span className="text-rose-800 text-[10px] block">Rejected Rows</span>
                <span className="text-base font-bold text-rose-700">{selectedBatch.rejectedRows ?? selectedBatch.recordsRejected}</span>
              </div>
            </div>

            {selectedBatch.errors && selectedBatch.errors.length > 0 ? (
              <div>
                <h4 className="font-semibold text-rose-900 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Row-by-Row Rejection Details:
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedBatch.errors.map((err, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-rose-50/60 border border-rose-200">
                      <div className="flex justify-between font-semibold text-rose-950">
                        <span>Row #{err.rowIndex ?? err.row}</span>
                        <span className="text-[11px] text-rose-700">{err.errors ? err.errors.join(', ') : err.error}</span>
                      </div>
                      <pre className="text-[10px] font-mono text-stone-600 mt-1 overflow-x-auto">
                        {JSON.stringify(err.rawRow || err.rawData || {})}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-stone-400">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                No errors encountered during ingestion. 100% clean batch.
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
