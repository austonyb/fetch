import useSWR from 'swr';
import { useState } from 'react';


const postFetcher = (url: string, dogIds: string[]) => 
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      credentials: 'include'
    },
    body: JSON.stringify(dogIds)
  }).then(res => res.json());

export function useMatch(dogIds: string[]) {
  
  const [requestId, setRequestId] = useState(0);
  
  
  const fetchKey = dogIds.length > 0 && requestId > 0 ? 
    ['/api/dogs/match', JSON.stringify(dogIds), requestId.toString()] : null;
  
  const { data, error, isLoading } = useSWR(
    fetchKey,
    
    ([url]) => postFetcher(url, dogIds),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 0 
    }
  );

  
  const findMatch = () => {
    if (dogIds.length > 0) {
      setRequestId(prev => prev + 1);
    }
  };

  return {
    match: data,
    isLoading,
    isError: error,
    findMatch
  };
}