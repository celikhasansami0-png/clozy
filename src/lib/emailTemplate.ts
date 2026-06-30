// Single generic email template for all Orbit notification emails.
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
      return { subject: 'Your Orbit weekly digest', heading: 'Your weekly digest', lines: (data.lines as string[]) || [], link }
  }
}

// One dark-themed, blue-accent template for every email.
export function renderEmail(heading: string, lines: string[], link: string): string {
  return `<!doctype html><html><body style="margin:0;background:#0A0B0D;font-family:Inter,Arial,sans-serif;color:#F5F6F7;">
  <div style="max-width:560px;margin:0 auto;padding:28px 20px;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px;">
      <div style="width:30px;height:30px;border-radius:7px;background:#16203A;border:1px solid #262A35;text-align:center;line-height:30px;font-size:13px;">🛰️</div>
      <span style="font-weight:700;font-size:17px;letter-spacing:-0.02em;">Orbit</span>
    </div>
    <div style="background:#12141A;border:1px solid #262A35;border-radius:14px;padding:26px 24px;">
      <h1 style="font-size:18px;margin:0 0 16px;color:#F5F6F7;">${heading}</h1>
      <table style="width:100%;border-collapse:collapse;">
        ${lines.map(l => `<tr><td style="padding:6px 0;color:#9CA3AF;font-size:13px;">${l}</td></tr>`).join('')}
      </table>
      ${link ? `<a href="${link}" style="display:inline-block;margin-top:18px;background:#4D7FFF;color:#FFFFFF;border-radius:8px;padding:10px 18px;font-size:13px;font-weight:700;text-decoration:none;">Open in Orbit</a>` : ''}
    </div>
    <p style="font-size:11px;color:#5C6470;margin-top:20px;text-align:center;">Orbit — the operating system for project-driven teams.</p>
  </div></body></html>`
}
