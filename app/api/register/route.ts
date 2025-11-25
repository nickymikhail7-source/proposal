import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    try {
        const { email, password, companyName } = await req.json()

        if (!email || !password) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        const exists = await prisma.user.findUnique({
            where: {
                email,
            },
        })

        if (exists) {
            return NextResponse.json(
                { error: "User already exists" },
                { status: 400 }
            )
        }

        const passwordHash = await hash(password, 10)

        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                companyName,
            },
        })

        return NextResponse.json({
            id: user.id,
            email: user.email,
            companyName: user.companyName,
        })
    } catch (error) {
        console.error("Registration error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
