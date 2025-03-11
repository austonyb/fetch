import useSWR from 'swr';

import { Dog } from '@/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useDog(id: string) {
  const { data, error, isLoading } = useSWR<Dog>(
    `/api/dogs/${id}`,
    fetcher
  );

  return {
    dog: data || null, 
    isLoading,
    isError: error
  };
}
