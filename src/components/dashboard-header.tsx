"use client"
import React from "react"
import Link from "next/link"
import { usePathname } from 'next/navigation'
import { Search } from "lucide-react"

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "@/components/ui/breadcrumb"
import { Input } from "@/components/ui/input"
import { UserNav } from "@/components/user-nav"

export function DashboardHeader() {
    const pathname = usePathname()
    const pathSegments = pathname.split('/').filter(Boolean);

    return (
        <>
            <Breadcrumb className="hidden md:flex">
                <BreadcrumbList>
                {pathSegments.map((segment, index) => {
                    const href = "/" + pathSegments.slice(0, index + 1).join('/');
                    const isLast = index === pathSegments.length - 1;
                    const name = segment.charAt(0).toUpperCase() + segment.slice(1);
                    return (
                        <React.Fragment key={href}>
                            <BreadcrumbItem>
                                {isLast ? (
                                <BreadcrumbPage>{name}</BreadcrumbPage>
                                ) : (
                                <BreadcrumbLink asChild>
                                    <Link href={href}>{name}</Link>
                                </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                            {!isLast && <BreadcrumbSeparator />}
                        </React.Fragment>
                    )
                })}
                </BreadcrumbList>
            </Breadcrumb>
            <div className="relative ml-auto flex-1 md:grow-0">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                type="search"
                placeholder="Search..."
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
                />
            </div>
            <UserNav />
        </>
    )
}
