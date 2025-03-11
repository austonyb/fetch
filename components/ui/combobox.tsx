"use client"

import { CommandList } from "cmdk"
import { Check, ChevronsUpDown, X } from "lucide-react"
import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ComboboxProps {
  breeds: { value: string; label: string; }[]
  onSelect?: (values: string[]) => void
  value?: string[]
  defaultValue?: string[]
  multiple?: boolean
}

export function Combobox({ 
  breeds = [], 
  onSelect,
  value: controlledValues,
  defaultValue = [],
  multiple = false
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [localValues, setLocalValues] = React.useState<string[]>(defaultValue)
  const [activeIndex, setActiveIndex] = React.useState<number>(-1)

  // Ensure breeds is always an array
  const safeBreeds = React.useMemo(() => {
    return Array.isArray(breeds) ? breeds : []
  }, [breeds])

  // Use controlled or uncontrolled values
  const values = controlledValues ?? localValues
  const setValue = React.useCallback((newValues: string[]) => {
    // In single select mode, only keep the last value
    const finalValues = multiple ? newValues : newValues.slice(-1)
    setLocalValues(finalValues)
    onSelect?.(finalValues)
  }, [onSelect, multiple])

  // Keyboard navigation
  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (!open) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex(prev => Math.min(prev + 1, safeBreeds.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex(prev => Math.max(prev - 1, -1))
        break
      case ' ':
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0) {
          const breed = safeBreeds[activeIndex]
          const newValues = values.includes(breed.value)
            ? values.filter(v => v !== breed.value)
            : [...values, breed.value]
          setValue(newValues)
        }
        break
      case 'Escape':
        setOpen(false)
        break
    }
  }, [open, safeBreeds, activeIndex, values, setValue])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="noShadow"
          role="combobox"
          aria-expanded={open}
          className="w-[300px] justify-between font-publicSans group relative"
        >
          <div className="flex-1 truncate text-left text-text">
            {values.length > 0 ? (
              <span className="mr-2">
                {values.map(v => safeBreeds.find((breed) => breed.value === v)?.label || v).join(", ")}
              </span>
            ) : (
              "Select breeds..."
            )}
          </div>
          <div className="flex items-center gap-1">
            {values.length > 0 && (
              <>
                {multiple && (
                  <Badge 
                    variant="neutral" 
                    className="rounded-base px-2 font-normal font-publicSans bg-bw text-text"
                  >
                    {values.length}
                  </Badge>
                )}
                <div
                  role="button"
                  tabIndex={0}
                  className="h-4 w-4 p-0 opacity-70 hover:opacity-100 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    setValue([])
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      e.stopPropagation()
                      setValue([])
                    }
                  }}
                >
                  <X className="h-3 w-3 text-text" />
                </div>
              </>
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 text-text" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 border-2 border-border bg-bw">
        <Command 
          className="rounded-base border-0"
          onKeyDown={handleKeyDown}
        >
          <CommandInput 
            placeholder="Search breeds..." 
            className="font-publicSans text-text"
          />
          <CommandList>
            <CommandEmpty className="font-publicSans text-text py-6">No breed found.</CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-y-auto">
              {safeBreeds.map((breed, index) => (
                <CommandItem
                  key={breed.value}
                  value={breed.value}
                  onSelect={(currentValue) => {
                    const newValues = values.includes(currentValue)
                      ? values.filter(v => v !== currentValue)
                      : [...values, currentValue]
                    setValue(newValues)
                    if (!multiple) {
                      setOpen(false)
                    }
                  }}
                  className={cn(
                    "font-publicSans text-text",
                    index === activeIndex && "bg-main"
                  )}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      values.includes(breed.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {breed.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}