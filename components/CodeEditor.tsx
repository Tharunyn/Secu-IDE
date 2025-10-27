'use client';
import React, { useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const MonacoEditor = dynamic(() => import('react-monaco-editor'), { ssr: false });

interface CodeEditorProps {
  onCompile: (code: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ onCompile }) => {
  const [code, setCode] = useState(`pragma solidity ^0.8.0;

contract HelloWorld {
    string public greeting = "Hello, World!";
}`);

  const editorRef = useRef<any>(null);

  return (
    <div>
      <MonacoEditor
        height="400px"
        language="solidity"
        theme="vs-dark"
        value={code}
        editorDidMount={(editor) => (editorRef.current = editor)}
        onChange={(newCode) => setCode(newCode)}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          glyphMargin: true,
        }}
      />

      <button
        onClick={() => onCompile(code)}
        className="mt-2 bg-green-500 px-4 py-2 rounded"
      >
        Compile
      </button>
    </div>
  );
};

export default CodeEditor;
