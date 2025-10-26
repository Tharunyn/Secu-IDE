"use client";

import dynamic from "next/dynamic";

// Dynamically import the editor so it only loads in the browser
const CodeEditor = dynamic(() => import("../components/CodeEditor"), {
  ssr: false, // Disable server-side rendering for this component
});

export default function Home() {
  return (
    <main className="h-screen w-full">
      <CodeEditor />
    </main>
  );
}
