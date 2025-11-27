"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NewProposalPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [products, setProducts] = useState<any[]>([])
    const [selectedProductId, setSelectedProductId] = useState<string>("")

    useEffect(() => {
        fetch("/api/products")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) setProducts(data)
            })
            .catch(console.error)
    }, [])

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const title = formData.get("title")
        const clientCompany = formData.get("clientCompany")
        const heading = formData.get("heading")
        const subject = formData.get("subject")

        try {
            const res = await fetch("/api/proposals", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title,
                    clientCompany,
                    heading,
                    subject,
                    productId: selectedProductId || undefined
                }),
            })

            if (!res.ok) throw new Error("Failed to create proposal")

            const proposal = await res.json()
            router.push(`/proposal/${proposal.id}/edit`)
        } catch (error) {
            console.error(error)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <div className="mx-auto max-w-2xl">
                <Link
                    href="/dashboard"
                    className="mb-8 inline-flex items-center text-sm text-gray-500 hover:text-gray-900"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>

                <div className="rounded-lg bg-white p-8 shadow-sm">
                    <h1 className="mb-6 text-2xl font-bold text-gray-900">
                        Create New Proposal
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="title"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Proposal Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                id="title"
                                required
                                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                placeholder="e.g. Q4 Marketing Strategy"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="clientCompany"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Client Company
                            </label>
                            <input
                                type="text"
                                name="clientCompany"
                                id="clientCompany"
                                required
                                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                placeholder="e.g. Acme Corp"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="heading"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Proposal Heading (Optional)
                            </label>
                            <input
                                type="text"
                                name="heading"
                                id="heading"
                                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                placeholder="e.g. Strategic Partnership Proposal"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="subject"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Subject Line (Optional)
                            </label>
                            <input
                                type="text"
                                name="subject"
                                id="subject"
                                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                placeholder="e.g. Re: Q4 Marketing Initiatives"
                            />
                        </div>

                        {products.length > 0 && (
                            <div>
                                <label
                                    htmlFor="product"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Select Product (Optional)
                                </label>
                                <p className="text-xs text-gray-500 mb-2">
                                    Select a product to auto-populate the pricing section.
                                </p>
                                <select
                                    id="product"
                                    value={selectedProductId}
                                    onChange={(e) => setSelectedProductId(e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                >
                                    <option value="">No product (Manual pricing)</option>
                                    {products.map((product) => (
                                        <option key={product.id} value={product.id}>
                                            {product.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                            >
                                {loading ? "Creating..." : "Create & Start Editing"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
