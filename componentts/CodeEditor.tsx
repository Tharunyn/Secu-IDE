"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";

export default function CodeEditor() {
  const [code, setCode] = useState("// You can write ur code guyzzz");
  const [output, setOutput] = useState("");

  // Function to run the code
  const runCode = () => {
    try {
      const result = eval(code); // runs the JS code
      setOutput(String(result) || "Code ran successfully. Check console output.");
    } catch (err: any) {
      setOutput("❌ Error: " + err.message);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <div className="flex justify-between items-center bg-gray-800 px-4 py-2">
        <h2 className="text-lg font-semibold">Web Editor</h2>
        <button
          onClick={runCode}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded-md"
        >
          ▶ Run Code
        </button>
      </div>

      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || "")}
        />
      </div>

      <div className="bg-black p-4 h-40 overflow-y-auto border-t border-gray-700 font-mono text-sm">
        <strong>Output:</strong>
        <pre>{output}</pre>
      </div>
    </div>
  );
}
