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

    const locationsUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/locations/search`;
    
    const response = await fetch(locationsUrl, {
      headers: {
        'Cookie': `fetch-access-token=${cookie.value}`
      },
      method: 'POST',
      body: request.body
    });

    const data = await response.json();

    // Returns an object with the following properties:
    // results - an array of Location objects
    // total - the total number of results for the query (not just the current page)
    // {
    //     results: Location[],
    //     total: number
    // }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Location proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to search locations' },
      { status: 500 }
    );
  }
}