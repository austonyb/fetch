import useSWR from 'swr';
import { Location, LocationSearchParams, LocationSearchResult } from '../types';

/**
 * Hook to fetch location data for one or more zip codes
 * @param zipCodes Array of zip codes to fetch location data for
 * @returns Object containing the locations data, loading state, and error state
 */
export function useLocations(zipCodes: string[] | null) {
  const shouldFetch = zipCodes && zipCodes.length > 0 && zipCodes.length <= 100;
  
  const { data, error, isLoading } = useSWR<Location[]>(
    shouldFetch ? '/api/locations' : null,
    shouldFetch ? () => postFetcher('/api/locations', zipCodes) : null
  );

  return {
    locations: data || [],
    isLoading,
    error
  };
}

/**
 * Hook to search for locations based on various criteria
 * @param params Search parameters for the locations
 * @returns Object containing the search results, loading state, and error state
 */
export function useLocationSearch(params: LocationSearchParams | null) {
  const shouldFetch = params !== null;
  
  const { data, error, isLoading } = useSWR<LocationSearchResult>(
    shouldFetch ? '/api/locations/search' : null,
    shouldFetch ? () => postFetcher('/api/locations/search', params) : null
  );

  return {
    results: data?.results || [],
    total: data?.total || 0,
    isLoading,
    error
  };
}

/**
 * Helper function for POST requests with JSON body
 */
//eslint-disable-next-line
function postFetcher(url: string, body: any) {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  } as RequestInit).then((res) => {
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  });
}
