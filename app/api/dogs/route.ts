import { NextRequest, NextResponse } from 'next/server';



export async function POST(request: NextRequest) {
  try {
    
    const cookie = request.cookies.get('fetch-access-token');
    if (!cookie) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const breedsUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/dogs`;
    
    
    const fetchOptions = {
      headers: {
        'Cookie': `fetch-access-token=${cookie.value}`,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: request.body,
      duplex: 'half' 
    } as RequestInit;
    
    const response = await fetch(breedsUrl, fetchOptions);

    const data = await response.json();

    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Dog proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dogs' },
      { status: 500 }
    );
  }
}