"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function DashboardNav() {
    const pathname = usePathname()

    const items = [
        {
            title: "Proposals",
            href: "/dashboard",
        },
        {
            title: "Settings",
            href: "/dashboard/settings",
        },
    ]

    return (
        <nav className="flex gap-6">
            {items.map((item, index) => (
                <Link
                    key={index}
                    href={item.href}
                    className={cn(
                        "flex items-center text-sm font-medium text-gray-600 hover:text-gray-900",
                        item.href === pathname && "text-gray-900 font-bold"
                    )}
                >
                    {item.title}
                </Link>
            ))}
        </nav>
    )
}
