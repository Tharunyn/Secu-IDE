'use client';
import React from 'react';
import { Warning } from './CodeEditor';

interface WarningsPanelProps {
  warnings: Warning[];
}

const WarningsPanel: React.FC<WarningsPanelProps> = ({ warnings }) => {
  if (!warnings.length) return <div className="text-white mt-2">No warnings found ✅</div>;

  return (
    <div className="bg-gray-800 text-white p-4 rounded mt-2 max-h-64 overflow-y-auto">
      {warnings.map((w, i) => (
        <div
          key={i}
          className={`mb-2 border-b pb-1 ${
            w.type === 'Critical' ? 'border-red-500 text-red-400' : 'border-yellow-400 text-yellow-300'
          }`}
        >
          <strong>{w.type}</strong>: {w.message} <em>(Line {w.line})</em>
        </div>
      ))}
    </div>
  );
};

export default WarningsPanel;
