import { NextRequest, NextResponse } from 'next/server';


interface SearchParams {
  city?: string;
  states?: string[];
  geoBoundingBox?: {
    top?: number;
    left?: number;
    bottom?: number;
    right?: number;
    bottom_left?: { lat: number; lon: number };
    top_right?: { lat: number; lon: number };
    bottom_right?: { lat: number; lon: number };
    top_left?: { lat: number; lon: number };
  };
  size?: number;
  from?: number;
}

export async function POST(request: NextRequest) {
  try {
    
    const cookie = request.cookies.get('fetch-access-token');
    if (!cookie) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    
    const searchParams: SearchParams = await request.json();
    
    
    if (searchParams.geoBoundingBox) {
      const bbox = searchParams.geoBoundingBox;
      const hasTopLeftBottomRight = bbox.top !== undefined && bbox.left !== undefined && 
                                   bbox.bottom !== undefined && bbox.right !== undefined;
      const hasCornerCoordinates = bbox.bottom_left && bbox.top_right;
      const hasAllCorners = bbox.bottom_left && bbox.top_right && 
                          bbox.bottom_right && bbox.top_left;
                          
      if (!hasTopLeftBottomRight && !hasCornerCoordinates && !hasAllCorners) {
        return NextResponse.json(
          { error: 'Invalid geoBoundingBox format' },
          { status: 400 }
        );
      }
    }

    const locationsUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/locations/search`;
    
    
    const fetchOptions = {
      method: 'POST',
      headers: {
        'Cookie': `fetch-access-token=${cookie.value}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(searchParams),
      duplex: 'half' 
    } as RequestInit;
    
    const response = await fetch(locationsUrl, fetchOptions);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to search locations with status ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Location search error:', error);
    return NextResponse.json(
      { error: 'Failed to search locations' },
      { status: 500 }
    );
  }
}