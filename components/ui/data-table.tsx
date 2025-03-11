"use client"

import * as React from "react"
import Image from "next/image"
import { Heart, ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import useStore from "@/lib/hooks/useStore"
import { cn } from "@/lib/utils"
import type { Dog } from "@/lib/types"

interface DataTableProps {
  data: Dog[]
  onLike?: (dogId: string) => void
  totalCount?: number
  currentPage: number
  onPageChange: (page: number) => void
  pageSize: number
  onSort?: (field: string, direction: 'asc' | 'desc') => void
  sortField?: string
  sortDirection?: 'asc' | 'desc'
}

function DogImage({ src, name }: { src: string; name: string }) {
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState(false)

  return (
    <div className="relative h-12 w-12 overflow-hidden rounded-base border-2 border-border bg-bw">
      {error ? (
        <div className="flex h-full w-full items-center justify-center bg-bw">
          <span className="text-xs text-text">No img</span>
        </div>
      ) : (
        <Image
          src={src}
          alt={`Photo of ${name}`}
          fill
          className={cn(
            "object-cover transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          sizes="48px"
          priority={false}
          onLoad={() => setIsLoading(false)}
          onError={() => setError(true)}
        />
      )}
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-bw">
          <div className="h-6 w-6 animate-pulse rounded-full bg-border" />
        </div>
      )}
    </div>
  )
}

export function DataTable({ 
  data, 
  onLike, 
  totalCount = 0,
  currentPage = 0,
  onPageChange,
  pageSize = 25,
  onSort,
  sortField,
  sortDirection = 'asc'
}: DataTableProps) {
  const { likedDogs, addLikedDog, removeLikedDog } = useStore()

  const handleLike = React.useCallback((dogId: string) => {
    const isLiked = likedDogs.includes(dogId)
    
    if (isLiked) {
      removeLikedDog(dogId)
    } else {
      addLikedDog(dogId)
    }
    
    if (onLike) {
      onLike(dogId)
    }
  }, [likedDogs, addLikedDog, removeLikedDog, onLike])

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const canGoNext = currentPage < totalPages - 1;
  const canGoPrevious = currentPage > 0;
  
  // Handle sorting
  const handleSortChange = (field: string) => {
    if (!onSort) return;
    
    // If clicking the same field, toggle direction
    if (field === sortField) {
      onSort(field, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to ascending for a new field
      onSort(field, 'asc');
    }
  };

  // Helper to show sort indicators
  const getSortIcon = (field: string) => {
    if (field !== sortField) return null;
    
    return sortDirection === 'asc' 
      ? <ChevronUp className="ml-1 h-4 w-4" />
      : <ChevronDown className="ml-1 h-4 w-4" />;
  };

  return (
    <div className="w-full">
      <div className="rounded-base border-2 border-border bg-main overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-none">
              <TableHead className="font-bold font-publicSans">Image</TableHead>
              <TableHead 
                className="font-bold font-publicSans cursor-pointer"
                onClick={() => handleSortChange('name')}
              >
                <div className="flex items-center">
                  Name
                  {getSortIcon('name')}
                </div>
              </TableHead>
              <TableHead 
                className="font-bold font-publicSans cursor-pointer"
                onClick={() => handleSortChange('breed')}
              >
                <div className="flex items-center">
                  Breed
                  {getSortIcon('breed')}
                </div>
              </TableHead>
              <TableHead 
                className="font-bold font-publicSans cursor-pointer"
                onClick={() => handleSortChange('age')}
              >
                <div className="flex items-center">
                  Age
                  {getSortIcon('age')}
                </div>
              </TableHead>
              <TableHead className="font-bold font-publicSans">Zip Code</TableHead>
              <TableHead className="font-bold font-publicSans"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data && data.length > 0 ? (
              data.map((dog) => (
                <TableRow key={dog.id}>
                  <TableCell>
                    <DogImage src={dog.img} name={dog.name} />
                  </TableCell>
                  <TableCell className="font-publicSans text-text">{dog.name}</TableCell>
                  <TableCell className="font-publicSans text-text">{dog.breed}</TableCell>
                  <TableCell className="font-publicSans text-text">{dog.age}</TableCell>
                  <TableCell className="font-publicSans text-text">{dog.zip_code}</TableCell>
                  <TableCell>
                    <Button 
                      variant="noShadow" 
                      size="icon" 
                      onClick={() => handleLike(dog.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Heart 
                        className={cn(
                          "h-5 w-5 transition-colors", 
                          likedDogs.includes(dog.id) ? "fill-red-500 text-red-500" : "text-gray-500"
                        )} 
                      />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-mtext font-publicSans">
                  No dogs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-text flex-1 text-sm font-publicSans">
          {data.length > 0 ? (
            <>
              Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalCount)} of {totalCount} dogs
            </>
          ) : (
            "No dogs found"
          )}
        </div>
        <div className="space-x-2">
          <Button
            variant="noShadow"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!canGoPrevious}
            className="font-publicSans"
          >
            Previous
          </Button>
          <Button
            variant="noShadow"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!canGoNext}
            className="font-publicSans"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}