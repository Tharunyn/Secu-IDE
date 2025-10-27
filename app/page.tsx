'use client';
import React, { useState } from 'react';
import solc from 'solc';
import CodeEditor from '../components/CodeEditor';
import OutputPanel from '../components/OutputPanel';

const HomePage: React.FC = () => {
  const [output, setOutput] = useState('');

  const handleCompile = (code: string) => {
    try {
      const input = {
        language: 'Solidity',
        sources: { 'Contract.sol': { content: code } },
        settings: { outputSelection: { '*': { '*': ['*'] } } },
      };

      const compiled = JSON.parse(solc.compile(JSON.stringify(input)));
      setOutput(JSON.stringify(compiled.errors || compiled.contracts, null, 2));
    } catch (err: any) {
      setOutput(`Compilation failed: ${err.message}`);
    }
  };

  return (
    <main className="h-screen w-full p-4 bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-4">Advanced Solidity Editor</h1>
      <CodeEditor onCompile={handleCompile} />
      <OutputPanel output={output} />
    </main>
  );
};

export default HomePage;
