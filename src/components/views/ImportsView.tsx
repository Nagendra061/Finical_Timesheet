import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Download,
  ArrowRight,
  Eye,
  RefreshCw,
  Info
} from 'lucide-react';
import { useStaffing } from '../../context/StaffingContext';
import { ImportEntityType, CSVValidationResult } from '../../types';
import { validateCSVData, SAMPLE_CSV_TEMPLATES } from '../../utils/csvHelper';
import { Badge } from '../common/Badge';

export const ImportsView: React.FC = () => {
  const { employees, clients, placements, processCSVImport } = useStaffing();

  const [entityType, setEntityType] = useState<ImportEntityType>('employees');
  const [csvRawContent, setCsvRawContent] = useState<string>(SAMPLE_CSV_TEMPLATES.employees);
  const [fileName, setFileName] = useState<string>('employees-sample.csv');
  const [validationResult, setValidationResult] = useState<CSVValidationResult | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelectTemplate = (type: ImportEntityType) => {
    setEntityType(type);
    setCsvRawContent(SAMPLE_CSV_TEMPLATES[type]);
    setFileName(`${type}-template.csv`);
    setValidationResult(null);
    setImportStatus(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = evt => {
      const text = evt.target?.result as string;
      setCsvRawContent(text);
      setValidationResult(null);
      setImportStatus(null);
    };
    reader.readAsText(file);
  };

  const handleRunValidation = () => {
    if (!csvRawContent.trim()) return;
    const existingIds = {
      employees: employees.map(e => e.id),
      clients: clients.map(c => c.id),
      placements: placements.map(p => p.id),
    };
    const result = validateCSVData(csvRawContent, entityType, existingIds);
    setValidationResult(result);
    setImportStatus(null);
  };

  const handleExecuteImport = () => {
    if (!validationResult || validationResult.validRows.length === 0) return;

    setIsProcessing(true);
    setTimeout(() => {
      const batch = processCSVImport(entityType as any, csvRawContent, fileName);
      setIsProcessing(false);
      setImportStatus(`Batch ${batch.id} imported successfully: ${batch.recordsImported} record(s) persisted, ${batch.recordsRejected} row(s) skipped.`);
    }, 400);
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV_TEMPLATES[entityType]], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entityType}-sample.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Info */}
      <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-stone-900">CSV Import & Validation Engine</h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Phase 1 bulk ingestion supporting master records, operational timesheets, and remittances
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download {entityType}.csv Template
          </button>
        </div>
      </div>

      {importStatus && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs animate-fade-in shadow-xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-semibold text-emerald-950">CSV Import Completed</p>
              <p className="text-emerald-800 text-[11px] mt-0.5">{importStatus}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setImportStatus(null)}
            className="text-stone-400 hover:text-stone-700 font-bold p-1 text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Choose Entity Type and Sample Template */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
            1. Select Target Data Entity
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {(['employees', 'clients', 'placements', 'timesheets', 'payments'] as ImportEntityType[]).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => handleSelectTemplate(type)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize border transition-all text-left ${
                  entityType === type
                    ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Upload Zone & Editor */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
              2. Upload File or Edit CSV Data ({fileName})
            </label>
            <label
              htmlFor="csv-file-input"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium cursor-pointer border border-stone-200"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Local .CSV
              <input
                id="csv-file-input"
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <textarea
            id="csv-raw-editor"
            rows={7}
            value={csvRawContent}
            onChange={e => {
              setCsvRawContent(e.target.value);
              setValidationResult(null);
            }}
            placeholder="Paste CSV rows here..."
            className="w-full font-mono text-xs p-3 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-stone-400"
          />
        </div>

        {/* Validate Button */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-stone-500">
            Click validate to verify headers, required fields, and relational foreign keys.
          </span>
          <button
            id="run-csv-validate-btn"
            type="button"
            onClick={handleRunValidation}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Validate CSV Content
          </button>
        </div>
      </div>

      {/* Validation Results Panel */}
      {validationResult && (
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h4 className="font-bold text-stone-900 text-sm">Validation Results Summary</h4>
              <p className="text-xs text-stone-500">
                Target Entity: <span className="font-semibold capitalize text-stone-800">{entityType}</span>
              </p>
            </div>
            {validationResult.validRows.length > 0 && (
              <button
                id="execute-import-btn"
                type="button"
                disabled={isProcessing}
                onClick={handleExecuteImport}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-semibold shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Import {validationResult.validRows.length} Valid Record(s)</span>
              </button>
            )}
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-lg bg-stone-50 border border-stone-200">
              <span className="text-xs text-stone-500 font-medium">Total Rows</span>
              <p className="text-xl font-bold text-stone-900 mt-0.5">{validationResult.totalRows}</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <span className="text-xs text-emerald-800 font-medium">Valid Rows</span>
              <p className="text-xl font-bold text-emerald-700 mt-0.5">{validationResult.validRows.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200">
              <span className="text-xs text-rose-800 font-medium">Rejected Rows</span>
              <p className="text-xl font-bold text-rose-700 mt-0.5">{validationResult.rejectedRows.length}</p>
            </div>
          </div>

          {/* Rejected Rows Inspector */}
          {validationResult.rejectedRows.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Row-Level Validation Errors Detected ({validationResult.rejectedRows.length}):
              </span>
              <div className="space-y-1.5 max-h-56 overflow-y-auto">
                {validationResult.rejectedRows.map((rej: any, i: number) => (
                  <div key={i} className="p-2.5 rounded-lg bg-rose-50/50 border border-rose-200 text-xs">
                    <div className="flex items-center justify-between text-rose-900 font-semibold">
                      <span>Row #{rej.rowIndex}</span>
                      <span className="text-[11px] text-rose-700">{rej.errors.join(', ')}</span>
                    </div>
                    <pre className="font-mono text-[10px] text-stone-600 mt-1 overflow-x-auto">
                      {JSON.stringify(rej.rawRow)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Valid Rows Preview */}
          {validationResult.validRows.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Preview of Valid Structured Records ({validationResult.validRows.length}):
              </span>
              <div className="border border-stone-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100 text-stone-600 font-semibold">
                    <tr>
                      <th className="px-3 py-2">Row #</th>
                      <th className="px-3 py-2">Parsed Record Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {validationResult.validRows.map((vr: any) => (
                      <tr key={vr.rowIndex}>
                        <td className="px-3 py-2 font-mono font-medium text-stone-500 w-16">
                          #{vr.rowIndex}
                        </td>
                        <td className="px-3 py-2 font-mono text-[11px] text-stone-800">
                          {Object.entries(vr.data)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(' | ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
