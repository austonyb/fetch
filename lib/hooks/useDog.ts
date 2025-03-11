import useSWR from 'swr';

import { Dog } from '@/types';

const postFetcher = (url: string, dogIds: string[]) => 
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      credentials: 'include'
    },
    body: JSON.stringify(dogIds)
  }).then(res => res.json());

// For a single dog
export function useDog(id: string | null) {
  // Only fetch if we have a valid ID
  const shouldFetch = !!id;

  const { data, error, isLoading } = useSWR<Dog[]>(
    shouldFetch ? '/api/dogs' : null,
    // Only call the fetcher if we have a valid ID
    (url: string) => {
      // TypeScript non-null assertion operator (!) tells TypeScript that
      // the value is definitely not null at this point
      return postFetcher(url, [id!]); 
    }
  );

  // The API returns an array, but we only want the first item
  const dog = data && data.length > 0 ? data[0] : null;

  return {
    dog, 
    isLoading,
    isError: error
  };
}
