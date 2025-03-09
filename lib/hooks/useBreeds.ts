import useSWR from 'swr';

export interface Breed {
  value: string;
  label: string;
}

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