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
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {proposals.map((proposal) => (
                        <Link
                            key={proposal.id}
                            href={`/proposal/${proposal.id}/edit`}
                            className="group relative flex flex-col justify-between rounded-lg border bg-white p-6 shadow-sm transition-all hover:shadow-md"
                        >
                            <div>
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600">
                                        {proposal.title}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <CopyLinkButton shareId={proposal.shareId} />
                                        <span
                                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${proposal.status === "DRAFT"
                                                ? "bg-gray-50 text-gray-600 ring-gray-500/10"
                                                : proposal.status === "SENT"
                                                    ? "bg-blue-50 text-blue-700 ring-blue-700/10"
                                                    : "bg-green-50 text-green-700 ring-green-600/20"
                                                }`}
                                        >
                                            {proposal.status}
                                        </span>
                                    </div>
                                </div>
                                <p className="mt-2 text-sm text-gray-500">
                                    {proposal.clientCompany}
                                </p>
                            </div>
                            <div className="mt-4 flex items-center justify-between border-t pt-4 text-xs text-gray-500">
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-1">
                                        <Eye className="h-3 w-3" />
                                        {proposal._count.views}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MessageSquare className="h-3 w-3" />
                                        {proposal._count.comments}
                                    </div>
                                </div>
                                <span>
                                    Updated {formatDistanceToNow(proposal.updatedAt)} ago
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
