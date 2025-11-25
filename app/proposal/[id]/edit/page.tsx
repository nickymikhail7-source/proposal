import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { EditorClient } from "./editor-client"

export default async function ProposalEditPage({
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
            sections: {
                orderBy: {
                    order: "asc",
                },
            },
        },
    })

    if (!proposal) {
        notFound()
    }

    return <EditorClient proposal={proposal} />
}
