"use client";

import { useState, useRef } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

export default function CodeEditor() {
  const [code, setCode] = useState(`ur solidity contract goes here`);
  const [analysisResults, setAnalysisResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  // Connects to backend API for Solidity analysis
  const analyzeContract = async () => {
    if (!editorRef.current) return;

    setLoading(true);
    setAnalysisResults([]);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Analysis failed");

      // Highlight lines based on results
      const decorations = data.results.map((v: any) => ({
        range: new monaco.Range(v.line, 1, v.line, 1),
        options: {
          isWholeLine: true,
          className: v.severity === "critical" ? "criticalLine" : "warningLine",
          glyphMarginClassName:
            v.severity === "critical"
              ? "criticalGlyph"
              : "warningGlyph",
          hoverMessage: { value: `${v.severity.toUpperCase()}: ${v.message}` },
        },
      }));

      editorRef.current.deltaDecorations([], decorations);
      setAnalysisResults(data.results.map((v: any) => `${v.severity.toUpperCase()}: ${v.message}`));
    } catch (err: any) {
      setAnalysisResults([`❌ Error: ${err.message}`]);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="flex justify-between items-center bg-gray-800 px-4 py-2">
        <h2 className="text-lg font-semibold">Solidity Web Editor</h2>
        <button
          onClick={analyzeContract}
          className="bg-blue-500 hover:bg-blue-600 px-4 py-1 rounded-md"
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Analyze Contract"}
        </button>
      </div>

      {/* Code Editor */}
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

      {/* Results */}
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

      {/* Styles for highlighting */}
      <style jsx>{`
        .criticalLine {
          background-color: rgba(255, 0, 0, 0.25);
        }
        .warningLine {
          background-color: rgba(255, 255, 0, 0.25);
        }
        .criticalGlyph {
          background-color: red;
          width: 5px;
          border-radius: 50%;
        }
        .warningGlyph {
          background-color: yellow;
          width: 5px;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
}
