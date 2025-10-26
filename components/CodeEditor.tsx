'use client';
import React, { useState, useRef, useEffect } from 'react';
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
  const [mounted, setMounted] = useState(false); // ensures client-only render
  const editorRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);

  // Ensure editor only mounts on client
  useEffect(() => setMounted(true), []);

  const handleChange = (newCode: string) => {
    setCode(newCode);
    if (timeoutId) clearTimeout(timeoutId);
    const id = setTimeout(() => analyzeCode(newCode), 1500); // debounce
    setTimeoutId(id);
  };

  const analyzeCode = async (code: string) => {
    if (!editorRef.current) return;

    try {
      const response = await axios.post('http://YOUR_DOCKER_HOST:5000/analyze', { code });
      const warnings: Warning[] = response.data.warnings || [];

      // Highlight lines safely
      const monaco = (window as any).monaco;
      if (monaco) {
        decorationsRef.current = editorRef.current.deltaDecorations(
          decorationsRef.current,
          warnings.map((w) => ({
            range: new monaco.Range(w.line, 1, w.line, 1),
            options: {
              isWholeLine: true,
              className: w.type === 'Critical' ? 'line-decoration-red' : 'line-decoration-yellow',
            },
          }))
        );
      }

      onAnalysis?.(warnings); // only update warnings, not code
    } catch (err) {
      console.error('Analysis failed', err);
      onAnalysis?.([]);
    }
  };

  if (!mounted) return null; // render nothing on server

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
