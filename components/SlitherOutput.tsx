'use client';
import React from 'react';

interface SlitherOutputProps {
  output: string;
  errors: string;
  loading: boolean;
}

const SlitherOutput: React.FC<SlitherOutputProps> = ({ output, errors, loading }) => (
  <div className="mt-4 p-3 bg-gray-900 rounded overflow-auto max-h-64 text-xs border border-yellow-500">
    <strong className="block text-yellow-300 mb-2">Slither Security Analysis</strong>
    {loading && <div className="text-yellow-300">Running Slither analysis...</div>}
    {errors && <pre className="text-red-400 whitespace-pre-wrap">{errors}</pre>}
    {!loading && !errors && output && <pre className="whitespace-pre-wrap">{output}</pre>}
    {!loading && !errors && !output && <div className="text-gray-500">No results yet. Click 'Run Test'!</div>}
  </div>
);

export default SlitherOutput;




