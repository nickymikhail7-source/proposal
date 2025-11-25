"use client"

import { useState } from "react"
import { MessageSquare, Send } from "lucide-react"

interface Comment {
    id: string
    content: string
    authorType: string
    createdAt: string
}

interface CommentsSectionProps {
    proposalId: string
    sectionId: string
    initialComments?: Comment[]
}

export function CommentsSection({
    proposalId,
    sectionId,
    initialComments = [],
}: CommentsSectionProps) {
    const [comments, setComments] = useState<Comment[]>(initialComments)
    const [newComment, setNewComment] = useState("")
    const [isOpen, setIsOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!newComment.trim()) return

        setSubmitting(true)
        try {
            const res = await fetch("/api/comments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    proposalId,
                    sectionId,
                    content: newComment,
                    authorType: "CLIENT",
                }),
            })

            if (!res.ok) throw new Error("Failed to post comment")

            const comment = await res.json()
            setComments([...comments, comment])
            setNewComment("")
        } catch (error) {
            console.error(error)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="mt-8 border-t border-gray-100 pt-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900"
            >
                <MessageSquare className="mr-2 h-4 w-4" />
                {comments.length > 0
                    ? `${comments.length} Comment${comments.length === 1 ? "" : "s"}`
                    : "Ask a question about this section"}
            </button>

            {isOpen && (
                <div className="mt-4 space-y-4">
                    {comments.map((comment) => (
                        <div
                            key={comment.id}
                            className={`flex flex-col rounded-lg p-3 text-sm ${comment.authorType === "VENDOR"
                                    ? "bg-indigo-50 ml-8"
                                    : "bg-gray-50 mr-8"
                                }`}
                        >
                            <div className="mb-1 flex items-center justify-between">
                                <span className="font-semibold text-gray-900">
                                    {comment.authorType === "VENDOR" ? "Proposal Owner" : "You"}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-gray-700">{comment.content}</p>
                        </div>
                    ))}

                    <form onSubmit={handleSubmit} className="relative">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Type your question or comment..."
                            className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            rows={2}
                        />
                        <button
                            type="submit"
                            disabled={submitting || !newComment.trim()}
                            className="absolute bottom-2 right-2 rounded-md bg-indigo-600 p-1 text-white hover:bg-indigo-500 disabled:opacity-50"
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    </form>
                </div>
            )}
        </div>
    )
}
