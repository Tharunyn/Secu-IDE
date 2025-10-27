'use client';
import React from 'react';

interface OutputPanelProps {
  output: string;
}

const OutputPanel: React.FC<OutputPanelProps> = ({ output }) => {
  return (
    <div className="mt-4 p-3 bg-gray-800 rounded overflow-auto max-h-64 text-sm">
      <pre>{output || 'No output yet. Compile a contract.'}</pre>
    </div>
  );
};

export default OutputPanel;
