// Single generic email template for all Doppio notification emails.
// Only the subject, heading and body lines change per notification type.

export type EmailType = 'task_assigned' | 'due_reminder' | 'document_status' | 'weekly_digest'

export function emailContent(type: EmailType, data: Record<string, unknown>): { subject: string; heading: string; lines: string[]; link: string } {
  const link = (data.link as string) || process.env.NEXT_PUBLIC_SITE_URL || ''
  switch (type) {
    case 'task_assigned':
      return { subject: `New task assigned: ${data.taskTitle}`, heading: 'A task was assigned to you', lines: [`Task: ${data.taskTitle}`, `Project: ${data.projectName}`, `Due: ${data.dueDate || '—'}`], link }
    case 'due_reminder':
      return { subject: `Due within 24 hours: ${data.taskTitle}`, heading: 'Due within 24 hours', lines: [`Task: ${data.taskTitle}`, `Project: ${data.projectName}`, `Due: ${data.dueDate}`], link }
    case 'document_status':
      return { subject: `Document ${data.docNumber} is now ${data.status}`, heading: 'Document status updated', lines: [`Document: ${data.docNumber}`, `Project: ${data.projectName}`, `New status: ${data.status}`], link }
    case 'weekly_digest':
      return { subject: 'Your Doppio weekly digest', heading: 'Your weekly digest', lines: (data.lines as string[]) || [], link }
  }
}

// One light, clay-accent template for every email (matches the app theme).
export function renderEmail(heading: string, lines: string[], link: string): string {
  return `<!doctype html><html><body style="margin:0;background:#FAF9F5;font-family:Inter,Arial,sans-serif;color:#1F1E1C;">
  <div style="max-width:560px;margin:0 auto;padding:28px 20px;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px;">
      <div style="width:30px;height:30px;border-radius:7px;background:#F2E2D8;border:1px solid #DEDBD2;text-align:center;line-height:30px;font-size:13px;">🛰️</div>
      <span style="font-weight:700;font-size:17px;letter-spacing:-0.02em;">Doppio</span>
    </div>
    <div style="background:#FFFFFF;border:1px solid #DEDBD2;border-radius:14px;padding:26px 24px;">
      <h1 style="font-size:18px;margin:0 0 16px;color:#1F1E1C;">${heading}</h1>
      <table style="width:100%;border-collapse:collapse;">
        ${lines.map(l => `<tr><td style="padding:6px 0;color:#5C5A52;font-size:13px;">${l}</td></tr>`).join('')}
      </table>
      ${link ? `<a href="${link}" style="display:inline-block;margin-top:18px;background:#CC785C;color:#FFFFFF;border-radius:8px;padding:10px 18px;font-size:13px;font-weight:700;text-decoration:none;">Open in Doppio</a>` : ''}
    </div>
    <p style="font-size:11px;color:#8C8980;margin-top:20px;text-align:center;">Doppio — the operating system for project-driven teams.</p>
  </div></body></html>`
}
