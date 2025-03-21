import { NextRequest, NextResponse } from 'next/server';



export async function GET(request: NextRequest) {
  try {
    
    const cookie = request.cookies.get('fetch-access-token');
    if (!cookie) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const breedsUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/dogs/breeds`;
    
    const response = await fetch(breedsUrl, {
      headers: {
        'Cookie': `fetch-access-token=${cookie.value}`
      }
    });

    
    const data = await response.json();
    const sortedData = new Set<string>(data);
    
    const breeds = Array.from(sortedData).map((breed) => ({
      value: breed,
      label: breed
    }));

    
    return NextResponse.json(breeds, { status: response.status });
  } catch (error) {
    console.error('Breeds proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch breeds' },
      { status: 500 }
    );
  }
}
