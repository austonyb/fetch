'use client';

import { useState, useEffect } from 'react'
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
import MapSelection from '@/components/map-selection';
import { Coordinates } from '@/lib/types';
import Image from "next/image"

export default function Dashboard() {
    const { width, height } = useWindowSize()
    const [selectedBreed, setSelectedBreed] = useState<string>('')
    // Define searchParams with partial SearchParams type to avoid TypeScript errors
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

    const [imageError, setImageError] = useState(false);
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
                                                className="flex items-center gap-2 font-publicSans"
                                            >
                                                {showLocationMap ? "Hide Location Filter" : "Filter by Location"}
                                                {locationFilter && <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">Active</span>}
                                            </Button>
                                            
                                            {locationFilter && (
                                                <Button 
                                                    variant="neutral" 
                                                    onClick={() => handleLocationSelect(null)}
                                                    className="text-sm font-publicSans text-gray-500"
                                                >
                                                    Clear Location
                                                </Button>
                                            )}
                                        </div>
                                        
                                        {showLocationMap && (
                                            <div className="mt-4">
                                                <div className="mb-2 text-sm font-publicSans text-gray-600">
                                                    <p>Navigate the map to focus on your desired area. Dogs from locations within the current map view will be displayed in the results.</p>
                                                </div>
                                                <div className="border rounded overflow-hidden">
                                                    <MapSelection 
                                                        onBoundsChange={handleLocationSelect}
                                                        height="300px"
                                                        mapStyle="light"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="rounded-base border-2 border-border bg-main p-6">
                                        {search.isLoading ? (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                {Array.from({ length: 6 }).map((_, index) => (
                                                    <div key={index} className="flex items-center p-4 space-x-3 border rounded">
                                                        <Skeleton className="h-12 w-12 rounded-full" />
                                                        <div className="flex-1 space-y-3">
                                                            <Skeleton className="h-3 w-3/4" />
                                                            <Skeleton className="h-2 w-1/3" />
                                                        </div>
                                                        <Skeleton className="h-8 w-8 rounded-full" />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : search.data.length === 0 ? (
                                            <div className="text-center py-6 font-publicSans">
                                                <p className="text-lg text-gray-500 mb-2">No dogs found</p>
                                                <p className="text-sm text-gray-400">
                                                    {locationFilter 
                                                        ? "Try selecting a different region on the map, or clear the location filter" 
                                                        : "Try selecting a different breed"}
                                                </p>
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
                                                <div className="relative w-full h-80 mb-4 overflow-hidden rounded-md">
                                                    <Image 
                                                        src={matchedDog.img}
                                                        alt={matchedDog.name}
                                                        layout="fill"
                                                        objectFit="cover"
                                                        className="rounded-md"
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <div className="mb-4">
                                                        <p className="py-1"><span className="font-semibold">Breed:</span> {matchedDog.breed}</p>
                                                        <p className="py-1"><span className="font-semibold">Age:</span> {matchedDog.age} years</p>
                                                        <p className="py-1"><span className="font-semibold">Zip Code:</span> {matchedDog.zip_code}</p>
                                                    </div>
                                                    {matchedDog.zip_code && (
                                                        <div className="h-[200px] mt-2 rounded-md overflow-hidden border border-gray-200 flex-grow">
                                                            <Map zipCode={matchedDog.zip_code} dogName={matchedDog.name} mapStyle="light" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className='flex flex-col gap-2'>
                                    <Button
                                        className="w-full bg-bw text-text font-publicSans"
                                        onClick={handleFindMatch}
                                        disabled={isLoading || likedDogs.length === 0}
                                    >
                                        {isLoading ? 'Finding your match...' : 'Find your perfect match'}
                                    </Button>
                                    <Button
                                        className="w-full font-publicSans"
                                        onClick={emptyLikedDogs}
                                        variant="destructive"
                                    >
                                        Clear liked dogs
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>
                    </Tabs>
                    <Confetti
                        width={width}
                        height={height}
                        recycle={false}
                        run={showConfetti && !!matchedDog && !isLoading}
                    />
                </div>
            </main>
        </>
    )
}