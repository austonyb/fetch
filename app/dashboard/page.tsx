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
    const { breeds } = useBreeds()
    const { search } = useSearch({
        breeds: selectedBreed ? [selectedBreed] : undefined,
        size: 25 // Show 25 dogs per page by default
    })

    const handleBreedSelect = (breeds: string[]) => {
        // Take the last selected breed, or empty string if none selected
        setSelectedBreed(breeds[breeds.length - 1] || '')
    }

    const handleDogSelection = (dogs: Dog[]) => {
        setSelectedDogs(dogs)
    }

    return (
        <main className="min-h-screen p-8 bg-bw">
            <div className="container mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold font-publicSans text-text">Dashboard</h1>
                    <Logout />
                </div>
                
                <div className="max-w-md w-full mx-auto mb-8">
                    <Combobox 
                        breeds={breeds} 
                        onSelect={handleBreedSelect}
                        value={selectedBreed ? [selectedBreed] : []}
                    />
                    {selectedBreed && (
                        <p className="mt-4 text-center font-publicSans text-sm text-text">
                            Selected breed: {breeds.find(b => b.value === selectedBreed)?.label || selectedBreed}
                        </p>
                    )}
                </div>

                <div className="rounded-base border-2 border-border bg-main p-6">
                    <DataTable 
                        data={search.data} 
                        onRowSelect={handleDogSelection}
                    />
                    {selectedDogs.length > 0 && (
                        <div className="mt-4 text-right font-publicSans text-sm text-text">
                            {selectedDogs.length} dogs selected
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}