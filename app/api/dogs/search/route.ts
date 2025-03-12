import { NextRequest, NextResponse } from 'next/server';



export async function GET(request: NextRequest) {
  try {
    
    const cookie = request.cookies.get('fetch-access-token');
    if (!cookie) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    
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
    
    const cookie = request.cookies.get('fetch-access-token');
    if (!cookie) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    
    const searchParams = await request.json();
    
    
    const { geoBoundingBox, ...otherParams } = searchParams;
    
    
    const urlParams = new URLSearchParams();
    
    
    if (otherParams.breeds?.length) {
      otherParams.breeds.forEach((breed: string) => urlParams.append('breeds', breed));
    }
    
    
    if (otherParams.zipCodes?.length) {
      otherParams.zipCodes.forEach((zip: string) => urlParams.append('zipCodes', zip));
    }
    
    
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
    
    
    let searchUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/dogs/search`;
    
    
    if (urlParams.toString()) {
      searchUrl += `?${urlParams.toString()}`;
    }
    
    
    
    if (geoBoundingBox) {
      
      const locationParams = {
        geoBoundingBox: {
          top_left: geoBoundingBox.top_left,
          bottom_right: geoBoundingBox.bottom_right
        },
        size: 100 
      };
      
      
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
      
      
      //eslint-disable-next-line
      const zipCodes = locationsResult.results.map((location: any) => location.zip_code);
      
      
      if (zipCodes.length > 0) {
        
        const separator = searchUrl.includes('?') ? '&' : '?';
        
        
        const zipParams = zipCodes.map((zip: string) => `zipCodes=${encodeURIComponent(zip)}`).join('&');
        searchUrl += `${separator}${zipParams}`;
      }
    }
    
    
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
    
    
    return NextResponse.json(searchResult);
  } catch (error) {
    console.error('Error in dogs search:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}