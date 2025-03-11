import useSWR from 'swr';

import { SearchParams, SearchResult, Dog } from '@/types';

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
  
  // Add page parameter as 'from'
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

// Update the response interface to include total count
interface SearchResponse {
  resultIds: string[];
  total: number;
  dogs: Dog[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useSearch(params?: SearchParams) {
  const { data, error, isLoading, mutate } = useSWR<SearchResponse>(
    buildSearchUrl(params),
    fetcher
  );

  return {
    search: {
      data: data?.dogs || [],
      total: data?.total || 0,
      error,
      isLoading,
    },
    mutateSearch: mutate,
  };
}