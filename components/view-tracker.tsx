"use client"

import { useEffect, useRef } from "react"

export function ViewTracker({ proposalId }: { proposalId: string }) {
    const tracked = useRef(false)

    useEffect(() => {
        if (tracked.current) return
        tracked.current = true

        fetch("/api/track-view", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ proposalId }),
        }).catch((err) => console.error("Failed to track view", err))
    }, [proposalId])

    return null
}
