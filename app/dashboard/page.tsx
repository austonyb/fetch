'use client';

import { useState, useEffect } from 'react'
import Image from "next/image"
import Logout from '@/components/logout'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Combobox } from '@/components/ui/combobox'
import { useBreeds } from '@/lib/hooks/useBreeds'
import { useSearch } from '@/lib/hooks/useSearch'
import { DataTable } from '@/components/ui/data-table'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import useStore from '@/lib/hooks/useStore';
import { useMatch } from '@/lib/hooks/useMatch'
import { useDog } from '@/lib/hooks/useDog'
import { useWindowSize } from 'react-use'
import Confetti from 'react-confetti';
import Map from '@/components/map';

export default function Dashboard() {
    const { width, height } = useWindowSize()
    const [selectedBreed, setSelectedBreed] = useState<string>('')
    // Define searchParams with partial SearchParams type to avoid TypeScript errors
    const [searchParams, setSearchParams] = useState<Partial<{
        breeds: string[] | undefined,
        size: number,
        page: number,
        sort: any
    }>>({
        breeds: undefined,
        size: 25,
        page: 0
    })

    const [sortState, setSortState] = useState<{
        field: string | null,
        direction: 'asc' | 'desc'
    }>({
        field: null,
        direction: 'asc'
    })

    const [showConfetti, setShowConfetti] = useState(false)
    const [matchError, setMatchError] = useState<string | null>(null);
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);

    const { breeds } = useBreeds()
    const { search } = useSearch(searchParams)

    const { likedDogs } = useStore()
    const { match, isLoading: isMatchLoading, findMatch } = useMatch(likedDogs)

    // Use the matched dog ID to fetch the full dog details
    const { dog: matchedDog, isLoading: isDogLoading } = useDog(match || "");

    // Combined loading state
    const isLoading = isMatchLoading || (match && isDogLoading);

    // Effect to show confetti when matched dog data arrives
    useEffect(() => {
        if (matchedDog && !isLoading) {
            setShowConfetti(true);
            setMatchError(null);
            setImageError(false); // Reset image error state when new match is found
        } else if (match && !matchedDog && !isDogLoading) {
            // If we have a match ID but no dog data, it means there was an error fetching the dog
            setMatchError("Couldn't load the details of your matched dog.");
        }
    }, [matchedDog, isLoading, match, isDogLoading]);

    const handleBreedSelect = (breeds: string[]) => {
        // Take the last selected breed, or empty string if none selected
        const selectedBreed = breeds[breeds.length - 1] || ''

        // Update the selected breed state
        setSelectedBreed(selectedBreed)

        // Update search parameters to trigger a new search
        // Reset to page 0 when breed changes
        setSearchParams(prev => ({
            ...prev,
            breeds: selectedBreed ? [selectedBreed] : undefined,
            page: 0
        }))
    }

    const handlePageChange = (page: number) => {
        setSearchParams(prev => ({
            ...prev,
            page
        }))
    }

    const handleSort = (field: string, direction: 'asc' | 'desc') => {
        setSortState({ field, direction });

        const sortString = `${field}:${direction}` as const;

        setSearchParams(prev => ({
            ...prev,
            sort: sortString,
            page: 0
        }));
    }

    const handleFindMatch = () => {
        setMatchError(null);

        // Don't attempt to find a match if no dogs are liked
        if (likedDogs.length === 0) {
            setMatchError("Please like some dogs first!");
            return;
        }

        findMatch();
    }

    return (
        <>
            <main className="min-h-screen p-8 bg-bw">
                <div className="container mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-4xl font-bold font-publicSans text-text">Dog Adoption</h1>
                        <Logout />
                    </div>
                    <Tabs defaultValue="dogs">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="dogs">Dogs</TabsTrigger>
                            <TabsTrigger value="adopt">Adopt</TabsTrigger>
                        </TabsList>
                        <TabsContent value="dogs">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Dogs Across the USA</CardTitle>
                                    <CardDescription>
                                        Browse dogs across the USA. Like all of the dogs you fancy, then head to the adoption tab to find your best match.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="mx-auto mb-8">
                                        <Combobox
                                            breeds={breeds}
                                            onSelect={handleBreedSelect}
                                            value={selectedBreed ? [selectedBreed] : []}
                                        />
                                    </div>

                                    <div className="rounded-base border-2 border-border bg-main p-6">
                                        {search.isLoading ? (
                                            <div className="space-y-4">
                                                <div className="h-8 w-full flex items-center gap-4">
                                                    <Skeleton className="h-6 w-16" />
                                                    <Skeleton className="h-6 w-24" />
                                                    <Skeleton className="h-6 w-20" />
                                                    <Skeleton className="h-6 w-12" />
                                                    <Skeleton className="h-6 w-24" />
                                                    <Skeleton className="h-6 w-8" />
                                                </div>
                                                {[...Array(5)].map((_, index) => (
                                                    <div key={index} className="h-16 w-full flex items-center gap-4">
                                                        <Skeleton className="h-12 w-12 rounded-base" />
                                                        <Skeleton className="h-5 w-32" />
                                                        <Skeleton className="h-5 w-48" />
                                                        <Skeleton className="h-5 w-8" />
                                                        <Skeleton className="h-5 w-16" />
                                                        <Skeleton className="h-8 w-8 rounded-full" />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <DataTable
                                                data={search.data || []}
                                                totalCount={search.total}
                                                currentPage={searchParams.page || 0}
                                                onPageChange={handlePageChange}
                                                pageSize={searchParams.size || 25}
                                                onSort={handleSort}
                                                sortField={sortState.field || undefined}
                                                sortDirection={sortState.direction}
                                            />
                                        )}
                                        {likedDogs.length > 0 && (
                                            <div className="mt-4 text-right font-publicSans text-sm text-text">
                                                {likedDogs.length} dog{likedDogs.length === 1 ? '' : 's'} liked
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="adopt">
                            <Card>
                                <Confetti
                                    width={width}
                                    height={height}
                                    recycle={false}
                                    run={showConfetti && !!matchedDog && !isLoading}
                                />
                                <CardHeader>
                                    <CardTitle>Adopt</CardTitle>
                                    <CardDescription>
                                        Adopt a dog here!
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    You have selected {likedDogs.length} dog{likedDogs.length === 1 ? '' : 's'}
                                    <br />
                                    What will your match be?

                                    {matchError && (
                                        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md font-publicSans text-sm">
                                            {matchError}
                                        </div>
                                    )}

                                    {matchedDog && (
                                        <div className="mt-4">
                                            <h3 className="font-bold text-lg mb-2">Your Match: {matchedDog.name}</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded font-publicSans">
                                                <div className="bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center h-full min-h-[300px]">
                                                    {!imageError ? (
                                                        <img 
                                                            src={matchedDog.img} 
                                                            alt={`Photo of ${matchedDog.name}`}
                                                            className="max-w-full max-h-full object-contain p-2"
                                                            onError={() => setImageError(true)}
                                                        />
                                                    ) : (
                                                        <div className="font-publicSans text-2xl font-semibold">
                                                            {matchedDog.name[0]}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <div className="mb-4">
                                                        <p className="py-1"><span className="font-semibold">Breed:</span> {matchedDog.breed}</p>
                                                        <p className="py-1"><span className="font-semibold">Age:</span> {matchedDog.age} years</p>
                                                        <p className="py-1"><span className="font-semibold">Zip Code:</span> {matchedDog.zip_code}</p>
                                                    </div>
                                                    {matchedDog.zip_code && (
                                                        <div className="h-[200px] mt-2 rounded-md overflow-hidden border border-gray-200 flex-grow">
                                                            <Map zipCode={matchedDog.zip_code} dogName={matchedDog.name} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        className="w-full bg-bw text-text font-publicSans"
                                        onClick={handleFindMatch}
                                        disabled={isLoading || likedDogs.length === 0}
                                    >
                                        {isLoading ? 'Finding your match...' : 'Find your perfect match'}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </>
    )
}