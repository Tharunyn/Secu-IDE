'use client';
import dynamic from 'next/dynamic';
const MonacoEditor = dynamic(() => import('react-monaco-editor'), {
  ssr: false,
  loading: () => <div className="text-gray-400">Loading editor...</div>,
});

export default MonacoEditor;
