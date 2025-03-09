"use client"

import { CommandList } from "cmdk"
import { Check, ChevronsUpDown } from "lucide-react"
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
import { cn } from "@/lib/utils"

interface ComboboxProps {
  breeds: { value: string; label: string; }[]
  onSelect?: (value: string) => void
}

export function Combobox({ breeds, onSelect }: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="noShadow"
          role="combobox"
          aria-expanded={open}
          className="w-[300px] justify-between font-publicSans"
        >
          {value
            ? breeds.find((breed) => breed.value === value)?.label
            : "Select breed..."}
          <ChevronsUpDown color="black" className="ml-2 h-4 w-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command className="rounded-lg border border-border">
          <CommandInput placeholder="Search breed..." className="font-publicSans" />
          <CommandList>
            <CommandEmpty className="font-publicSans">No breed found.</CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-y-auto">
              {breeds.map((breed) => (
                <CommandItem
                  key={breed.value}
                  value={breed.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue)
                    onSelect?.(currentValue)
                    setOpen(false)
                  }}
                  className="font-publicSans"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === breed.value ? "opacity-100" : "opacity-0",
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