
"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Printer } from "lucide-react"
import { useRouter } from "next/navigation"

import { Badge } from "@/components/ui/badge"
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
import type { DetailedSale } from "@/lib/data-types"
import { useSettings } from "@/contexts/settings-context"


export const columns: ColumnDef<DetailedSale>[] = [
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
    accessorKey: "id",
    header: "Invoice ID",
    cell: ({ row }) => (
      <div className="font-medium">#{row.getValue("id")?.toString().substring(0, 7)}</div>
    ),
  },
  {
    accessorKey: "sellerName",
    header: "Seller",
    cell: ({ row }) => {
      const sale = row.original;
      return (
        <div>
          <div className="font-medium">{sale.sellerName || 'N/A'}</div>
          <div className="text-sm text-muted-foreground">ID: {sale.sellerId.substring(0,6)}...</div>
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      // Status is placeholder for now as it's not on the transaction record
      const status = "Paid";
      const variant = {
        Paid: "default",
        Pending: "secondary",
        Failed: "destructive",
      }[status] ?? ("default" as "default" | "secondary" | "destructive")

      return <Badge variant={variant} className="capitalize">{status}</Badge>
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
        const date = row.original.date?.toDate ? row.original.date.toDate() : new Date();
        const formatted = new Intl.DateTimeFormat("en-US", {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
        return <div>{formatted}</div>
    }
  },
  {
    accessorKey: "totalAmount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { settings } = useSettings();
      const amount = parseFloat(row.getValue("totalAmount"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: settings?.currency || "USD",
      }).format(amount)

      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const sale = row.original
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const router = useRouter();

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
            <DropdownMenuItem onClick={() => router.push(`/dashboard/sales/${sale.id}/receipt`)}>
                <Printer className="mr-2 h-4 w-4" />
                Print Receipt
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(sale.id)}
            >
              Copy invoice ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View Seller Profile</DropdownMenuItem>
            <DropdownMenuItem>View Transaction Details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
