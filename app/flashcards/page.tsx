"use client"

import { useState, useEffect } from "react"
import {
  RotateCcw, CheckCircle2, Wifi, WifiOff, Bell, BellOff, Loader2, RefreshCw,
} from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useOfflineFlashcards } from "@/hooks/use-offline-flashcards"
import { toast } from "sonner"

export default function FlashcardsPage() {
  const { flashcards, dueCards, loading, isOnline, syncing, pendingCount, submitReview, refetch } = useOfflineFlashcards()
  const [reviewIndex, setReviewIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [notifEnabled, setNotifEnabled] = useState(false)
  const [notifLoading, setNotifLoading] = useState(false)
  const [sessionDone, setSessionDone] = useState(0)

  useEffect(() => { setReviewIndex(0); setShowAnswer(false) }, [dueCards.length])

  useEffect(() => {
    if ("Notification" in window) setNotifEnabled(Notification.permission === "granted")
  }, [])

  const currentCard = dueCards[reviewIndex]

  const handleReview = async (quality: 0 | 3 | 5) => {
    if (!currentCard) return
    setShowAnswer(false)
    await submitReview(currentCard.id, quality)
    setSessionDone((n) => n + 1)
    if (reviewIndex < dueCards.length - 1) setReviewIndex((i) => i + 1)
  }

  const handleEnableNotifications = async () => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      toast.error("Push notifications not supported in this browser")
      return
    }
    setNotifLoading(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== "granted") { toast.error("Notification permission denied"); return }

      const reg = await navigator.serviceWorker.ready
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) { toast.error("VAPID key not configured"); return }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      })

      setNotifEnabled(true)
      toast.success("Streak reminders enabled!")
    } catch {
      toast.error("Failed to enable notifications")
    } finally {
      setNotifLoading(false)
    }
  }

  const handleDisableNotifications = async () => {
    if (!("serviceWorker" in navigator)) return
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) await sub.unsubscribe()
      setNotifEnabled(false)
      toast.success("Notifications disabled")
    } catch {
      toast.error("Failed to disable notifications")
    }
  }

  const mastered = flashcards.filter((f) => f.repetitions >= 5).length

  return (
    <div>
      <PageHeader
        title="Flashcards"
        description="Spaced repetition review. Works offline — study anywhere."
        actions={
          <div className="flex items-center gap-2">
            {syncing && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Loader2 className="h-3 w-3 animate-spin" /> Syncing…
              </div>
            )}
            {!isOnline && pendingCount > 0 && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-xs">
                {pendingCount} pending sync
              </Badge>
            )}
            <div className={`flex items-center gap-1.5 text-xs font-medium ${isOnline ? "text-emerald-600" : "text-slate-400"}`}>
              {isOnline ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
              {isOnline ? "Online" : "Offline mode"}
            </div>
          </div>
        }
      />

      <div className="p-6 max-w-2xl mx-auto space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Due now", value: dueCards.length },
            { label: "Done this session", value: sessionDone },
            { label: "Mastered", value: mastered },
          ].map((m) => (
            <div key={m.label} className="rounded-xl border border-slate-200 bg-white p-4 text-center">
              <div className="text-2xl font-bold text-slate-900 mb-0.5">{m.value}</div>
              <div className="text-xs text-slate-500">{m.label}</div>
            </div>
          ))}
        </div>

        {/* Card review area */}
        {loading ? (
          <div className="py-16 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
        ) : flashcards.length === 0 ? (
          <div className="py-16 text-center">
            <RotateCcw className="h-12 w-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-base font-semibold text-slate-900 mb-2">No flashcards yet</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Go to Learn OS, upload a material, and generate flashcards with AI.
            </p>
          </div>
        ) : dueCards.length === 0 ? (
          <div className="py-16 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-base font-semibold text-slate-900 mb-2">All caught up!</h3>
            <p className="text-sm text-slate-500 mb-4">
              {flashcards.length} cards total · {mastered} mastered
            </p>
            <Button variant="outline" size="sm" className="border-slate-200 gap-2" onClick={refetch}>
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </Button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500">{reviewIndex + 1} / {dueCards.length} due</p>
              <div className="flex gap-1">
                {dueCards.slice(0, 8).map((_, i) => (
                  <div key={i} className={`h-1.5 w-6 rounded-full ${i < reviewIndex ? "bg-slate-900" : i === reviewIndex ? "bg-slate-400" : "bg-slate-100"}`} />
                ))}
                {dueCards.length > 8 && <span className="text-[10px] text-slate-400 ml-1">+{dueCards.length - 8}</span>}
              </div>
            </div>

            <div
              className="rounded-2xl border border-slate-200 bg-white p-10 text-center cursor-pointer shadow-sm hover:shadow-md transition-shadow min-h-[260px] flex flex-col items-center justify-center select-none"
              onClick={() => setShowAnswer((v) => !v)}
            >
              {showAnswer ? (
                <>
                  <p className="text-xs font-medium text-slate-400 mb-4 uppercase tracking-wider">Answer</p>
                  <p className="text-lg font-medium text-slate-900 leading-relaxed">{currentCard.back}</p>
                </>
              ) : (
                <>
                  <p className="text-xs font-medium text-slate-400 mb-4 uppercase tracking-wider">Question</p>
                  <p className="text-lg font-medium text-slate-900 leading-relaxed">{currentCard.front}</p>
                  <p className="text-xs text-slate-400 mt-6">Tap to reveal answer</p>
                </>
              )}
            </div>

            {showAnswer && (
              <div className="flex gap-3 mt-6 justify-center">
                <Button onClick={() => handleReview(0)} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 flex-1 max-w-[120px]">Again</Button>
                <Button onClick={() => handleReview(3)} variant="outline" className="border-amber-200 text-amber-600 hover:bg-amber-50 flex-1 max-w-[120px]">Hard</Button>
                <Button onClick={() => handleReview(5)} className="bg-slate-900 hover:bg-slate-800 text-white flex-1 max-w-[120px]">Easy</Button>
              </div>
            )}
          </div>
        )}

        {/* Streak reminder toggle */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-900 mb-0.5">Streak reminders</p>
            <p className="text-xs text-slate-500">Get a push notification when you haven&apos;t studied today. Keeps your streak alive.</p>
          </div>
          <Button
            size="sm"
            variant={notifEnabled ? "outline" : "default"}
            className={notifEnabled ? "border-slate-200 shrink-0" : "bg-slate-900 hover:bg-slate-800 text-white shrink-0"}
            onClick={notifEnabled ? handleDisableNotifications : handleEnableNotifications}
            disabled={notifLoading}
          >
            {notifLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : notifEnabled ? (
              <><BellOff className="h-3.5 w-3.5 mr-1.5" /> Disable</>
            ) : (
              <><Bell className="h-3.5 w-3.5 mr-1.5" /> Enable</>
            )}
          </Button>
        </div>

        {/* Offline info */}
        {!isOnline && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-800 mb-1">You&apos;re offline</p>
            <p className="text-xs text-amber-700">
              Reviews are saved locally and will sync to your account automatically when you reconnect.
              {pendingCount > 0 ? ` ${pendingCount} review${pendingCount !== 1 ? "s" : ""} waiting to sync.` : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}
