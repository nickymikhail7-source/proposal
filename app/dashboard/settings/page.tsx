"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

export default function SettingsPage() {
    const router = useRouter()
    const { data: session, update } = useSession()
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const name = formData.get("name")
        const companyName = formData.get("companyName")

        try {
            const res = await fetch("/api/user", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, companyName }),
            })

            if (!res.ok) throw new Error("Failed to update settings")

            await update({
                ...session,
                user: {
                    ...session?.user,
                    name,
                    companyName,
                },
            })

            alert("Settings updated successfully!")
            router.refresh()
        } catch (error) {
            console.error(error)
            alert("Failed to update settings")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Settings</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your account settings and company profile.
                </p>
            </div>
            <div className="separator" />
            <div className="max-w-xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Your Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            defaultValue={session?.user?.name || ""}
                            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="companyName"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Company Name
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                            This will be displayed in the header of your proposals.
                        </p>
                        <input
                            type="text"
                            name="companyName"
                            id="companyName"
                            defaultValue={session?.user?.companyName || ""}
                            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
