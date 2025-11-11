'use client';
import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import MonacoEditor from './MonacoWrapper';

interface CodeEditorProps {
  onCompile: (code: string) => void;
  onTest?: (code: string) => void;
}

export interface CodeEditorHandle {
  getCode: () => string;
  setCode: (code: string) => void;
}

const CodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>(({ onCompile, onTest }, ref) => {
  const [code, setCode] = useState(`pragma solidity ^0.8.0;

contract HelloWorld {
    string public greeting = "Hello, World!";
}`);

  useImperativeHandle(ref, () => ({
    getCode: () => code,
    setCode: (newCode: string) => setCode(newCode),
  }), [code]);

  return (
    <div>
      <MonacoEditor
        height="400px"
        language="solidity"
        theme="vs-dark"
        value={code}
        onChange={setCode}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          glyphMargin: true,
        }}
      />
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => onCompile(code)}
          className="bg-green-500 px-4 py-2 rounded hover:bg-green-600 cursor-pointer transition"
        >
          Compile
        </button>
        {onTest && (
          <button
            onClick={() => onTest(code)}
            className="bg-yellow-500 px-4 py-2 rounded hover:bg-yellow-600 cursor-pointer transition"
          >
            Run Test
          </button>
        )}
      </div>
    </div>
  );
});

CodeEditor.displayName = 'CodeEditor';

export default CodeEditor;
