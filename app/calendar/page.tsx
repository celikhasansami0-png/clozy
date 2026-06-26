"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, CalendarDays, Download } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTasks } from "@/hooks/use-tasks"
import { useAssignments } from "@/hooks/use-assignments"

type EventType = "task" | "assignment" | "milestone"

type CalEvent = {
  id: string
  title: string
  date: string
  type: EventType
  href: string
  extra?: string
}

const EVENT_STYLE: Record<EventType, { bg: string; text: string; dot: string }> = {
  task: { bg: "bg-amber-50 border-amber-200", text: "text-amber-800", dot: "bg-amber-400" },
  assignment: { bg: "bg-blue-50 border-blue-200", text: "text-blue-800", dot: "bg-blue-400" },
  milestone: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-800", dot: "bg-emerald-400" },
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

export default function CalendarPage() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate())

  const { tasks } = useTasks()
  const { assignments } = useAssignments()

  const events = useMemo<CalEvent[]>(() => {
    const ev: CalEvent[] = []
    tasks.forEach((t) => {
      if (t.due_date && t.status !== "completed") {
        ev.push({ id: t.id, title: t.title, date: t.due_date.slice(0, 10), type: "task", href: "/automation", extra: t.priority })
      }
    })
    assignments.forEach((a) => {
      if (a.due_date && a.status !== "submitted") {
        ev.push({ id: a.id, title: a.title, date: a.due_date.slice(0, 10), type: "assignment", href: "/assignment", extra: a.type.replace(/_/g, " ") })
      }
    })
    return ev
  }, [tasks, assignments])

  const eventsOnDate = (d: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
    return events.filter((e) => e.date === dateStr)
  }

  const selectedEvents = selectedDay ? eventsOnDate(selectedDay) : []

  const selectedDateStr = selectedDay
    ? `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`
    : null

  const upcomingEvents = events
    .filter((e) => e.date >= today.toISOString().slice(0, 10))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 10)

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1) }

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const exportICS = () => {
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Autopilot OS//EN",
    ]
    events.forEach((e) => {
      const dt = e.date.replace(/-/g, "")
      lines.push(
        "BEGIN:VEVENT",
        `UID:${e.id}@autopilot-os`,
        `DTSTART;VALUE=DATE:${dt}`,
        `DTEND;VALUE=DATE:${dt}`,
        `SUMMARY:${e.title}`,
        `CATEGORIES:${e.type.toUpperCase()}`,
        "END:VEVENT",
      )
    })
    lines.push("END:VCALENDAR")
    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = "academic-calendar.ics"; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <PageHeader
        title="Calendar"
        description="All your deadlines, assignments, and tasks in one view."
        actions={
          <Button variant="outline" className="border-slate-200 gap-2" onClick={exportICS}>
            <Download className="h-4 w-4" />
            Export .ics
          </Button>
        }
      />

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              {/* Month header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-900">{MONTHS[month]} {year}</h2>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={prevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 px-3 text-xs"
                    onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); setSelectedDay(today.getDate()) }}>
                    Today
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 border-b border-slate-100">
                {DAYS.map((d) => (
                  <div key={d} className="py-2 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{d}</div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-[72px] border-b border-r border-slate-50" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const dayEvents = eventsOnDate(day)
                  const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
                  const isSelected = day === selectedDay
                  const isPast = new Date(year, month, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate())

                  return (
                    <div
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`h-[72px] border-b border-r border-slate-50 p-1.5 cursor-pointer transition-colors ${
                        isSelected ? "bg-slate-900" : isPast ? "bg-slate-50/50 hover:bg-slate-50" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className={`text-xs font-medium mb-1 flex items-center justify-center h-5 w-5 rounded-full ${
                        isToday && !isSelected ? "bg-slate-900 text-white text-[11px]" :
                        isSelected ? "text-white font-bold" :
                        isPast ? "text-slate-300" : "text-slate-700"
                      }`}>
                        {day}
                      </div>
                      <div className="space-y-0.5">
                        {dayEvents.slice(0, 2).map((ev) => (
                          <div key={ev.id} className={`flex items-center gap-1 rounded px-1 py-0.5 ${isSelected ? "bg-white/20" : ""}`}>
                            <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${EVENT_STYLE[ev.type].dot}`} />
                            <span className={`text-[10px] truncate ${isSelected ? "text-white/80" : "text-slate-600"}`}>{ev.title}</span>
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <p className={`text-[10px] pl-1 ${isSelected ? "text-white/60" : "text-slate-400"}`}>+{dayEvents.length - 2} more</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-3 px-1">
              {(Object.keys(EVENT_STYLE) as EventType[]).map((type) => (
                <div key={type} className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${EVENT_STYLE[type].dot}`} />
                  <span className="text-xs text-slate-500 capitalize">{type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Selected day events */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">
                {selectedDay ? `${MONTHS[month]} ${selectedDay}` : "Select a day"}
              </h3>
              {selectedEvents.length === 0 ? (
                <div className="text-center py-4">
                  <CalendarDays className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No events on this day</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedEvents.map((ev) => (
                    <Link key={ev.id} href={ev.href}>
                      <div className={`rounded-lg border px-3 py-2.5 cursor-pointer hover:shadow-sm transition-shadow ${EVENT_STYLE[ev.type].bg}`}>
                        <p className={`text-xs font-medium ${EVENT_STYLE[ev.type].text}`}>{ev.title}</p>
                        {ev.extra && <p className={`text-[11px] mt-0.5 opacity-75 ${EVENT_STYLE[ev.type].text}`}>{ev.extra}</p>}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming events */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Upcoming deadlines</h3>
              {upcomingEvents.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No upcoming deadlines</p>
              ) : (
                <div className="space-y-2">
                  {upcomingEvents.map((ev) => {
                    const evDate = new Date(ev.date + "T00:00:00")
                    const daysAway = Math.ceil((evDate.getTime() - today.setHours(0, 0, 0, 0)) / 86400000)
                    return (
                      <Link key={ev.id} href={ev.href}>
                        <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-slate-50 cursor-pointer group">
                          <span className={`h-2 w-2 rounded-full shrink-0 ${EVENT_STYLE[ev.type].dot}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-800 truncate">{ev.title}</p>
                            <p className="text-[11px] text-slate-400">{ev.date}</p>
                          </div>
                          <Badge variant="secondary" className={`text-[10px] shrink-0 ${daysAway <= 3 ? "bg-red-100 text-red-700" : daysAway <= 7 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>
                            {daysAway === 0 ? "Today" : daysAway === 1 ? "Tomorrow" : `${daysAway}d`}
                          </Badge>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
