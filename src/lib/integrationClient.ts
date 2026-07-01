// Fire-and-forget client helpers for integration side-effects. Every call is
// non-blocking and swallows errors — integrations must never break the UI.

export function notifySlack(messageType: string, text: string) {
  try {
    fetch('/api/integrations/slack/notify', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageType, text }),
    }).catch(() => {})
  } catch { /* ignore */ }
}

export function syncCalendar(taskId: string, action: 'upsert' | 'delete') {
  try {
    fetch('/api/integrations/calendar/sync', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, action }),
    }).catch(() => {})
  } catch { /* ignore */ }
}
