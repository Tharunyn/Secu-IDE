"use client";

import { useState, useRef } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

export default function CodeEditor() {
  const [code, setCode] = useState(`// Example Solidity contract
pragma solidity ^0.8.0;

contract MyContract {
    uint public count;

    function increment() public {
        count += 1;
    }

    function reset() public {
        count = 0;
    }
}`);
  const [analysisResults, setAnalysisResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  // Capture editor instance on mount
  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  // Fake analyze function with highlights
  const analyzeContract = () => {
    if (!editorRef.current) return;

    setLoading(true);

    setTimeout(() => {
      // Example vulnerabilities (line numbers start at 1)
      const vulnerabilities = [
        {
          line: 6,
          message: "⚠ Warning: Function 'increment' has no access control",
        },
        {
          line: 10,
          message: "⚠ Warning: Function 'reset' has no access control",
        },
      ];

      // Show messages in results box
      setAnalysisResults(vulnerabilities.map((v) => v.message));

      // Apply decorations to highlight lines in editor
      const decorations = vulnerabilities.map((v) => ({
        range: new monaco.Range(v.line, 1, v.line, 1),
        options: {
          isWholeLine: true,
          className: "vulnerabilityLine",
          glyphMarginClassName: "vulnerabilityGlyph",
          hoverMessage: { value: v.message },
        },
      }));

      editorRef.current!.deltaDecorations([], decorations);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header with Analyze Button */}
      <div className="flex justify-between items-center bg-gray-800 px-4 py-2">
        <h2 className="text-lg font-semibold">Web Editor</h2>
        <button
          onClick={analyzeContract}
          className="bg-blue-500 hover:bg-blue-600 px-4 py-1 rounded-md"
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Analyze Contract"}
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="solidity"
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || "")}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            scrollBeyondLastLine: false,
            glyphMargin: true,
          }}
        />
      </div>

      {/* Analysis Results */}
      <div className="bg-black p-4 h-40 overflow-y-auto border-t border-gray-700 font-mono text-sm">
        <strong>Analysis Results:</strong>
        {analysisResults.length === 0 ? (
          <p>No results yet. Click "Analyze Contract".</p>
        ) : (
          <ul className="mt-2 space-y-1">
            {analysisResults.map((res, idx) => (
              <li key={idx}>{res}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Custom styles for vulnerability highlight */}
      <style jsx>{`
        .vulnerabilityLine {
          background-color: rgba(255, 0, 0, 0.2);
        }
        .vulnerabilityGlyph {
          background-color: red;
          width: 5px;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
}
