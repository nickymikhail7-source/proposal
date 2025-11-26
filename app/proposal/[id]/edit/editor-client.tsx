"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Eye, Send } from "lucide-react"
import { Editor } from "@/components/editor/tiptap-editor"

interface Section {
    id: string
    title: string
    content: string
    type: string
}

interface Proposal {
    id: string
    title: string
    clientCompany: string
    status: string
    shareId: string
    sections: Section[]
}

export function EditorClient({ proposal }: { proposal: Proposal }) {
    const router = useRouter()
    const [sections, setSections] = useState(proposal.sections)
    const [saving, setSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)

    const handleContentChange = (sectionId: string, newContent: string) => {
        setSections((prev) =>
            prev.map((s) => (s.id === sectionId ? { ...s, content: newContent } : s))
        )
    }

    const saveProposal = async () => {
        setSaving(true)
        try {
            const res = await fetch(`/api/proposals/${proposal.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ sections }),
            })

            if (!res.ok) throw new Error("Failed to save")

            setLastSaved(new Date())
        } catch (error) {
            console.error("Failed to save proposal", error)
            alert("Failed to save changes")
        } finally {
            setSaving(false)
        }
    }

    const handlePublish = async () => {
        // First save any pending changes
        await saveProposal()

        setSaving(true)
        try {
            // Update status to SENT
            const res = await fetch(`/api/proposals/${proposal.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: "SENT" }),
            })

            if (!res.ok) throw new Error("Failed to publish")

            // Copy link to clipboard
            const url = `${window.location.origin}/p/${proposal.shareId}`
            await navigator.clipboard.writeText(url)

            alert("Proposal published! Link copied to clipboard:\n" + url)
        } catch (error) {
            console.error("Failed to publish", error)
            alert("Failed to publish proposal")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-30 border-b bg-white shadow-sm">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard"
                            className="text-gray-500 hover:text-gray-900"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">
                                {proposal.title}
                            </h1>
                            <p className="text-xs text-gray-500">{proposal.clientCompany}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {lastSaved && (
                            <span className="text-xs text-gray-400 hidden sm:inline-block">
                                Saved {lastSaved.toLocaleTimeString()}
                            </span>
                        )}
                        <button
                            onClick={saveProposal}
                            disabled={saving}
                            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                        >
                            <Save className="mr-2 h-4 w-4" />
                            {saving ? "Saving..." : "Save"}
                        </button>
                        <Link
                            href={`/p/${proposal.shareId}`}
                            target="_blank"
                            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                        </Link>
                        <button
                            onClick={handlePublish}
                            disabled={saving}
                            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                        >
                            <Send className="mr-2 h-4 w-4" />
                            Publish & Send
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto mt-8 max-w-4xl px-4">
                <div className="space-y-8">
                    {sections.map((section, index) => (
                        <div
                            key={section.id}
                            className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5"
                        >
                            <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                                <h3 className="text-sm font-semibold text-gray-900">
                                    {index + 1}. {section.title}
                                </h3>
                            </div>
                            <div className="p-0">
                                <Editor
                                    content={section.content}
                                    onChange={(content) => handleContentChange(section.id, content)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    )
}
