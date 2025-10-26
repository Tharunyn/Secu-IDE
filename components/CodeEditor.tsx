"use client";

import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import * as solc from "solc";

export default function CodeEditor() {
  const [code, setCode] = useState(`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HelloWorld {
    string public message = "Hello, Blockchain!";
    
    function setMessage(string calldata newMessage) public {
        message = newMessage;
    }
}
`);
  const [output, setOutput] = useState<string>("");

  // Compile Solidity code using solc-js
  const handleCompile = async () => {
    try {
      const input = {
        language: "Solidity",
        sources: {
          "Contract.sol": {
            content: code,
          },
        },
        settings: {
          outputSelection: {
            "*": {
              "*": ["abi", "evm.bytecode", "evm.sourceMap"],
            },
          },
        },
      };

      const output = JSON.parse(solc.compile(JSON.stringify(input)));

      if (output.errors) {
        const messages = output.errors
          .map((err: any) => `${err.severity.toUpperCase()}: ${err.formattedMessage}`)
          .join("\n");
        setOutput(messages);
      } else {
        const contracts = output.contracts["Contract.sol"];
        const compiled = Object.keys(contracts)
          .map(
            (name) =>
              `✅ ${name}\nABI: ${JSON.stringify(
                contracts[name].abi,
                null,
                2
              )}\nBytecode: ${contracts[name].evm.bytecode.object.substring(0, 60)}...`
          )
          .join("\n\n");
        setOutput(compiled);
      }
    } catch (err: any) {
      setOutput("❌ Compilation failed: " + err.message);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white p-4 space-y-4">
      <header className="flex justify-between items-center bg-gray-800 px-4 py-2 rounded-lg shadow">
        <h1 className="text-lg font-bold">🧱 Solidity Compiler (Browser)</h1>
        <button
          onClick={handleCompile}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded-md"
        >
          Compile
        </button>
      </header>

      <div className="flex-1 rounded-lg overflow-hidden border border-gray-700 shadow">
        <Editor
          height="100%"
          defaultLanguage="solidity"
          value={code}
          theme="vs-dark"
          onChange={(val) => setCode(val || "")}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            automaticLayout: true,
          }}
        />
      </div>

      <footer className="bg-black p-4 rounded-lg border border-gray-700 overflow-y-auto h-48 font-mono text-sm">
        <strong>Output:</strong>
        <pre className="whitespace-pre-wrap mt-2">{output}</pre>
      </footer>
    </div>
  );
}
