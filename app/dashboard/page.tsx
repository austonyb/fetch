'use client';

import { useState } from 'react'
import Logout from '@/components/logout'
import { Combobox } from '@/components/ui/combobox'
import { useBreeds } from '@/lib/hooks/useBreeds'
import { useDog } from '@/lib/hooks/useDog'
import { useSearch } from '@/lib/hooks/useSearch'
import { DataTable } from '@/components/ui/data-table'
import type { Dog } from '@/types'

export default function Dashboard() {
    const [selectedBreed, setSelectedBreed] = useState<string>('')
    const [selectedDogs, setSelectedDogs] = useState<Dog[]>([])
    const [likedDogIds, setLikedDogIds] = useState<string[]>([])
    const [searchParams, setSearchParams] = useState<{
        breeds: string[] | undefined,
        size: number
    }>({
        breeds: undefined,
        size: 25 // Show 25 dogs per page by default
    })
    
    const { breeds } = useBreeds()
    const { search, mutateSearch } = useSearch(searchParams)

    const handleBreedSelect = (breeds: string[]) => {
        // Take the last selected breed, or empty string if none selected
        const selectedBreed = breeds[breeds.length - 1] || ''
        
        // Update the selected breed state
        setSelectedBreed(selectedBreed)
        
        // Update search parameters to trigger a new search
        setSearchParams(prev => ({
            ...prev,
            breeds: selectedBreed ? [selectedBreed] : undefined
        }))
    }

    const handleLikeDog = (dogId: string) => {
        setLikedDogIds(prev => {
            // If already liked, remove it, otherwise add it
            return prev.includes(dogId) 
                ? prev.filter(id => id !== dogId) 
                : [...prev, dogId]
        })
    }

    return (
        <main className="min-h-screen p-8 bg-bw">
            <div className="container mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold font-publicSans text-text">Dog Adoption</h1>
                    <Logout />
                </div>
                
                <div className="max-w-md w-full mx-auto mb-8">
                    <Combobox 
                        breeds={breeds} 
                        onSelect={handleBreedSelect}
                        value={selectedBreed ? [selectedBreed] : []}
                    />
                    {/* {selectedBreed && (
                        <p className="mt-4 text-center font-publicSans text-sm text-text">
                            Selected breed: {breeds.find(b => b.value === selectedBreed)?.label || selectedBreed}
                        </p>
                    )} */}
                </div>

                <div className="rounded-base border-2 border-border bg-main p-6">
                    <DataTable 
                        data={search.data} 
                        onLike={handleLikeDog}
                    />
                    {likedDogIds.length > 0 && (
                        <div className="mt-4 text-right font-publicSans text-sm text-text">
                            {likedDogIds.length} dog{likedDogIds.length === 1 ? '' : 's'} liked
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}