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

    const breedsUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/dogs`;
    
    const response = await fetch(breedsUrl, {
      headers: {
        'Cookie': `fetch-access-token=${cookie.value}`
      },
      method: 'POST',
      body: request.body
    });

    const data = await response.json();

    // returns dog objs
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Dog proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dogs' },
      { status: 500 }
    );
  }
}