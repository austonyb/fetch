import { NextRequest, NextResponse } from 'next/server';

// My browser of choice doesn't support cross-site cookies. Thus the need for all of these proxy shenanigans

export async function POST(request: NextRequest) {
  try {
    // Get the cookie from the incoming request
    const cookie = request.cookies.get('fetch-access-token');
    if (!cookie) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const breedsUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/dogs/match`;
    
    // Using type assertion to handle the duplex option that TypeScript doesn't know about yet
    const fetchOptions = {
      headers: {
        'Cookie': `fetch-access-token=${cookie.value}`,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: request.body,
      duplex: 'half' // Required for requests with a body in newer fetch implementations
    } as RequestInit;
    
    const response = await fetch(breedsUrl, fetchOptions);

    const data = await response.json();

    // returns dog objs
    console.log(data.match);
    return NextResponse.json(data?.match || null, { status: response.status });
  } catch (error) {
    console.error('Dog proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dogs' },
      { status: 500 }
    );
  }
}