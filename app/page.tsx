'use client';
import React, { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import solc from 'solc';

// SSR-safe Monaco import
const MonacoEditor = dynamic(() => import('react-monaco-editor'), { ssr: false });

const HomePage: React.FC = () => {
  const [code, setCode] = useState(`pragma solidity ^0.8.0;

contract HelloWorld {
    string public greeting = "Hello, World!";
}`);
  const [output, setOutput] = useState('');
  const editorRef = useRef<any>(null);

  const compileCode = () => {
    try {
      const input = {
        language: 'Solidity',
        sources: { 'Contract.sol': { content: code } },
        settings: { outputSelection: { '*': { '*': ['*'] } } },
      };

      const compiled = JSON.parse(solc.compile(JSON.stringify(input)));
      setOutput(JSON.stringify(compiled.errors || compiled.contracts, null, 2));
    } catch (err: any) {
      setOutput(err.message);
    }
  };

  return (
    <main className="h-screen w-full p-4 bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-4">Solidity Web Editor</h1>

      {/* Monaco Editor */}
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

      {/* Compile button */}
      <button
        className="mt-2 bg-green-500 px-4 py-2 rounded"
        onClick={compileCode}
      >
        Compile
      </button>

      {/* Output panel */}
      <pre className="mt-4 p-2 bg-gray-700 rounded overflow-auto max-h-64">
        {output}
      </pre>
    </main>
  );
};

export default HomePage;
