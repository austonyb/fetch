'use client'

import { useState, useEffect } from 'react'
import Logout from '@/components/logout'

export default function Dashboard() {
    const [breeds, setBreeds] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    
    useEffect(() => {
        setLoading(true)
        
        async function fetchBreeds() {
            try {
                const response = await fetch('/api/breeds', {
                    credentials: 'include', // Include cookies for our own API
                })
                
                if (!response.ok) {
                    const errorText = await response.text()
                    console.error('Error response:', errorText)
                    
                    // If unauthorized, redirect to login
                    if (response.status === 401) {
                        window.location.href = '/login'
                        return
                    }
                    
                    throw new Error(`Failed to fetch breeds: ${response.status} ${response.statusText}`)
                }
                
                const data = await response.json()
                setBreeds(data)
            } catch (error) {
                console.error('Error fetching breeds:', error)
            } finally {
                setLoading(false)
            }
        }
        
        fetchBreeds()
    }, [])
    
    return (
        <div className="grid items-center justify-items-center p-8">
            <Logout />
            {loading ? (
                <p className="text-lg font-publicSans">Loading breeds...</p>
            ) : (
                <div>
                    <h2 className="text-2xl font-bold mb-4 font-publicSans">Available Breeds</h2>
                    <div className="grid grid-cols-3 gap-4">
                        {breeds.length > 0 ? (
                            breeds.map((breed) => (
                                <div key={breed} className="p-2 border rounded font-publicSans">
                                    {breed}
                                </div>
                            ))
                        ) : (
                            <p className="col-span-3 text-center text-gray-500 font-publicSans">No breeds available</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}