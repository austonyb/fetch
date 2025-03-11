'use client';

import { useState } from 'react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import useStore from '@/lib/hooks/useStore';

export default function Dashboard() {
    const [selectedBreed, setSelectedBreed] = useState<string>('')
    // Define searchParams with partial SearchParams type to avoid TypeScript errors
    const [searchParams, setSearchParams] = useState<Partial<{
        breeds: string[] | undefined,
        size: number,
        page: number,
        sort: any // Use any here to avoid TypeScript errors with template literals
    }>>({
        breeds: undefined,
        size: 25, // Show 25 dogs per page by default
        page: 0
    })

    const [sortState, setSortState] = useState<{
        field: string | null,
        direction: 'asc' | 'desc'
    }>({
        field: null,
        direction: 'asc'
    })

    const { breeds } = useBreeds()
    const { search } = useSearch(searchParams)

    const { likedDogs } = useStore()

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
                                <CardHeader>
                                    <CardTitle>Adopt</CardTitle>
                                    <CardDescription>
                                        Adopt a dog here.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="space-y-1">
                                        <Label htmlFor="current">Current password</Label>
                                        <Input id="current" type="password" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="new">New password</Label>
                                        <Input id="new" type="password" />
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button variant="noShadow" className="w-full bg-bw text-text">
                                        Save password
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