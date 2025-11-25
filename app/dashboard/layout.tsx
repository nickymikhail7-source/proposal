import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { DashboardNav } from "@/components/dashboard-nav"
import { UserNav } from "@/components/user-nav"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/login")
    }

    return (
        <div className="flex min-h-screen flex-col space-y-6">
            <header className="sticky top-0 z-40 border-b bg-white">
                <div className="container flex h-16 items-center justify-between py-4 px-4 sm:px-6 lg:px-8">
                    <div className="flex gap-6 md:gap-10">
                        <a href="/dashboard" className="flex items-center space-x-2">
                            <span className="inline-block font-bold">ProposalSpace</span>
                        </a>
                        <DashboardNav />
                    </div>
                    <UserNav user={session.user} />
                </div>
            </header>
            <div className="container grid flex-1 gap-12 px-4 sm:px-6 lg:px-8">
                <main className="flex w-full flex-1 flex-col overflow-hidden">
                    {children}
                </main>
            </div>
        </div>
    )
}
