import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Editor } from "@/components/editor/tiptap-editor"
import { Calendar, MessageSquare } from "lucide-react"
import { headers } from "next/headers"
import { ViewTracker } from "@/components/view-tracker"

import { CommentsSection } from "@/components/comments/comments-section"

export default async function PublicProposalPage({
    params,
}: {
    params: { shareId: string }
}) {
    const { shareId } = params
    const proposal = await prisma.proposal.findUnique({
        where: {
            shareId,
        },
        include: {
            user: true,
            sections: {
                orderBy: {
                    order: "asc",
                },
            },
            comments: true,
        },
    })

    if (!proposal) {
        notFound()
    }

    // Track view (simple implementation)
    // In a real app, we'd want to be careful about not counting bot traffic or duplicate views too aggressively
    // and maybe do this in a separate API call or useEffect to avoid blocking render
    // For MVP, we'll just fire and forget a create call if possible, but in Server Component we can just do it.
    // However, Server Components shouldn't have side effects ideally.
    // Better to use a client component for tracking or a separate API route called by client.
    // I'll add a client component <ViewTracker /> to handle this.

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur-md">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <div className="font-bold text-xl tracking-tight">
                        {proposal.user.companyName || "ProposalSpace"}
                    </div>
                    <div className="flex items-center gap-4">
                        <a
                            href="mailto:?subject=Question about proposal"
                            className="hidden sm:inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
                        >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Ask a Question
                        </a>
                        <button className="inline-flex items-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                            <Calendar className="mr-2 h-4 w-4" />
                            Book a Meeting
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <div className="bg-gray-50 py-16 sm:py-24">
                <div className="container mx-auto px-4 text-center">
                    {proposal.heading && (
                        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600 mb-2">
                            {proposal.heading}
                        </p>
                    )}
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                        {proposal.title}
                    </h1>
                    <p className="mt-4 text-lg text-gray-600">
                        Prepared for {proposal.clientCompany}
                    </p>
                    {proposal.subject && (
                        <p className="mt-2 text-md text-gray-500 italic">
                            Subject: {proposal.subject}
                        </p>
                    )}
                </div>
            </div>

            {/* Content */}
            <main className="container mx-auto max-w-4xl px-4 py-12">
                <div className="space-y-16">
                    {proposal.sections.map((section: any, index: number) => (
                        <section key={section.id} id={section.id} className="scroll-mt-20">
                            <div className="mb-6 border-b border-gray-100 pb-2">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {section.title}
                                </h2>
                            </div>
                            <div className="prose prose-lg max-w-none text-gray-600">
                                <Editor content={section.content} editable={false} />
                            </div>
                            <CommentsSection
                                proposalId={proposal.id}
                                sectionId={section.id}
                                initialComments={proposal.comments.filter((c: any) => c.sectionId === section.id).map((c: any) => ({
                                    ...c,
                                    createdAt: c.createdAt.toISOString()
                                }))}
                            />
                        </section>
                    ))}
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t bg-gray-50 py-12">
                <div className="container mx-auto px-4 text-center text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} {proposal.user.companyName}. All rights reserved.</p>
                    <p className="mt-2">Powered by ProposalSpace</p>
                </div>
            </footer>

            <ViewTracker proposalId={proposal.id} />
        </div>
    )
}
