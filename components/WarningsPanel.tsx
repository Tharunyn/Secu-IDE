'use client';
import React from 'react';

interface Warning {
  type: string;
  message: string;
  line: number;
}

interface PanelProps {
  warnings: Warning[];
}

const WarningsPanel: React.FC<PanelProps> = ({ warnings }) => {
  if (!warnings.length) return <div>No warnings found ✅</div>;

  return (
    <div className="bg-gray-900 text-white p-4 rounded mt-2 max-h-64 overflow-y-auto">
      {warnings.map((w, i) => (
        <div key={i} className="mb-2 border-b border-gray-700 pb-1">
          <strong>{w.type}</strong>: {w.message} <em>(Line {w.line})</em>
        </div>
      ))}
    </div>
  );
};

export default WarningsPanel;
