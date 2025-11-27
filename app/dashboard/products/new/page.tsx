"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, Link as LinkIcon, FileText, Upload, Check, AlertCircle } from "lucide-react"

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

interface UsageBasedPricing {
    name: string
    tiers: {
        limit: string
        price: string
    }[]
}

interface PricingData {
    tiers: PricingTier[]
    addons: PricingAddon[]
    usageBasedPricing?: UsageBasedPricing[]
    notes?: string
    currency: string
}

export default function NewProductPage() {
    const router = useRouter()
    const [step, setStep] = useState<"input" | "analyzing" | "review">("input")
    const [sourceType, setSourceType] = useState<"url" | "document">("url")
    const [url, setUrl] = useState("")
    const [file, setFile] = useState<File | null>(null)
    const [productName, setProductName] = useState("")
    const [analyzing, setAnalyzing] = useState(false)
    const [pricingData, setPricingData] = useState<PricingData | null>(null)
    const [rawContent, setRawContent] = useState("")
    const [error, setError] = useState("")

    const handleAnalyze = async () => {
        if (!productName) {
            setError("Please enter a product name")
            return
        }

        if (sourceType === "url" && !url) {
            setError("Please enter a URL")
            return
        }

        if (sourceType === "document" && !file) {
            setError("Please upload a file")
            return
        }

        setError("")
        setAnalyzing(true)
        setStep("analyzing")

        try {
            let res
            if (sourceType === "url") {
                res = await fetch("/api/products/analyze-url", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url: `https://${url}` }),
                })
            } else {
                const formData = new FormData()
                formData.append("file", file!)
                res = await fetch("/api/products/analyze-document", {
                    method: "POST",
                    body: formData,
                })
            }

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Failed to analyze")
            }

            const data = await res.json()
            setPricingData(data.pricingData)
            setRawContent(data.rawContent)
            setStep("review")
        } catch (err: any) {
            console.error(err)
            setError(err.message)
            setStep("input")
        } finally {
            setAnalyzing(false)
        }
    }

    const handleSave = async () => {
        if (!pricingData) return

        try {
            const res = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: productName,
                    sourceType,
                    sourceUrl: sourceType === "url" ? url : undefined,
                    sourceFileUrl: undefined, // TODO: Implement file upload storage
                    pricingData,
                    rawContent,
                    currency: pricingData.currency,
                }),
            })

            if (!res.ok) throw new Error("Failed to save product")

            router.push("/dashboard/products")
            router.refresh()
        } catch (err) {
            console.error(err)
            alert("Failed to save product")
        }
    }

    // Render Input Step
    if (step === "input") {
        return (
            <div className="max-w-2xl mx-auto py-8">
                <div className="mb-8">
                    <Link href="/dashboard/products" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
                        <ArrowLeft className="h-4 w-4" /> Back to Products
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 mt-4">Add New Product</h1>
                    <p className="text-gray-500">Import pricing from your website or upload a document.</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                        <input
                            type="text"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 bg-white"
                            placeholder="e.g. Acme SaaS"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Import Source</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setSourceType("url")}
                                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${sourceType === "url"
                                    ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                                    : "border-gray-200 hover:border-gray-300 text-gray-600"
                                    }`}
                            >
                                <LinkIcon className="h-6 w-6 mb-2" />
                                <span className="text-sm font-medium">Pricing Page URL</span>
                            </button>
                            <button
                                onClick={() => setSourceType("document")}
                                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${sourceType === "document"
                                    ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                                    : "border-gray-200 hover:border-gray-300 text-gray-600"
                                    }`}
                            >
                                <FileText className="h-6 w-6 mb-2" />
                                <span className="text-sm font-medium">Upload Document</span>
                            </button>
                        </div>
                    </div>

                    {sourceType === "url" ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Pricing Page URL</label>
                            <div className="flex rounded-md shadow-sm">
                                <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                                    https://
                                </span>
                                <input
                                    type="text"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value.replace(/^https?:\/\//, ""))}
                                    className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 bg-white"
                                    placeholder="example.com/pricing"
                                />
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                                Claude AI will analyze this page to extract pricing tiers and features.
                            </p>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Pricing Document</label>
                            <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
                                <div className="space-y-1 text-center">
                                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="flex text-sm text-gray-600">
                                        <label
                                            htmlFor="file-upload"
                                            className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
                                        >
                                            <span>Upload a file</span>
                                            <input
                                                id="file-upload"
                                                name="file-upload"
                                                type="file"
                                                className="sr-only"
                                                accept=".pdf,.docx,.xlsx,.xls,.txt"
                                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                            />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">PDF, DOCX, XLSX up to 10MB</p>
                                    {file && (
                                        <div className="mt-2 flex items-center justify-center text-sm text-green-600">
                                            <Check className="h-4 w-4 mr-1" />
                                            {file.name}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        <p>{error}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end pt-4">
                        <button
                            onClick={handleAnalyze}
                            disabled={analyzing}
                            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {analyzing ? (
                                <>
                                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                    Analyzing...
                                </>
                            ) : (
                                "Analyze Pricing"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // Render Analyzing Step
    if (step === "analyzing") {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center">
                <div className="text-center">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-indigo-600" />
                    <h2 className="mt-4 text-xl font-semibold text-gray-900">Analyzing Pricing...</h2>
                    <p className="mt-2 text-gray-500">Claude AI is reading your content and extracting pricing tiers.</p>
                    <div className="mt-8 max-w-sm mx-auto space-y-2 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" /> Fetching content
                        </div>
                        <div className="flex items-center gap-2">
                            <Loader2 className="h-3 w-3 animate-spin" /> Extracting tiers & features
                        </div>
                        <div className="flex items-center gap-2 opacity-50">
                            <div className="h-3 w-3 rounded-full border border-gray-300" /> Processing add-ons
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Render Review Step
    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Review Pricing</h1>
                    <p className="text-gray-500">Review the extracted data before saving.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setStep("input")}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Back
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                    >
                        Save Product
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h2 className="text-lg font-medium text-gray-900">Extracted Tiers</h2>
                    <span className="text-sm text-gray-500">Currency: {pricingData?.currency}</span>
                </div>
                <div className="divide-y divide-gray-200">
                    {pricingData?.tiers.map((tier, index) => (
                        <div key={index} className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        {tier.name}
                                        {tier.highlighted && (
                                            <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                                                Popular
                                            </span>
                                        )}
                                    </h3>
                                    <div className="mt-1 text-2xl font-bold text-gray-900">
                                        {tier.price === null ? "Custom" : tier.price}
                                        <span className="text-sm font-normal text-gray-500 ml-1">
                                            / {tier.priceUnit}
                                        </span>
                                    </div>
                                    {tier.billingNote && (
                                        <p className="text-sm text-gray-500 mt-1">{tier.billingNote}</p>
                                    )}
                                </div>
                            </div>

                            {tier.description && (
                                <p className="text-sm text-gray-600 mb-4 italic">"{tier.description}"</p>
                            )}

                            <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Features</h4>
                                <ul className="grid sm:grid-cols-2 gap-2">
                                    {tier.features.map((feature, i) => (
                                        <li key={i} className="flex items-start text-sm text-gray-700">
                                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>

                {pricingData?.addons && pricingData.addons.length > 0 && (
                    <>
                        <div className="p-6 border-b border-gray-200 bg-gray-50">
                            <h2 className="text-lg font-medium text-gray-900">Add-ons</h2>
                        </div>
                        <div className="p-6 grid sm:grid-cols-2 gap-4">
                            {pricingData.addons.map((addon, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-medium text-gray-900">{addon.name}</h4>
                                        <span className="text-sm font-bold text-gray-900">
                                            {addon.price} <span className="text-gray-500 font-normal">/ {addon.priceUnit}</span>
                                        </span>
                                    </div>
                                    {addon.description && (
                                        <p className="text-sm text-gray-500 mt-2">{addon.description}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
