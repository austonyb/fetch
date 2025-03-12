"use client"

import * as React from "react"
import Image from "next/image"
import { Heart, ChevronUp, ChevronDown, MapPin } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import Map from "@/components/map"
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

  const handleLike = React.useCallback((dogId: string, e: React.MouseEvent) => {
    
    e.stopPropagation();
    
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

  
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const canGoNext = currentPage < totalPages - 1;
  const canGoPrevious = currentPage > 0;
  
  
  const handleSortChange = (field: string) => {
    if (!onSort) return;
    
    
    if (field === sortField) {
      onSort(field, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      
      onSort(field, 'asc');
    }
  };

  
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
            {data.map((dog) => (
              <Dialog key={dog.id}>
                <DialogTrigger asChild>
                  <TableRow className="border-t-2 border-border cursor-pointer hover:bg-gray-50">
                    <TableCell className="w-[60px]">
                      <DogImage src={dog.img} name={dog.name} />
                    </TableCell>
                    <TableCell className="font-publicSans text-text">{dog.name}</TableCell>
                    <TableCell className="font-publicSans text-text">{dog.breed}</TableCell>
                    <TableCell className="font-publicSans text-text">{dog.age}</TableCell>
                    <TableCell className="font-publicSans text-text">{dog.zip_code}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="noShadow" 
                        size="icon" 
                        onClick={(e) => handleLike(dog.id, e)}
                        className={likedDogs.includes(dog.id) ? 'text-red-500' : 'text-gray-400'}
                      >
                        <Heart className="h-4 w-4" fill={likedDogs.includes(dog.id) ? 'currentColor' : 'none'} />
                      </Button>
                    </TableCell>
                  </TableRow>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px]" style={{ zIndex: 999 }}>
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-publicSans">{dog.name}</DialogTitle>
                    <DialogDescription className="text-md font-publicSans">
                      {dog.breed}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="py-4">
                    <div className="flex items-start gap-6">
                      <div className="w-1/3">
                        <div className="w-full h-40 overflow-hidden rounded-base mb-2">
                          <Image
                            src={dog.img}
                            alt={dog.name}
                            width={200}
                            height={160}
                            quality={90}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <Button 
                          variant="noShadow" 
                          size="sm"
                          className="w-full mt-2"
                          onClick={(e) => handleLike(dog.id, e)}
                        >
                          <Heart className="h-4 w-4 mr-2" fill={likedDogs.includes(dog.id) ? 'currentColor' : 'none'} />
                          {likedDogs.includes(dog.id) ? 'Liked' : 'Like'}
                        </Button>
                      </div>
                      <div className="w-2/3">
                        <div className="grid grid-cols-1 gap-y-4">
                          <div>
                            <Label className="text-sm text-gray-500">Age</Label>
                            <p className="font-bold font-publicSans">{dog.age} years</p>
                          </div>
                          <div>
                            <Label className="text-sm text-gray-500">Location</Label>
                            <p className="font-bold font-publicSans flex items-center mb-2">
                              <MapPin className="h-4 w-4 mr-1" /> {dog.zip_code}
                            </p>
                            <div className="h-[200px] rounded-md overflow-hidden border border-gray-200">
                              <Map zipCode={dog.zip_code} mapStyle="light" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    {dog.age < 5 ? 'What a cute pupper!' : 'Nice dog!'}
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4 flex justify-between items-center font-publicSans">
        <div className="text-sm text-text">
          Showing {Math.min(totalCount, (currentPage * pageSize) + 1)}-{Math.min(totalCount, (currentPage + 1) * pageSize)} of {totalCount} dogs
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="noShadow" 
            size="sm" 
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!canGoPrevious}
          >
            Previous
          </Button>
          <div className="text-sm text-text">
            Page {currentPage + 1} of {totalPages}
          </div>
          <Button 
            variant="noShadow" 
            size="sm" 
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!canGoNext}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}