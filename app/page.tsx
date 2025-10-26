'use client';
import React, { useState } from 'react';
import CodeEditor, { Warning } from '../components/CodeEditor';
import WarningsPanel from '../components/WarningsPanel';
import solc from 'solc';

const HomePage: React.FC = () => {
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [code, setCode] = useState('');

  const compileCode = (code: string) => {
    try {
      const input = {
        language: 'Solidity',
        sources: { 'Contract.sol': { content: code } },
        settings: { outputSelection: { '*': { '*': ['*'] } } },
      };
      const output = JSON.parse(solc.compile(JSON.stringify(input)));
      if (output.errors) console.log(output.errors);
      alert('Compilation finished! Check console for errors/warnings.');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="h-screen w-full p-4 bg-gray-900">
      <h1 className="text-2xl font-bold text-white mb-4">Solidity Security Editor</h1>
      <CodeEditor
        onAnalysis={(w) => {
          setWarnings(w);
          setCode(w?.length ? w.map((x) => x.message).join('\n') : '');
        }}
      />
      <button
        className="bg-green-500 text-white px-4 py-2 rounded mt-2"
        onClick={() => compileCode(code)}
      >
        Compile
      </button>
      <WarningsPanel warnings={warnings} />
    </main>
  );
};

export default HomePage;
