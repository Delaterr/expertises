
"use client"

import type { ColumnDef } from "@tanstack/react-table"
import Image from "next/image"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { useSettings } from "@/contexts/settings-context"
import type { Product } from "@/lib/data-types";


export const columns = (): ColumnDef<Product>[] => {
  // Can't use hooks inside a callback, so we create a small component
  const PriceCell = ({ row }: { row: any }) => {
    const { settings } = useSettings();
    const amount = parseFloat(row.getValue("salesPrice"))
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: settings?.currency || "USD",
    }).format(amount)

    return <div className="font-medium">{formatted}</div>
  }
  PriceCell.displayName = 'PriceCell';


  return [
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
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const product = row.original
        const imageUrl = product.imageUrl || 'https://picsum.photos/seed/placeholder/40/40';
        const imageHint = product.imageHint || product.name.split(' ').slice(0, 2).join(' ').toLowerCase();

        return (
          <div className="flex items-center gap-4">
            <Image
              alt="Product image"
              className="aspect-square rounded-md object-cover"
              height="40"
              src={imageUrl}
              width="40"
              data-ai-hint={imageHint}
            />
            <div className="font-medium">{product.name}</div>
          </div>
        )
      }
    },
    {
        accessorKey: "code",
        header: "Barcode (SKU)",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
          const product = row.original;
          const quantity = product.quantity
          const lowStockThreshold = product.lowStockThreshold ?? 10;
          
          if (quantity === 0) {
              return <Badge variant="destructive">Out of Stock</Badge>
          }
          if (quantity <= lowStockThreshold) {
              return <Badge variant="secondary">Low Stock</Badge>
          }
          return <Badge variant="outline">In Stock</Badge>
      }
    },
    {
      accessorKey: "salesPrice",
      header: "Price",
      cell: PriceCell
    },
    {
      accessorKey: "quantity",
      header: "Stock",
      cell: ({ row }) => <div>{`${row.getValue("quantity")} ${row.original.unit}`}</div>,
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-haspopup="true" size="icon" variant="ghost">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
