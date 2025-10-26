'use client';
import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';

// SSR-safe Monaco import
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
  const [mounted, setMounted] = useState(false);
  const editorRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Client-only mount
  useEffect(() => setMounted(true), []);

  // Debounced analysis
  useEffect(() => {
    if (!mounted || !editorRef.current) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      try {
        const response = await axios.post('http://YOUR_DOCKER_HOST:5000/analyze', { code });
        const warnings: Warning[] = response.data.warnings || [];

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

        onAnalysis?.(warnings);
      } catch (err) {
        console.error('Analysis failed', err);
        onAnalysis?.([]);
      }
    }, 1500);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [code, mounted, onAnalysis]);

  if (!mounted) return null;

  return (
    <MonacoEditor
      height="70vh"
      language="solidity"
      theme="vs-dark"
      value={code}
      onChange={(newCode) => setCode(newCode)}
      editorDidMount={(editor) => (editorRef.current = editor)}
      options={{ fontSize: 14, minimap: { enabled: false }, glyphMargin: true }}
    />
  );
};

export default CodeEditor;
