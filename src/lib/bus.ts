'use client'
import { useEffect, useRef } from 'react'

// Tiny client-side event bus for optimistic cross-component updates.
export function emit<T>(name: string, detail: T) {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(name, { detail }))
}

export function useBus<T>(name: string, handler: (detail: T) => void) {
  const ref = useRef(handler)
  ref.current = handler
  useEffect(() => {
    const fn = (e: Event) => ref.current((e as CustomEvent).detail)
    window.addEventListener(name, fn)
    return () => window.removeEventListener(name, fn)
  }, [name])
}

// Event name helpers — keep payloads consistent across emitters/listeners.
export type Entity = 'project' | 'task' | 'permit' | 'member'
export const evt = {
  add: (e: Entity) => `bn:${e}:add`,
  replace: (e: Entity) => `bn:${e}:replace`,
  remove: (e: Entity) => `bn:${e}:remove`,
  update: (e: Entity) => `bn:${e}:update`,
}
export type ReplacePayload<T> = { tempId: string; row: T }
