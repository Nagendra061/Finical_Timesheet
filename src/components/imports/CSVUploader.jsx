import React from 'react';
import { Upload, RefreshCw } from 'lucide-react';

/**
 * @typedef {Object} CSVUploaderProps
 * @property {string} entityType
 * @property {string} fileName
 * @property {string} csvRawContent
 * @property {(content: string) => void} onContentChange
 * @property {(file: File) => void} onFileSelected
 * @property {() => void} onValidate
 */

/**
 * CSVUploader Component
 * Provides file upload and raw CSV editing interface for bulk data imports.
 * 
 * @param {CSVUploaderProps} props
 * @returns {React.ReactElement}
 */
export const CSVUploader = ({
  entityType,
  fileName,
  csvRawContent,
  onContentChange,
  onFileSelected,
  onValidate
}) => {
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
  };

  return (
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
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      <textarea
        id="csv-raw-editor"
        rows={7}
        value={csvRawContent}
        onChange={e => onContentChange(e.target.value)}
        placeholder="Paste CSV rows here..."
        className="w-full font-mono text-xs p-3 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-stone-400"
      />

      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-stone-500">
          Click validate to verify headers, required fields, and relational foreign keys.
        </span>
        <button
          id="run-csv-validate-btn"
          type="button"
          onClick={onValidate}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Validate CSV Content
        </button>
      </div>
    </div>
  );
};
