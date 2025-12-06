
"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { type Shop } from "@/contexts/settings-context"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export const columns: ColumnDef<Shop>[] = [
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
    header: "Shop Name",
    cell: ({ row }) => {
        const shop = row.original;
        return (
            <div className="flex items-center gap-4">
                <Avatar>
                    <AvatarImage src={shop.heroImageUrl} alt={shop.name} />
                    <AvatarFallback>{shop.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="font-medium">{shop.name}</div>
            </div>
        )
    }
  },
  {
    accessorKey: "ownerId",
    header: "Owner ID",
    cell: ({ row }) => <div className="text-sm text-muted-foreground">{row.getValue("ownerId")}</div>,
  },
   {
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "currency",
    header: "Currency",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const shop = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(shop.id)}
            >
              Copy shop ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View Shop</DropdownMenuItem>
            <DropdownMenuItem>View Owner</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Disable Shop</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
