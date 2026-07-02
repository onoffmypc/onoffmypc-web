// Cloudflare Pages Function: POST /api/contact
// Receives the marketing contact form and emails it to support via Resend
// (the project's existing transactional email provider). Configure on the
// onoffmypc-web Pages project:
//   RESEND_API_KEY  (secret)          — same key the API worker uses
//   CONTACT_TO      (var, optional)   — recipient, default support@onoffmypc.com
//   CONTACT_FROM    (var, optional)   — verified sender, default OnOffMyPC <noreply@onoffmypc.com>

const JSON_HEADERS = { 'Content-Type': 'application/json' }

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS })
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function clean(v, max) {
  return typeof v === 'string' ? v.trim().slice(0, max) : ''
}

export async function onRequestPost(context) {
  const { request, env } = context

  let payload
  try {
    const ct = request.headers.get('content-type') || ''
    if (ct.includes('application/json')) {
      payload = await request.json()
    } else {
      const form = await request.formData()
      payload = Object.fromEntries(form.entries())
    }
  } catch {
    return json({ error: 'Invalid request body.' }, 400)
  }

  // Honeypot — bots fill hidden fields. Pretend success so they don't retry.
  if (clean(payload.company, 100)) return json({ ok: true })

  const name = clean(payload.name, 100)
  const email = clean(payload.email, 200)
  const message = clean(payload.message, 5000)

  if (!name || !email || !message) {
    return json({ error: 'Please fill in your name, email, and message.' }, 400)
  }
  if (!EMAIL_RE.test(email)) {
    return json({ error: 'Please enter a valid email address.' }, 400)
  }

  if (!env.RESEND_API_KEY) {
    return json({ error: 'Contact form is not configured yet.' }, 503)
  }

  const to = env.CONTACT_TO || 'support@onoffmypc.com'
  const from = env.CONTACT_FROM || 'OnOffMyPC <noreply@onoffmypc.com>'

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      reply_to: `${name} <${email}>`,
      subject: `Contact form — ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    }),
  })

  if (!res.ok) {
    return json({ error: 'Could not send your message. Please email us directly.' }, 502)
  }

  return json({ ok: true })
}
