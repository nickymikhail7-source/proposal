import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const { name, companyName } = await req.json()

        const user = await prisma.user.update({
            where: {
                id: session.user.id,
            },
            data: {
                name,
                companyName,
            },
        })

        return NextResponse.json(user)
    } catch (error) {
        console.error("[USER_PATCH]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
