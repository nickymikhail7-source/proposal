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
    heading?: string | null
    subject?: string | null
    clientEmail: string | null
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

    const [showPublishDialog, setShowPublishDialog] = useState(false)
    const [clientEmail, setClientEmail] = useState(proposal.clientEmail || "")

    const handlePublishClick = () => {
        setShowPublishDialog(true)
    }

    const confirmPublish = async () => {
        // First save any pending changes
        await saveProposal()

        setSaving(true)
        try {
            // Update status to SENT and save client email
            const res = await fetch(`/api/proposals/${proposal.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    status: "SENT",
                    clientEmail: clientEmail
                }),
            })

            if (!res.ok) throw new Error("Failed to publish")

            // Copy link to clipboard
            const url = `${window.location.origin}/p/${proposal.shareId}`
            await navigator.clipboard.writeText(url)

            setShowPublishDialog(false)
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
                            <input
                                type="text"
                                value={proposal.title}
                                onChange={(e) => {
                                    // Handle title change (would need to update state/proposal object)
                                    // For MVP, we might just display it or allow simple edit
                                    // Ideally we should update the proposal state
                                }}
                                className="text-lg font-bold text-gray-900 border-none focus:ring-0 p-0"
                            />
                            <div className="flex gap-2 mt-1">
                                <input
                                    type="text"
                                    value={proposal.clientCompany}
                                    className="text-xs text-gray-500 border-none focus:ring-0 p-0 w-32"
                                    placeholder="Client Company"
                                />
                                <span className="text-xs text-gray-300">|</span>
                                <input
                                    type="text"
                                    value={proposal.heading || ""}
                                    className="text-xs text-gray-500 border-none focus:ring-0 p-0 w-40"
                                    placeholder="Heading (Optional)"
                                />
                            </div>
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
                            onClick={handlePublishClick}
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

            {/* Publish Dialog */}
            {showPublishDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                        <h3 className="text-lg font-bold text-gray-900">Publish Proposal</h3>
                        <p className="mt-2 text-sm text-gray-500">
                            Enter the client's email address to track who you are sending this to.
                        </p>

                        <div className="mt-4">
                            <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700">
                                Client Email
                            </label>
                            <input
                                type="email"
                                id="clientEmail"
                                value={clientEmail}
                                onChange={(e) => setClientEmail(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm text-gray-900"
                                placeholder="client@company.com"
                            />
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setShowPublishDialog(false)}
                                className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmPublish}
                                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                            >
                                Confirm & Copy Link
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
