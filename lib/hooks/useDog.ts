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


export function useDog(id: string | null) {
  
  const shouldFetch = !!id;

  const { data, error, isLoading } = useSWR<Dog[]>(
    shouldFetch ? '/api/dogs' : null,
    
    (url: string) => {
      
      
      return postFetcher(url, [id!]); 
    }
  );

  
  const dog = data && data.length > 0 ? data[0] : null;

  return {
    dog, 
    isLoading,
    isError: error
  };
}
