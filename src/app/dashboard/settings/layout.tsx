
'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const sidebarNavItems = [
    {
      title: "Shop Profile",
      href: "/dashboard/settings/profile",
    },
    {
      title: "Roles & Permissions",
      href: "/dashboard/settings/roles",
    },
    {
      title: "Payments",
      href: "/dashboard/settings/payments",
    },
    {
      title: "Receipts",
      href: "/dashboard/settings/receipts",
    },
    {
      title: "Printers",
      href: "/dashboard/settings/printers",
    },
  ]

interface SettingsLayoutProps {
    children: React.ReactNode
}
  
export default function SettingsLayout({ children }: SettingsLayoutProps) {
    const pathname = usePathname()

    return (
        <div className="space-y-6 lg:grid lg:grid-cols-5 lg:gap-10">
            <aside className="lg:col-span-1">
                <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
                    {sidebarNavItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                        "inline-flex items-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2",
                        pathname === item.href
                            ? "bg-muted hover:bg-muted"
                            : "hover:bg-transparent hover:underline",
                        "justify-start"
                        )}
                    >
                        {item.title}
                    </Link>
                    ))}
                </nav>
            </aside>
            <div className="lg:col-span-4">{children}</div>
        </div>
    )
}
