import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    
    const body = await request.json();
    
    
    const authUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`;
    
    console.log('Sending auth request to:', authUrl);
    
    const response = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    
    console.log('Auth response status:', response.status);
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
      console.log(`Response header ${key}:`, value);
    });
    
    
    const responseText = await response.text();
    console.log('Auth response text:', responseText);
    
    
    const setCookieHeader = response.headers.get('set-cookie');
    console.log('Original Set-Cookie header:', setCookieHeader);
    
    
    const newResponse = NextResponse.json(
      { message: responseText },
      {
        status: response.status,
        headers: setCookieHeader ? { 'Set-Cookie': setCookieHeader } : undefined
      }
    );
    
    
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