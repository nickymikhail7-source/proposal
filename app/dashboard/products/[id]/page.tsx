"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, Save, Trash2, Plus, X } from "lucide-react"

interface PricingTier {
    id: string
    name: string
    price: number | null
    priceUnit: string
    billingNote?: string
    description?: string
    features: string[]
    highlighted?: boolean
}

interface PricingAddon {
    id: string
    name: string
    price: number
    priceUnit: string
    description?: string
}

interface PricingData {
    tiers: PricingTier[]
    addons: PricingAddon[]
    notes?: string
    currency: string
}

export default function EditProductPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [product, setProduct] = useState<any>(null)
    const [name, setName] = useState("")
    const [pricingData, setPricingData] = useState<PricingData | null>(null)

    useEffect(() => {
        fetchProduct()
    }, [])

    const fetchProduct = async () => {
        try {
            const res = await fetch(`/api/products/${params.id}`)
            if (!res.ok) throw new Error("Failed to fetch product")
            const data = await res.json()
            setProduct(data)
            setName(data.name)
            setPricingData(data.pricingData)
        } catch (error) {
            console.error(error)
            alert("Failed to load product")
            router.push("/dashboard/products")
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch(`/api/products/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    pricingData,
                    currency: pricingData?.currency,
                }),
            })

            if (!res.ok) throw new Error("Failed to update product")

            router.refresh()
            alert("Product updated successfully")
        } catch (error) {
            console.error(error)
            alert("Failed to update product")
        } finally {
            setSaving(false)
        }
    }

    const updateTier = (index: number, field: keyof PricingTier, value: any) => {
        if (!pricingData) return
        const newTiers = [...pricingData.tiers]
        newTiers[index] = { ...newTiers[index], [field]: value }
        setPricingData({ ...pricingData, tiers: newTiers })
    }

    const updateFeature = (tierIndex: number, featureIndex: number, value: string) => {
        if (!pricingData) return
        const newTiers = [...pricingData.tiers]
        const newFeatures = [...newTiers[tierIndex].features]
        newFeatures[featureIndex] = value
        newTiers[tierIndex] = { ...newTiers[tierIndex], features: newFeatures }
        setPricingData({ ...pricingData, tiers: newTiers })
    }

    const addFeature = (tierIndex: number) => {
        if (!pricingData) return
        const newTiers = [...pricingData.tiers]
        newTiers[tierIndex].features.push("New Feature")
        setPricingData({ ...pricingData, tiers: newTiers })
    }

    const removeFeature = (tierIndex: number, featureIndex: number) => {
        if (!pricingData) return
        const newTiers = [...pricingData.tiers]
        newTiers[tierIndex].features.splice(featureIndex, 1)
        setPricingData({ ...pricingData, tiers: newTiers })
    }

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto py-8 space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/products" className="text-gray-500 hover:text-gray-900">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                >
                    {saving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="mr-2 h-4 w-4" />
                    )}
                    Save Changes
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 bg-white"
                />
            </div>

            <div className="space-y-6">
                <h2 className="text-lg font-medium text-gray-900">Pricing Tiers</h2>
                {pricingData?.tiers.map((tier, tierIndex) => (
                    <div key={tier.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Tier Name</label>
                                <input
                                    type="text"
                                    value={tier.name}
                                    onChange={(e) => updateTier(tierIndex, "name", e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 bg-white"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Price</label>
                                    <input
                                        type="number"
                                        value={tier.price || ""}
                                        onChange={(e) => updateTier(tierIndex, "price", parseFloat(e.target.value))}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 bg-white"
                                        placeholder="Custom"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Unit</label>
                                    <select
                                        value={tier.priceUnit}
                                        onChange={(e) => updateTier(tierIndex, "priceUnit", e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 bg-white"
                                    >
                                        <option value="month">/ month</option>
                                        <option value="year">/ year</option>
                                        <option value="one-time">one-time</option>
                                        <option value="custom">custom</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Description</label>
                            <input
                                type="text"
                                value={tier.description || ""}
                                onChange={(e) => updateTier(tierIndex, "description", e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 bg-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Features</label>
                            <div className="space-y-2">
                                {tier.features.map((feature, featureIndex) => (
                                    <div key={featureIndex} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={feature}
                                            onChange={(e) => updateFeature(tierIndex, featureIndex, e.target.value)}
                                            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 bg-white"
                                        />
                                        <button
                                            onClick={() => removeFeature(tierIndex, featureIndex)}
                                            className="p-2 text-gray-400 hover:text-red-500"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => addFeature(tierIndex)}
                                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center"
                                >
                                    <Plus className="h-3 w-3 mr-1" /> Add Feature
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
