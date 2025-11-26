"use client"

import { useState } from "react"
import { Link as LinkIcon, Check } from "lucide-react"

export function CopyLinkButton({ shareId }: { shareId: string }) {
    const [copied, setCopied] = useState(false)

    const copyLink = (e: React.MouseEvent) => {
        e.preventDefault() // Prevent parent Link click
        e.stopPropagation()

        const url = `${window.location.origin}/p/${shareId}`
        navigator.clipboard.writeText(url)
        setCopied(true)

        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <button
            onClick={copyLink}
            className="rounded p-1 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            title="Copy Link"
        >
            {copied ? (
                <Check className="h-4 w-4 text-green-600" />
            ) : (
                <LinkIcon className="h-4 w-4" />
            )}
        </button>
    )
}
