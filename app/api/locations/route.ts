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

    const locationsUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/locations`;

    const body = await request.json();
    
    if (Object.keys(body).length >= 100) {
      return NextResponse.json(
        { error: 'Too many zip codes' },
        { status: 400 }
      );
    }
    
    const response = await fetch(locationsUrl, {
      method: 'POST',
      headers: {
        'Cookie': `fetch-access-token=${cookie.value}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    // returns an array of location objs
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Location proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}