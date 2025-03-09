'use client';

import { useState } from 'react'
import Logout from '@/components/logout'
import { Combobox } from '@/components/ui/combobox'
import { useBreeds } from '@/lib/hooks/useBreeds'

export default function Dashboard() {
    const [selectedBreed, setSelectedBreed] = useState<string>('')
    const { breeds } = useBreeds()

    return (
        <main className="min-h-screen p-8">
            <div className="container mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold font-publicSans">Dashboard</h1>
                    <Logout />
                </div>
                
                <div className="max-w-md w-full mx-auto">
                    <Combobox 
                        breeds={breeds} 
                        onSelect={setSelectedBreed}
                    />
                    {selectedBreed && (
                        <p className="mt-4 text-center font-publicSans text-sm text-muted-foreground">
                            Selected breed ID: {selectedBreed}
                        </p>
                    )}
                </div>
            </div>
        </main>
    )
}