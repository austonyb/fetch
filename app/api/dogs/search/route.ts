import { NextRequest, NextResponse } from 'next/server';

// My browser of choice doesn't support cross-site cookies. Thus the need for all of these proxy shenanigans

export async function GET(request: NextRequest) {
  try {
    // Get the cookie from the incoming request
    const cookie = request.cookies.get('fetch-access-token');
    if (!cookie) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Forward the search parameters
    const searchParams = request.nextUrl.searchParams;
    const breedsUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/dogs/search${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    const response = await fetch(breedsUrl, {
      headers: {
        'Cookie': `fetch-access-token=${cookie.value}`
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Search request failed' },
        { status: response.status }
      );
    }

    const searchResult = await response.json();

    // If we have dog IDs, fetch the full dog details
    if (searchResult.resultIds?.length) {
      const dogsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/dogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `fetch-access-token=${cookie.value}`
        },
        body: JSON.stringify(searchResult.resultIds)
      });

      if (!dogsResponse.ok) {
        return NextResponse.json(
          { error: 'Failed to fetch dog details' },
          { status: dogsResponse.status }
        );
      }

      const dogs = await dogsResponse.json();
      
      return NextResponse.json({
        ...searchResult,
        dogs
      }, { status: 200 });
    }

    return NextResponse.json({
      ...searchResult,
      dogs: []
    }, { status: 200 });
  } catch (error) {
    console.error('Search proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search results' },
      { status: 500 }
    );
  }
}