import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
const address = request.nextUrl.searchParams.get('address');

    try {
        const url = `https://geocode.maps.co/search?q=${address}%20USA&api_key=${process.env.NEXT_PUBLIC_GEOCODING_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Geocoding proxy error:', error);
        return NextResponse.json(
            { error: 'Failed to geocode address' },
            { status: 500 }
        );
    }
}