import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions)
    const { id } = params

    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const body = await req.json()
        const { sections, status } = body

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

        // Update sections if provided
        if (sections) {
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
        }

        // Update proposal fields (status, timestamp)
        const updateData: any = { updatedAt: new Date() }
        if (status) {
            updateData.status = status
        }

        await prisma.proposal.update({
            where: { id },
            data: updateData,
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("[PROPOSAL_PATCH]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
