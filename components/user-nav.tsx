"use client"

import { signOut } from "next-auth/react"
import { LogOut, User } from "lucide-react"

export function UserNav({ user }: { user: any }) {
    return (
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-500" />
                </div>
                <div className="hidden md:block">
                    <p className="text-sm font-medium leading-none">{user.name || user.email}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
            </div>
            <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-sm text-gray-500 hover:text-gray-900"
            >
                <LogOut className="h-4 w-4" />
            </button>
        </div>
    )
}
