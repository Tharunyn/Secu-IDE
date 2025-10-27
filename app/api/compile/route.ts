import { NextResponse } from 'next/server';
import solc from 'solc';

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    const input = {
      language: 'Solidity',
      sources: { 'Contract.sol': { content: code } },
      settings: { outputSelection: { '*': { '*': ['*'] } } },
    };

    const compiled = JSON.parse(solc.compile(JSON.stringify(input)));
    const output = JSON.stringify(compiled.errors || compiled.contracts, null, 2);

    return NextResponse.json({ output });
  } catch (err: any) {
    return NextResponse.json({ output: `Compilation failed: ${err.message}` });
  }
}
