"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, Package, ExternalLink, FileText, RefreshCw, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Product {
    id: string
    name: string
    sourceType: string
    sourceUrl?: string
    sourceFileUrl?: string
    pricingData: any
    currency: string
    updatedAt: string
    _count?: {
        proposals: number
    }
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            const res = await fetch("/api/products")
            if (res.ok) {
                const data = await res.json()
                setProducts(data)
            }
        } catch (error) {
            console.error("Failed to fetch products", error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return

        try {
            const res = await fetch(`/api/products/${id}`, {
                method: "DELETE",
            })
            if (res.ok) {
                setProducts(products.filter((p) => p.id !== id))
            }
        } catch (error) {
            console.error("Failed to delete product", error)
            alert("Failed to delete product")
        }
    }

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                    <p className="text-sm text-gray-500">
                        Manage your products and AI-extracted pricing.
                    </p>
                </div>
                <Link
                    href="/dashboard/products/new"
                    className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                </Link>
            </div>

            {products.length === 0 ? (
                <div className="flex h-96 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-center">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No products yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Add your first product to start creating proposals with auto-populated pricing.
                    </p>
                    <div className="mt-6">
                        <Link
                            href="/dashboard/products/new"
                            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Product
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="flex flex-col overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5 transition hover:shadow-md"
                        >
                            <div className="flex-1 p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                            <Package className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">
                                                {product.name}
                                            </h3>
                                            <p className="text-xs text-gray-500">
                                                {product.pricingData?.tiers?.length || 0} tiers •{" "}
                                                {product.pricingData?.addons?.length || 0} add-ons
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 space-y-2">
                                    <div className="flex items-center text-xs text-gray-500">
                                        {product.sourceType === "url" ? (
                                            <>
                                                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                                                <span className="truncate max-w-[200px]">
                                                    {product.sourceUrl}
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <FileText className="mr-1.5 h-3.5 w-3.5" />
                                                <span>Uploaded document</span>
                                            </>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        Updated {formatDistanceToNow(new Date(product.updatedAt))} ago
                                    </div>
                                </div>
                            </div>

                            <div className="flex border-t border-gray-100 bg-gray-50 px-6 py-3">
                                <div className="flex w-full justify-between gap-2">
                                    <Link
                                        href={`/dashboard/products/${product.id}`}
                                        className="flex-1 rounded-md bg-white px-3 py-1.5 text-center text-xs font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                    >
                                        View / Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        className="rounded-md p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
