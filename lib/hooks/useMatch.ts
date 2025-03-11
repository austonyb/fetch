import useSWR from 'swr';
import { useState } from 'react';
import { Dog } from '@/types';

// Custom fetcher that makes a POST request with dog IDs
const postFetcher = (url: string, dogIds: string[]) => 
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dogIds)
  }).then(res => res.json());

export function useMatch(dogIds: string[]) {
  // State to track if we should fetch and add a requestId to force refetching
  const [requestId, setRequestId] = useState(0);
  
  // Create a unique key for each request - convert to string to avoid type issues
  const fetchKey = dogIds.length > 0 && requestId > 0 ? 
    ['/api/dogs/match', JSON.stringify(dogIds), requestId.toString()] : null;
  
  const { data, error, isLoading } = useSWR(
    fetchKey,
    // The actual dogIds are passed in the fetcher, not from the key
    ([url]) => postFetcher(url, dogIds),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 0 // Disable deduping to ensure refetching
    }
  );

  // Function to trigger the fetch by incrementing requestId
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