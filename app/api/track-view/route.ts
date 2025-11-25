import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"

export async function POST(req: Request) {
    try {
        const { proposalId } = await req.json()
        const headersList = await headers()
        const userAgent = headersList.get("user-agent") || "unknown"
        const ip = headersList.get("x-forwarded-for") || "unknown"

        await prisma.proposalView.create({
            data: {
                proposalId,
                userAgent,
                ipAddress: ip,
            },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Failed to track view", error)
        return NextResponse.json({ error: "Failed to track view" }, { status: 500 })
    }
}
