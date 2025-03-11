"use client"

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, ImageIcon } from "lucide-react"
import * as React from "react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
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
  onRowSelect?: (selectedDogs: Dog[]) => void
}

function DogImage({ src, name }: { src: string; name: string }) {
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState(false)

  return (
    <div className="relative h-12 w-12 overflow-hidden rounded-base border-2 border-border bg-bw">
      {error ? (
        <div className="flex h-full w-full items-center justify-center bg-bw">
          <ImageIcon className="h-6 w-6 text-text" />
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

export const columns: ColumnDef<Dog>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="border-2 border-border bg-bw"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="border-2 border-border bg-bw"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "img",
    header: "Photo",
    cell: ({ row }) => (
      <DogImage src={row.getValue("img")} name={row.getValue("name")} />
    ),
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="noShadow"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-publicSans"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-publicSans">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "breed",
    header: ({ column }) => {
      return (
        <Button
          variant="noShadow"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-publicSans"
        >
          Breed
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-publicSans">{row.getValue("breed")}</div>,
  },
  {
    accessorKey: "age",
    header: ({ column }) => {
      return (
        <Button
          variant="noShadow"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-publicSans"
        >
          Age
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="text-center font-publicSans">{row.getValue("age")}</div>,
  },
  {
    accessorKey: "zip_code",
    header: "Location",
    cell: ({ row }) => <div className="font-publicSans">{row.getValue("zip_code")}</div>,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const dog = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="noShadow" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-bw border-2 border-border">
            <DropdownMenuLabel className="font-publicSans text-text">Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(dog.id)}
              className="font-publicSans text-text"
            >
              Copy dog ID
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem className="font-publicSans text-text">View details</DropdownMenuItem>
            <DropdownMenuItem className="font-publicSans text-text">Match with dog</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export function DataTable({ data, onRowSelect }: DataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  React.useEffect(() => {
    if (onRowSelect) {
      const selectedRows = table.getSelectedRowModel().rows
      const selectedDogs = selectedRows.map(row => row.original)
      onRowSelect(selectedDogs)
    }
  }, [rowSelection, onRowSelect, table])

  return (
    <div className="w-full font-publicSans">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="neutral" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-bw border-2 border-border">
            <DropdownMenuLabel className="font-publicSans text-text">Columns</DropdownMenuLabel>
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize text-text font-publicSans"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-base border-2 border-border bg-main">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-mtext">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-mtext"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-sm text-text">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="neutral"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="neutral"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}