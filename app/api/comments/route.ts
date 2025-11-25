import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    try {
        const { proposalId, sectionId, content, authorType } = await req.json()

        const comment = await prisma.comment.create({
            data: {
                proposalId,
                sectionId,
                content,
                authorType, // 'VENDOR' or 'CLIENT'
            },
        })

        return NextResponse.json(comment)
    } catch (error) {
        console.error("Failed to create comment", error)
        return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
    }
}
