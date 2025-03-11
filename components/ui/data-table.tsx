"use client"

import * as React from "react"
import Image from "next/image"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { Dog } from "@/lib/types"

interface DataTableProps {
  data: Dog[]
  onLike?: (dogId: string) => void
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

export function DataTable({ data, onLike }: DataTableProps) {
  const [likedDogs, setLikedDogs] = React.useState<Record<string, boolean>>({})

  const handleLike = React.useCallback((dogId: string) => {
    setLikedDogs(prev => {
      const newState = { ...prev, [dogId]: !prev[dogId] }
      
      // Call the onLike prop if provided
      if (onLike) {
        onLike(dogId)
      }
      
      return newState
    })
  }, [onLike])

  return (
    <div className="w-full">
      <div className="rounded-base border-2 border-border bg-main overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-mtext font-publicSans">Photo</TableHead>
              <TableHead className="text-mtext font-publicSans">Name</TableHead>
              <TableHead className="text-mtext font-publicSans">Breed</TableHead>
              <TableHead className="text-mtext font-publicSans">Age</TableHead>
              <TableHead className="text-mtext font-publicSans">Location</TableHead>
              <TableHead className="text-mtext font-publicSans w-[50px]">Like</TableHead>
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
                  <TableCell className="font-publicSans text-text text-center">{dog.age}</TableCell>
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
                          likedDogs[dog.id] ? "fill-red-500 text-red-500" : "text-gray-500"
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
    </div>
  )
}