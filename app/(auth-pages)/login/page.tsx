'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function Login() {
    const [formData, setFormData] = useState({
        name: '',
        email: ''
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')
        setSuccess(false)
        
        try {
            console.log('Sending login request...');
            
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
                credentials: 'include' 
            })
            
            
            console.log('Login response status:', response.status);
            const headers: Record<string, string> = {};
            response.headers.forEach((value, key) => {
                headers[key] = value;
                console.log(`Response header ${key}:`, value);
            });
            
            
            console.log('Document cookies:', document.cookie);
            
            const data = await response.json()
            console.log('Login response data:', data);
            
            if (!response.ok) {
                throw new Error(data.error || (data.message && typeof data.message === 'string' ? data.message : 'Login failed'))
            }
            
            setSuccess(true)
            console.log('Login successful:', data.message)

            
            setTimeout(() => {
                if (typeof window !== 'undefined') {
                    window.location.href = '/dashboard'
                }
            }, 500)
            
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
            console.error('Login error:', err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="grid items-center justify-items-center p-8">
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
            {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">Login successful!</div>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Input 
                        className="w-full" 
                        type="text" 
                        name="name"
                        placeholder="Name" 
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <Input 
                        className="w-full" 
                        type="email" 
                        name="email"
                        placeholder="Email" 
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <Button 
                    className="w-full" 
                    type="submit"
                    disabled={isLoading}
                >
                    {isLoading ? 'Logging in...' : 'Login'}
                </Button>
            </form>
        </div>
    )
}