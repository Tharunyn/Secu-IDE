'use client';
import React, { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';

const MonacoEditor = dynamic(() => import('react-monaco-editor'), { ssr: false });

export interface Warning {
  type: string;
  message: string;
  line: number;
}

interface CodeEditorProps {
  onAnalysis?: (warnings: Warning[]) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ onAnalysis }) => {
  const [code, setCode] = useState('');
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const editorRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);

  const handleChange = (newCode: string) => {
    setCode(newCode);
    if (timeoutId) clearTimeout(timeoutId);

    const id = setTimeout(() => analyzeCode(newCode), 1500);
    setTimeoutId(id);
  };

  const analyzeCode = async (code: string) => {
    try {
      const response = await axios.post('http://YOUR_DOCKER_HOST:5000/analyze', { code });
      const warnings: Warning[] = response.data.warnings || [];

      // Highlight lines
      if (editorRef.current) {
        decorationsRef.current = editorRef.current.deltaDecorations(
          decorationsRef.current,
          warnings.map(w => ({
            range: new editorRef.current.Range(w.line, 1, w.line, 1),
            options: {
              isWholeLine: true,
              className: w.type === 'Critical' ? 'line-decoration-red' : 'line-decoration-yellow',
              glyphMarginClassName: 'glyph-margin',
            },
          }))
        );
      }

      onAnalysis?.(warnings);
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
      editorDidMount={(editor) => (editorRef.current = editor)}
      onChange={handleChange}
      options={{ fontSize: 14, minimap: { enabled: false }, glyphMargin: true }}
    />
  );
};

export default CodeEditor;
