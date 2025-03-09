import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json();
    
    // Forward the request to the actual auth endpoint
    const authUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/logout`;
    
    console.log('Sending auth request to:', authUrl);
    
    // Get the cookie value
    const cookieValue = request.cookies.get('fetch-access-token')?.value;
    
    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Only add cookie header if we have a value
    if (cookieValue) {
      headers['Cookie'] = cookieValue;
    }
    
    const response = await fetch(authUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    
    // Get the response text
    const responseText = await response.text();
    console.log('Logout response text:', responseText);
    
    // Create the response
    const newResponse = NextResponse.json(
      { message: responseText },
      {
        status: response.status,
      }
    );
    
    return newResponse;
  } catch (error) {
    console.error('Logout proxy error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}