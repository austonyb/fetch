import useSWR from 'swr';
import { useLocationSearch } from './useLocations';

import { SearchParams, Dog, Coordinates, Location } from '@/types';

function buildSearchUrl(params?: SearchParams): string {
  if (!params) return '/api/dogs/search';
  
  const searchParams = new URLSearchParams();
  
  if (params.breeds?.length) {
    params.breeds.forEach(breed => searchParams.append('breeds', breed));
  }
  
  if (params.zipCodes?.length) {
    params.zipCodes.forEach(zip => searchParams.append('zipCodes', zip));
  }
  
  if (params.ageMin !== undefined) {
    searchParams.set('ageMin', params.ageMin.toString());
  }
  
  if (params.ageMax !== undefined) {
    searchParams.set('ageMax', params.ageMax.toString());
  }
  
  if (params.size !== undefined) {
    searchParams.set('size', params.size.toString());
  }
  
  
  if (params.page !== undefined && params.size !== undefined) {
    const from = params.page * params.size;
    searchParams.set('from', from.toString());
  } else if (params.from !== undefined) {
    searchParams.set('from', params.from.toString());
  }
  
  
  if (params.sort) {
    searchParams.set('sort', params.sort);
  }
  
  const queryString = searchParams.toString();
  return queryString ? `/api/dogs/search?${queryString}` : '/api/dogs/search';
}


interface SearchResponse {
  resultIds: string[];
  total: number;
  next?: string;
  prev?: string;
  dogs?: Dog[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());
//eslint-disable-next-line
const postFetcher = (url: string, body: any) => 
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }).then(res => res.json());

export function useSearch(params?: Partial<SearchParams & { 
  geoBoundingBox?: { 
    top_left: Coordinates, 
    bottom_right: Coordinates 
  } | null 
}>) {
  
  const { geoBoundingBox, ...otherParams } = params || {};
  
  
  const locationSearch = useLocationSearch(
    geoBoundingBox 
      ? {
          geoBoundingBox: {
            
            top: geoBoundingBox.top_left.lat,
            left: geoBoundingBox.top_left.lon,
            bottom: geoBoundingBox.bottom_right.lat,
            right: geoBoundingBox.bottom_right.lon
          },
          size: 100 
        }
      : null
  );
  
  
  const locationZipCodes = locationSearch.results?.map((loc: Location) => loc.zip_code) || [];
  
  
  const combinedParams = {
    ...otherParams,
    zipCodes: geoBoundingBox 
      ? [...(otherParams.zipCodes || []), ...locationZipCodes]
      : otherParams.zipCodes
  };
  
  
  const shouldFetch = !geoBoundingBox || !locationSearch.isLoading;
  
  
  const { data, error, isLoading, mutate } = useSWR<SearchResponse>(
    shouldFetch ? buildSearchUrl(combinedParams as SearchParams) : null,
    shouldFetch ? fetcher : null
  );
  
  
  const { data: dogData, error: dogError, isLoading: isDogLoading } = useSWR<Dog[]>(
    data?.resultIds && data.resultIds.length > 0 ? ['/api/dogs', data.resultIds] : null,
    data?.resultIds && data.resultIds.length > 0 ? () => postFetcher('/api/dogs', data.resultIds) : null
  );
  
  
  const isSearchLoading = isLoading || 
    (geoBoundingBox && locationSearch.isLoading) || 
    (data?.resultIds && isDogLoading);
  
  return {
    search: {
      data: dogData || [],
      total: data?.total || 0,
      next: data?.next,
      prev: data?.prev,
      error: error || dogError,
      isLoading: isSearchLoading,
      mutate
    }
  };
}