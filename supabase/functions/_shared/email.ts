// Shared dark-themed email templates for Bionova transactional emails.

const SITE = Deno.env.get('SITE_URL') || 'https://app.bionova.example'

export type EmailType = 'task_assigned' | 'due_reminder' | 'permit_status' | 'weekly_digest'

function wrap(title: string, inner: string): string {
  return `<!doctype html><html><body style="margin:0;background:#080808;font-family:Inter,Arial,sans-serif;color:#F2F2F2;">
  <div style="max-width:560px;margin:0 auto;padding:28px 20px;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px;">
      <div style="width:30px;height:30px;border-radius:7px;background:#161616;border:1px dashed #262626;text-align:center;line-height:30px;font-size:9px;color:#303030;">LOGO</div>
      <span style="font-weight:700;font-size:17px;letter-spacing:-0.02em;">Bionova</span>
    </div>
    <div style="background:#0F0F0F;border:1px solid #262626;border-radius:14px;padding:26px 24px;">
      <h1 style="font-size:18px;margin:0 0 14px;color:#F2F2F2;">${title}</h1>
      ${inner}
    </div>
    <p style="font-size:11px;color:#606060;margin-top:20px;text-align:center;">Bionova — the operating system for renewable energy companies.</p>
  </div></body></html>`
}

function row(label: string, value: string): string {
  return `<tr><td style="padding:6px 0;color:#606060;font-size:12px;">${label}</td><td style="padding:6px 0;color:#F2F2F2;font-size:13px;text-align:right;">${value}</td></tr>`
}
function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;margin-top:18px;background:#F2F2F2;color:#080808;border-radius:8px;padding:10px 18px;font-size:13px;font-weight:700;text-decoration:none;">${label}</a>`
}

export function defaultSubject(type: EmailType, data: Record<string, unknown>): string {
  switch (type) {
    case 'task_assigned': return `New task assigned: ${data.taskTitle}`
    case 'due_reminder': return `Due within 24 hours: ${data.taskTitle}`
    case 'permit_status': return `Permit ${data.permitNumber} is now ${data.status}`
    case 'weekly_digest': return `Your Bionova weekly digest`
  }
}

export function brandEmail(type: EmailType, data: Record<string, unknown>): string {
  const link = (data.link as string) || SITE
  switch (type) {
    case 'task_assigned':
      return wrap('A task was assigned to you', `
        <p style="font-size:13px;color:#A0A0A0;margin:0 0 14px;">You've been assigned a new task.</p>
        <table style="width:100%;border-collapse:collapse;">
          ${row('Task', String(data.taskTitle))}
          ${row('Project', String(data.projectName))}
          ${row('Due date', String(data.dueDate || '—'))}
        </table>
        ${button(link, 'View task')}`)
    case 'due_reminder':
      return wrap('Due within 24 hours', `
        <p style="font-size:13px;color:#A0A0A0;margin:0 0 14px;">This task is due soon:</p>
        <table style="width:100%;border-collapse:collapse;">
          ${row('Task', String(data.taskTitle))}
          ${row('Project', String(data.projectName))}
          ${row('Due', String(data.dueDate))}
        </table>
        ${button(link, 'View task')}`)
    case 'permit_status':
      return wrap('Permit status updated', `
        <table style="width:100%;border-collapse:collapse;">
          ${row('Permit', String(data.permitNumber))}
          ${row('Project', String(data.projectName))}
          ${row('New status', String(data.status))}
        </table>
        ${button(link, 'View permits')}`)
    case 'weekly_digest': {
      const items = (data.lines as string[]) || []
      return wrap('Your weekly digest', `
        <p style="font-size:13px;color:#A0A0A0;margin:0 0 12px;">Here's where things stand this week.</p>
        <ul style="padding-left:18px;margin:0;color:#F2F2F2;font-size:13px;line-height:1.8;">
          ${items.map(l => `<li>${l}</li>`).join('')}
        </ul>
        ${button(link, 'Open Bionova')}`)
    }
  }
}
