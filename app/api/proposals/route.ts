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
        const { title, clientCompany, heading, subject, productId, selectedTierId } = await req.json()

        let pricingContent = "<p>Breakdown of costs...</p>"
        let product = null

        if (productId) {
            product = await prisma.product.findUnique({
                where: { id: productId },
            })

            if (product && product.pricingData) {
                const data = product.pricingData as any
                const currency = data.currency || "USD"

                let html = `<div class="pricing-section">`
                html += `<h3>Pricing</h3>`

                // Find the selected tier
                const selectedTier = Array.isArray(data.tiers)
                    ? data.tiers.find((tier: any) => tier.id === selectedTierId)
                    : null

                if (selectedTier) {
                    const priceDisplay = selectedTier.price === null
                        ? "Custom"
                        : `${currency} ${selectedTier.price} / ${selectedTier.priceUnit}`

                    html += `<div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">`
                    html += `<h4 style="margin: 0 0 8px 0; color: #111827;">${selectedTier.name}</h4>`
                    html += `<p style="font-size: 24px; font-weight: bold; margin: 8px 0; color: #4f46e5;">${priceDisplay}</p>`

                    if (selectedTier.description) {
                        html += `<p style="color: #6b7280; margin: 8px 0;">${selectedTier.description}</p>`
                    }

                    if (Array.isArray(selectedTier.features) && selectedTier.features.length > 0) {
                        html += `<h5 style="margin: 16px 0 8px 0; color: #374151;">Includes:</h5>`
                        html += `<ul style="margin: 0; padding-left: 20px; color: #4b5563;">`
                        selectedTier.features.forEach((feature: string) => {
                            html += `<li style="margin: 4px 0;">${feature}</li>`
                        })
                        html += `</ul>`
                    }
                    html += `</div>`
                } else {
                    html += `<p>Please select a pricing tier for this product.</p>`
                }

                if (Array.isArray(data.addons) && data.addons.length > 0) {
                    html += `<h4 style="margin-top: 20px;">Available Add-ons</h4>`
                    html += `<ul>`
                    data.addons.forEach((addon: any) => {
                        html += `<li><strong>${addon.name}</strong>: ${currency} ${addon.price} / ${addon.priceUnit}</li>`
                    })
                    html += `</ul>`
                }

                html += `</div>`
                pricingContent = html
            }
        }

        const proposal = await prisma.proposal.create({
            data: {
                userId: session.user.id,
                title,
                clientCompany,
                heading,
                subject,
                productId,
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
                            content: pricingContent,
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
