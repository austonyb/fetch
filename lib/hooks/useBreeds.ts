import useSWR from 'swr';

import { Breed } from '@/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useBreeds() {
  const { data, error, isLoading } = useSWR<Breed[]>(
    '/api/dogs/breeds',
    fetcher
  );

  return {
    breeds: data || [], 
    isLoading,
    isError: error
  };
}