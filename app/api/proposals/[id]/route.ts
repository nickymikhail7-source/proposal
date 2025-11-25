import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const { sections } = await req.json()

        // Verify ownership
        const proposal = await prisma.proposal.findUnique({
            where: {
                id,
                userId: session.user.id,
            },
        })

        if (!proposal) {
            return new NextResponse("Not Found", { status: 404 })
        }

        // Update sections using transaction
        await prisma.$transaction(
            sections.map((section: any) =>
                prisma.proposalSection.update({
                    where: {
                        id: section.id,
                    },
                    data: {
                        content: section.content,
                    },
                })
            )
        )

        // Update proposal timestamp
        await prisma.proposal.update({
            where: { id },
            data: { updatedAt: new Date() },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("[PROPOSAL_PATCH]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
