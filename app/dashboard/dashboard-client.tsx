"use client"

import { useState, useEffect, Suspense } from 'react'
import Logout from '@/components/logout'
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
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import useStore from '@/lib/hooks/useStore';
import { useMatch } from '@/lib/hooks/useMatch'
import { useDog } from '@/lib/hooks/useDog'
import dynamic from 'next/dynamic'
import { Coordinates } from '@/lib/types';
import Image from "next/image"

// Dynamically import components with window dependencies
const Confetti = dynamic(() => import('react-confetti'), {
    ssr: false
})

const Map = dynamic(() => import('@/components/map'), {
    ssr: false
})

const MapSelection = dynamic(() => import('@/components/map-selection'), {
    ssr: false
})

export default function DashboardClient() {
    const [mounted, setMounted] = useState(false);
    // Safely initialize window size
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
    const [selectedBreed, setSelectedBreed] = useState<string>('')
    const [searchParams, setSearchParams] = useState<Partial<{
        breeds: string[] | undefined,
        size: number,
        page: number,
        sort?: `${'breeds' | 'zipCodes' | 'ageMin' | 'ageMax' | 'size' | 'age' | 'name' | 'breed'}:${'asc' | 'desc'}`,
        geoBoundingBox: {
            top_left: Coordinates,
            bottom_right: Coordinates
        } | null
    }>>({
        breeds: undefined,
        size: 25,
        page: 0,
        geoBoundingBox: null
    })

    const [sortState, setSortState] = useState<{
        field: string | null,
        direction: 'asc' | 'desc'
    }>({
        field: null,
        direction: 'asc'
    })

    const [showLocationMap, setShowLocationMap] = useState(false);
    const [locationFilter, setLocationFilter] = useState<{
        top_left: Coordinates,
        bottom_right: Coordinates
    } | null>(null);

    const [showConfetti, setShowConfetti] = useState(false)
    const [matchError, setMatchError] = useState<string | null>(null);

    const { breeds } = useBreeds()
    const { search } = useSearch(searchParams)

    const { likedDogs, emptyLikedDogs } = useStore()
    const { match, isLoading: isMatchLoading, findMatch } = useMatch(likedDogs)

    // Use the matched dog ID to fetch the full dog details
    const { dog: matchedDog, isLoading: isDogLoading } = useDog(match || "");

    // Combined loading state
    const isLoading = isMatchLoading || (match && isDogLoading);

    // This effect safely captures window size on the client side only
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setMounted(true);
            
            // Update window size
            const updateWindowSize = () => {
                setWindowSize({
                    width: window.innerWidth,
                    height: window.innerHeight
                });
            };
            
            // Set initial size
            updateWindowSize();
            
            // Add event listener
            window.addEventListener('resize', updateWindowSize);
            
            // Clean up
            return () => window.removeEventListener('resize', updateWindowSize);
        }
    }, []);

    // Effect to show confetti when matched dog data arrives
    useEffect(() => {
        if (matchedDog && !isLoading) {
            setShowConfetti(true);
            setMatchError(null);
        } else if (match && !matchedDog && !isDogLoading) {
            // If we have a match ID but no dog data, it means there was an error fetching the dog
            setMatchError("Couldn&apos;t load the details of your matched dog.");
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

    const handleLocationSelect = (boundingBox: { top_left: Coordinates, bottom_right: Coordinates } | null) => {
        setLocationFilter(boundingBox);

        setSearchParams(prev => ({
            ...prev,
            geoBoundingBox: boundingBox,
            page: 0
        }));
    }

    const toggleLocationMap = () => {
        setShowLocationMap(!showLocationMap);
    }

    const handlePageChange = (page: number) => {
        setSearchParams(prev => ({
            ...prev,
            page
        }))
    }

    const handleSort = (field: string, direction: 'asc' | 'desc') => {
        setSortState({ field, direction });

        // Ensure field is valid for sort parameter
        const validFields = ['breeds', 'zipCodes', 'ageMin', 'ageMax', 'size', 'age', 'name', 'breed'] as const;
        //eslint-disable-next-line
        const validField = validFields.includes(field as any) ? field as typeof validFields[number] : 'name';
        
        // Create properly typed sort string
        const sortString = `${validField}:${direction}` as const;

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

    // Show a loading skeleton while the client-side component is mounting
    if (!mounted) {
        return (
            <div className="w-full animate-pulse">
                <div className="h-20 bg-gray-200 mb-4 rounded-md"></div>
                <div className="h-[600px] bg-gray-200 rounded-md"></div>
            </div>
        );
    }

    return (
        <>
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
                                <div className="mx-auto mb-4">
                                    <div className="mb-6">
                                        <div className="flex flex-wrap items-center gap-3 mb-3 relative">
                                            <div className="w-[220px] relative" style={{ zIndex: 99 }}>
                                                <Combobox
                                                    breeds={breeds}
                                                    onSelect={handleBreedSelect}
                                                    value={selectedBreed ? [selectedBreed] : []}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mb-4">
                                    <div className="flex items-center justify-between">
                                        <Button 
                                            onClick={toggleLocationMap} 
                                            variant={showLocationMap ? "default" : "neutral"}
                                        >
                                            {showLocationMap ? 'Hide Map Filter' : 'Filter by Location'}
                                        </Button>
                                        
                                        {locationFilter && (
                                            <Button 
                                                variant="destructive" 
                                                onClick={() => handleLocationSelect(null)}
                                            >
                                                Clear Location Filter
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {showLocationMap && (
                                    <div className="mb-4 rounded-md overflow-hidden" style={{ height: '400px' }}>
                                        <Suspense fallback={<div className="w-full h-full bg-gray-200 animate-pulse"></div>}>
                                            <MapSelection onBoundsChange={handleLocationSelect} />
                                        </Suspense>
                                    </div>
                                )}

                                <DataTable 
                                    data={search?.data || []} 
                                    totalCount={search?.total || 0}
                                    currentPage={searchParams.page || 0}
                                    pageSize={searchParams.size || 25}
                                    onPageChange={handlePageChange}
                                    onSort={handleSort}
                                    sortField={sortState.field || undefined}
                                    sortDirection={sortState.direction}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="adopt">
                        <Card>
                            <CardHeader>
                                <CardTitle>Find Your Perfect Match</CardTitle>
                                <CardDescription>
                                    Now that you&apos;ve liked some dogs, let us find your perfect match! Click the button below to find the dog that&apos;s been waiting for you.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {!matchedDog && (
                                    <div className="flex flex-col items-center justify-center p-6 border-2 border-border rounded-base bg-bw">
                                        <Button 
                                            onClick={handleFindMatch} 
                                            className="px-8"
                                            disabled={isLoading || likedDogs.length === 0}
                                        >
                                            {isLoading ? 'Finding Match...' : 'Find My Match'}
                                        </Button>
                                        {matchError && (
                                            <p className="mt-4 text-red-500">{matchError}</p>
                                        )}
                                        {likedDogs.length === 0 && !isLoading && !matchError && (
                                            <p className="mt-4 text-gray-500">You haven&apos;t liked any dogs yet. Go to the Dogs tab and like some dogs first!</p>
                                        )}
                                    </div>
                                )}

                                {matchedDog && (
                                    <div className="text-center">
                                        <div className="border-2 border-border rounded-base shadow-shadow p-6 bg-main text-mtext relative overflow-hidden">
                                            <div className="flex flex-col md:flex-row gap-6">
                                                <div className="flex-1">
                                                    <Image
                                                        src={matchedDog.img}
                                                        alt={matchedDog.name}
                                                        width={400}
                                                        height={400}
                                                        className="mx-auto rounded-base shadow-shadow border-2 border-border"
                                                    />
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <h3 className="text-3xl font-heading mb-2">{matchedDog.name}</h3>
                                                    <p className="mb-4">Breed: {matchedDog.breed}</p>
                                                    <p className="mb-4">Age: {matchedDog.age} years</p>
                                                    <p className="mb-4">Zip Code: {matchedDog.zip_code}</p>
                                                    <div className="h-[250px] rounded-base overflow-hidden mb-4">
                                                        <Suspense fallback={<Skeleton className="w-full h-full" />}>
                                                            <Map 
                                                                zipCode={matchedDog.zip_code} 
                                                                dogName={matchedDog.name}
                                                                height="100%"
                                                                mapStyle="pastel"
                                                            />
                                                        </Suspense>
                                                    </div>
                                                    <Button 
                                                        onClick={() => {
                                                            // Reset the match
                                                            emptyLikedDogs();
                                                            setShowConfetti(false);
                                                        }}
                                                    >
                                                        Start Over
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
            {showConfetti && matchedDog && (
                <Confetti
                    width={windowSize.width}
                    height={windowSize.height}
                    recycle={false}
                    numberOfPieces={200}
                    gravity={0.15}
                />
            )}
        </>
    )
}
