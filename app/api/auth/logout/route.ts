import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    
    const body = await request.json();
    
    
    const authUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/logout`;
    
    console.log('Sending auth request to:', authUrl);
    
    
    const cookieValue = request.cookies.get('fetch-access-token')?.value;
    
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    
    if (cookieValue) {
      headers['Cookie'] = cookieValue;
    }
    
    const response = await fetch(authUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    
    
    const responseText = await response.text();
    console.log('Logout response text:', responseText);
    
    
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