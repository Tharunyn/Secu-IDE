'use client';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';

const MonacoEditor = dynamic(() => import('react-monaco-editor'), { ssr: false });

interface CodeEditorProps {
  onAnalysis?: (warnings: any[]) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ onAnalysis }) => {
  const [code, setCode] = useState('');
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleChange = (newCode: string) => {
    setCode(newCode);

    if (timeoutId) clearTimeout(timeoutId);

    // Debounce API call
    const id = setTimeout(() => analyzeCode(newCode), 1500);
    setTimeoutId(id);
  };

  const analyzeCode = async (code: string) => {
    try {
      const response = await axios.post('http://YOUR_DOCKER_HOST:PORT/analyze', { code });
      onAnalysis?.(response.data.warnings || []);
    } catch (err) {
      console.error('Analysis failed', err);
      onAnalysis?.([]);
    }
  };

  return (
    <MonacoEditor
      height="70vh"
      language="solidity"
      theme="vs-dark"
      value={code}
      onChange={handleChange}
      options={{
        fontSize: 14,
        minimap: { enabled: false },
      }}
    />
  );
};

export default CodeEditor;
