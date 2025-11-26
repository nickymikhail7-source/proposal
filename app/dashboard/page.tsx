import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Plus, FileText, Eye, MessageSquare } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { CopyLinkButton } from "@/components/copy-link-button"

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return null
    }

    const proposals = await prisma.proposal.findMany({
        where: {
            userId: session.user.id,
        },
        orderBy: {
            updatedAt: "desc",
        },
        include: {
            _count: {
                select: {
                    views: true,
                    comments: true,
                },
            },
        },
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Proposals</h1>
                    <p className="text-muted-foreground">
                        Manage your proposals and track their status.
                    </p>
                </div>
                <Link
                    href="/proposal/new"
                    className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Proposal
                </Link>
            </div>

            {proposals.length === 0 ? (
                <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                        <FileText className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">No proposals yet</h3>
                    <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm">
                        Create your first proposal to start tracking deals and closing sales faster.
                    </p>
                    <Link
                        href="/proposal/new"
                        className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Proposal
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {proposals.map((proposal) => (
                        <div
                            key={proposal.id}
                            className="group relative flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-indigo-200"
                        >
                            <div>
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">
                                            {proposal.title}
                                        </h3>
                                        <p className="text-sm font-medium text-gray-500">
                                            {proposal.clientCompany}
                                        </p>
                                    </div>
                                    <span
                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset ${proposal.status === "DRAFT"
                                            ? "bg-gray-100 text-gray-700 ring-gray-600/20"
                                            : proposal.status === "SENT"
                                                ? "bg-blue-50 text-blue-700 ring-blue-700/10"
                                                : "bg-green-50 text-green-700 ring-green-600/20"
                                            }`}
                                    >
                                        {proposal.status}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 space-y-4">
                                {/* Analytics Preview */}
                                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                    <div className="flex gap-6">
                                        <div className="flex items-center gap-2 text-sm text-gray-600" title="Total Views">
                                            <Eye className="h-4 w-4 text-gray-400" />
                                            <span className="font-semibold">{proposal._count.views}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600" title="Comments">
                                            <MessageSquare className="h-4 w-4 text-gray-400" />
                                            <span className="font-semibold">{proposal._count.comments}</span>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        {formatDistanceToNow(proposal.updatedAt)} ago
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <Link
                                        href={`/proposal/${proposal.id}/edit`}
                                        className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                    >
                                        Edit
                                    </Link>
                                    <Link
                                        href={`/proposal/${proposal.id}/analytics`}
                                        className="inline-flex items-center justify-center rounded-lg bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
                                    >
                                        Analytics
                                    </Link>
                                </div>
                                <div className="flex justify-center pt-2 border-t border-gray-50">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>Copy Link:</span>
                                        <CopyLinkButton shareId={proposal.shareId} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
