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
        const { title, clientCompany, heading, subject, productId } = await req.json()

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
                html += `<h3>Pricing Options</h3>`
                html += `<p>Based on your needs, we recommend the following options:</p>`
                html += `<table style="width: 100%; border-collapse: collapse; margin-top: 20px;">`
                html += `<thead><tr style="background-color: #f3f4f6;">`
                html += `<th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb;">Plan</th>`
                html += `<th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb;">Price</th>`
                html += `<th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb;">Features</th>`
                html += `</tr></thead><tbody>`

                if (Array.isArray(data.tiers)) {
                    data.tiers.forEach((tier: any) => {
                        const priceDisplay = tier.price === null
                            ? "Custom"
                            : `${currency} ${tier.price} / ${tier.priceUnit}`

                        html += `<tr>`
                        html += `<td style="padding: 12px; border: 1px solid #e5e7eb;"><strong>${tier.name}</strong>${tier.highlighted ? ' <span style="font-size: 0.8em; color: #d97706;">(Popular)</span>' : ''}</td>`
                        html += `<td style="padding: 12px; border: 1px solid #e5e7eb;">${priceDisplay}</td>`
                        html += `<td style="padding: 12px; border: 1px solid #e5e7eb;">`
                        if (Array.isArray(tier.features)) {
                            html += `<ul style="margin: 0; padding-left: 20px;">`
                            tier.features.forEach((feature: string) => {
                                html += `<li>${feature}</li>`
                            })
                            html += `</ul>`
                        }
                        html += `</td></tr>`
                    })
                }
                html += `</tbody></table>`

                if (Array.isArray(data.addons) && data.addons.length > 0) {
                    html += `<h4 style="margin-top: 20px;">Add-ons</h4>`
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
