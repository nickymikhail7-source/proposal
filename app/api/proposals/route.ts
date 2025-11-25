import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const { title, clientCompany } = await req.json()

        const proposal = await prisma.proposal.create({
            data: {
                userId: session.user.id,
                title,
                clientCompany,
                sections: {
                    create: [
                        {
                            type: "OVERVIEW",
                            title: "Company Overview",
                            content: "<p>Start writing your company overview here...</p>",
                            order: 0,
                        },
                        {
                            type: "PROBLEM",
                            title: "Problem Statement",
                            content: "<p>Describe the client's problem...</p>",
                            order: 1,
                        },
                        {
                            type: "SOLUTION",
                            title: "Proposed Solution",
                            content: "<p>Detail your solution...</p>",
                            order: 2,
                        },
                        {
                            type: "PRICING",
                            title: "Investment",
                            content: "<p>Breakdown of costs...</p>",
                            order: 3,
                        },
                    ],
                },
            },
        })

        return NextResponse.json(proposal)
    } catch (error) {
        console.error("[PROPOSALS_POST]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
