'use client';
import React, { useState } from 'react';
import CodeEditor from '@/components/CodeEditor';
import OutputPanel from '@/components/OutputPanel';

const HomePage: React.FC = () => {
  const [output, setOutput] = useState('');

  const handleCompile = async (code: string) => {
    const res = await fetch('/api/compile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    const data = await res.json();
    setOutput(data.output);
  };

  return (
    <main className="h-screen w-full p-4 bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-4">Secu-IDE</h1>
      <CodeEditor onCompile={handleCompile} />
      <OutputPanel output={output} />
    </main>
  );
};

export default HomePage;
