import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ArrowLeft, Eye, Users, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export default async function AnalyticsPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user?.id) {
        redirect("/login")
    }

    const proposal = await prisma.proposal.findUnique({
        where: {
            id,
            userId: session.user.id,
        },
        include: {
            views: {
                orderBy: {
                    viewedAt: "desc",
                },
            },
            _count: {
                select: {
                    comments: true,
                },
            },
        },
    })

    if (!proposal) {
        notFound()
    }

    const totalViews = proposal.views.length
    const uniqueViewers = new Set(proposal.views.map((v: any) => v.ipAddress)).size
    const lastViewed =
        proposal.views.length > 0 ? proposal.views[0].viewedAt : null

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <div className="mx-auto max-w-5xl">
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard"
                            className="text-gray-500 hover:text-gray-900"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Analytics: {proposal.title}
                            </h1>
                            <p className="text-sm text-gray-500">{proposal.clientCompany}</p>
                        </div>
                    </div>
                    <Link
                        href={`/proposal/${proposal.id}/edit`}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                    >
                        Edit Proposal
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-blue-100 p-3">
                                <Eye className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Views</p>
                                <p className="text-2xl font-bold text-gray-900">{totalViews}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-green-100 p-3">
                                <Users className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Unique Viewers
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {uniqueViewers}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-purple-100 p-3">
                                <Clock className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Last Viewed</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {lastViewed
                                        ? formatDistanceToNow(lastViewed, { addSuffix: true })
                                        : "Never"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="mt-8 rounded-lg bg-white shadow-sm">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <h3 className="text-lg font-medium text-gray-900">Recent Views</h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {proposal.views.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                No views yet. Share your proposal to start tracking!
                            </div>
                        ) : (
                            proposal.views.slice(0, 10).map((view: any) => (
                                <div key={view.id} className="flex items-center justify-between px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-green-500" />
                                        <span className="text-sm font-medium text-gray-900">
                                            Viewed by {view.ipAddress === "unknown" ? "Anonymous" : view.ipAddress}
                                        </span>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {formatDistanceToNow(view.viewedAt, { addSuffix: true })}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
