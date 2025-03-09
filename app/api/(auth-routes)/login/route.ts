import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json();
    
    // Forward the request to the actual auth endpoint
    const authUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`;
    
    console.log('Sending auth request to:', authUrl);
    
    const response = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    // Log all response headers
    console.log('Auth response status:', response.status);
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
      console.log(`Response header ${key}:`, value);
    });
    
    // Get the response text
    const responseText = await response.text();
    console.log('Auth response text:', responseText);
    
    // Get the Set-Cookie header
    const setCookieHeader = response.headers.get('set-cookie');
    console.log('Original Set-Cookie header:', setCookieHeader);
    
    // Create the response
    const newResponse = NextResponse.json(
      { message: responseText },
      {
        status: response.status,
        headers: setCookieHeader ? { 'Set-Cookie': setCookieHeader } : undefined
      }
    );
    
    // Log what we're sending back
    console.log('Our response headers:', Object.fromEntries(newResponse.headers.entries()));
    
    return newResponse;
  } catch (error) {
    console.error('Auth proxy error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}