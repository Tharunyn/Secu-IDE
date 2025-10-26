'use client';
import React, { useState } from 'react';
import CodeEditor from '../components/CodeEditor';
import WarningsPanel from '../components/WarningsPanel';

const HomePage: React.FC = () => {
  const [warnings, setWarnings] = useState<any[]>([]);

  return (
    <main className="h-screen w-full p-4 bg-gray-900">
      <h1 className="text-2xl font-bold text-white mb-4">Solidity Security Editor</h1>
      <CodeEditor onAnalysis={setWarnings} />
      <WarningsPanel warnings={warnings} />
    </main>
  );
};

export default HomePage;
