import { NextRequest, NextResponse } from 'next/server';

// My browser of choice doesn't support cross-site cookies. Thus the need for all of these proxy shenanigans

export async function GET(request: NextRequest) {
  try {
    // Get the cookie from the incoming request
    const cookie = request.cookies.get('fetch-access-token');
    if (!cookie) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Forward the search parameters
    const searchParams = request.nextUrl.searchParams;
    const breedsUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/dogs/search${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    const response = await fetch(breedsUrl, {
      headers: {
        'Cookie': `fetch-access-token=${cookie.value}`
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Search request failed' },
        { status: response.status }
      );
    }

    const searchResult = await response.json();

    // If we have dog IDs, fetch the full dog details
    if (searchResult.resultIds?.length) {
      const dogsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/dogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `fetch-access-token=${cookie.value}`
        },
        body: JSON.stringify(searchResult.resultIds)
      });

      if (!dogsResponse.ok) {
        return NextResponse.json(
          { error: 'Failed to fetch dog details' },
          { status: dogsResponse.status }
        );
      }

      const dogs = await dogsResponse.json();
      
      return NextResponse.json({
        ...searchResult,
        dogs
      }, { status: 200 });
    }

    return NextResponse.json({
      ...searchResult,
      dogs: []
    }, { status: 200 });
  } catch (error) {
    console.error('Search proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search results' },
      { status: 500 }
    );
  }
}

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

    // Get the search parameters from the request body
    const searchParams = await request.json();
    
    // Extract any geoBoundingBox parameter
    const { geoBoundingBox, ...otherParams } = searchParams;
    
    // Convert the other parameters to URL parameters 
    const urlParams = new URLSearchParams();
    
    // Add breeds if available
    if (otherParams.breeds?.length) {
      otherParams.breeds.forEach((breed: string) => urlParams.append('breeds', breed));
    }
    
    // Add zip codes if available
    if (otherParams.zipCodes?.length) {
      otherParams.zipCodes.forEach((zip: string) => urlParams.append('zipCodes', zip));
    }
    
    // Add other scalar parameters
    if (otherParams.ageMin !== undefined) {
      urlParams.set('ageMin', otherParams.ageMin.toString());
    }
    
    if (otherParams.ageMax !== undefined) {
      urlParams.set('ageMax', otherParams.ageMax.toString());
    }
    
    if (otherParams.size !== undefined) {
      urlParams.set('size', otherParams.size.toString());
    }
    
    if (otherParams.from !== undefined) {
      urlParams.set('from', otherParams.from.toString());
    }
    
    if (otherParams.sort) {
      urlParams.set('sort', otherParams.sort);
    }
    
    // Build base URL
    let searchUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/dogs/search`;
    
    // Append query parameters if they exist
    if (urlParams.toString()) {
      searchUrl += `?${urlParams.toString()}`;
    }
    
    // If we have a geoBoundingBox, we need to do a second location lookup
    // to get zip codes within that bounding box
    if (geoBoundingBox) {
      // Normalize the parameters to match our LocationSearchParams format
      const locationParams = {
        geoBoundingBox: {
          top_left: geoBoundingBox.top_left,
          bottom_right: geoBoundingBox.bottom_right
        },
        size: 100 // Get up to 100 locations
      };
      
      // Call our locations search API to get zip codes within the bounding box
      const locationsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/locations/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `fetch-access-token=${cookie.value}`
        },
        body: JSON.stringify(locationParams)
      });
      
      if (!locationsResponse.ok) {
        return NextResponse.json(
          { error: 'Failed to fetch locations in bounding box' },
          { status: locationsResponse.status }
        );
      }
      
      const locationsResult = await locationsResponse.json();
      
      // Extract zip codes from the locations response
      //eslint-disable-next-line
      const zipCodes = locationsResult.results.map((location: any) => location.zip_code);
      
      // If we found zip codes, add them to the search URL
      if (zipCodes.length > 0) {
        // If we already have a query string, append with &
        const separator = searchUrl.includes('?') ? '&' : '?';
        
        // Add each zip code as a separate parameter
        const zipParams = zipCodes.map((zip: string) => `zipCodes=${encodeURIComponent(zip)}`).join('&');
        searchUrl += `${separator}${zipParams}`;
      }
    }
    
    // Make the dogs search request
    const response = await fetch(searchUrl, {
      headers: {
        'Cookie': `fetch-access-token=${cookie.value}`
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Search request failed' },
        { status: response.status }
      );
    }

    const searchResult = await response.json();
    
    // Return just the search results without fetching dog details
    return NextResponse.json(searchResult);
  } catch (error) {
    console.error('Error in dogs search:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}