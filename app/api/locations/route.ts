import { NextRequest, NextResponse } from 'next/server';

// API to fetch location information for up to 100 ZIP codes

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

    // Parse the body to get the array of zip codes
    const zipCodes = await request.json() as string[];
    
    // Check if the request is within limits
    if (!Array.isArray(zipCodes) || zipCodes.length > 100) {
      return NextResponse.json(
        { error: 'Invalid request: must provide array of up to 100 zip codes' },
        { status: 400 }
      );
    }
    
    const locationsUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/locations`;
    
    // Using type assertion to handle the duplex option
    const fetchOptions = {
      method: 'POST',
      headers: {
        'Cookie': `fetch-access-token=${cookie.value}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(zipCodes),
      duplex: 'half' // Required for requests with a body in newer fetch implementations
    } as RequestInit;
    
    const response = await fetch(locationsUrl, fetchOptions);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch locations with status ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Returns an array of location objects
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Location proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}