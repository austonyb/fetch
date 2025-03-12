import { NextRequest, NextResponse } from 'next/server';


export async function GET(request: NextRequest) {
  const zipCode = request.nextUrl.searchParams.get('address');
  
  if (!zipCode) {
    return NextResponse.json(
      { error: 'ZIP code is required' },
      { status: 400 }
    );
  }

  try {
    
    const cookie = request.cookies.get('fetch-access-token');
    if (!cookie) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    
    const locationsUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/locations`;
    
    const fetchOptions = {
      method: 'POST',
      headers: {
        'Cookie': `fetch-access-token=${cookie.value}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([zipCode]),
      duplex: 'half'
    } as RequestInit;
    
    const response = await fetch(locationsUrl, fetchOptions);
    
    if (!response.ok) {
      console.error(`Failed to get location data: ${response.status}`);
      return NextResponse.json(
        { error: 'Failed to get location data' },
        { status: response.status }
      );
    }

    const locations = await response.json();

    
    if (!locations || locations.length === 0) {
      return NextResponse.json(
        { error: 'No location found for this ZIP code' },
        { status: 404 }
      );
    }

    
    const locationData = locations[0];
    
    
    const geocodingResult = {
      place_id: 1,
      licence: "Fetch API",
      lat: locationData.latitude.toString(),
      lon: locationData.longitude.toString(),
      display_name: `${locationData.city}, ${locationData.state} ${locationData.zip_code}`,
      type: "zipcode",
      importance: 1
    };
    
    return NextResponse.json([geocodingResult]);
  } catch (error) {
    console.error('Geocoding error:', error);
    return NextResponse.json(
      { error: 'Failed to geocode address' },
      { status: 500 }
    );
  }
}