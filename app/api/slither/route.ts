import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'Missing Solidity code' }, { status: 400 });
    }

    // Proxy request to Slither Flask backend
    const response = await fetch('http://localhost:5005/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to get error details' }));
      return NextResponse.json(
        { error: errorData.error || 'Slither backend returned an error', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    // Check if it's a connection error
    if (error.code === 'ECONNREFUSED' || error.message?.includes('fetch failed')) {
      return NextResponse.json(
        {
          error: 'Cannot connect to Slither backend. Make sure the Docker container is running.',
          hint: 'Run: npm run slither-server-docker'
        },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Unknown error occurred' },
      { status: 500 }
    );
  }
}


