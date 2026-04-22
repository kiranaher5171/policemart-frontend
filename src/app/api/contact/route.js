import { NextResponse } from 'next/server'

function getStrapiBaseUrl() {
  const raw = process.env.STRAPI_URL || 'http://localhost:1337'
  return raw.replace(/\/$/, '')
}

function str(v, max) {
  if (typeof v !== 'string') return ''
  return v.trim().slice(0, max)
}

async function verifyRecaptchaToken(token) {
  const secret = process.env.RECAPTCHA_SECRET_KEY
  if (!secret) return true
  if (!token || typeof token !== 'string') return false
  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token }).toString(),
    })
    const json = await res.json()
    return json.success === true
  } catch {
    return false
  }
}

function summarizeStrapiError(status, baseUrl, bodyText, errJson) {
  if (!status) {
    return `Cannot reach Strapi at ${baseUrl}. Check STRAPI_URL in frontend/.env.local and that Strapi is running. (${bodyText || 'network error'})`
  }
  if (status === 403 || status === 401) {
    return 'Strapi returned 401/403 (forbidden). Fix: Strapi Admin → Settings → Users & permissions → Roles → Public → Contact-message → enable Create. Or set STRAPI_API_TOKEN in frontend/.env.local. Then restart Strapi.'
  }
  if (status === 404) {
    return 'Strapi returned 404 for /api/contact-messages. Add the Contact message collection, then restart Strapi.'
  }
  if (status === 500) {
    const extra =
      (bodyText && bodyText !== 'Internal Server Error' ? ` ${String(bodyText).slice(0, 200)}` : '') +
      ' — Check the Strapi terminal for a line starting with [contact-message.create]. If the DB table is out of date, stop Strapi, drop table contact_messages (backup first), start Strapi again so it recreates the table.'
    return `Strapi returned 500 (Internal Server Error).${extra}`
  }
  const msg =
    errJson?.error?.message ||
    errJson?.message ||
    (typeof errJson === 'object' && errJson !== null ? JSON.stringify(errJson) : '') ||
    bodyText
  if (msg) return String(msg).slice(0, 500)
  return `Strapi returned HTTP ${status}`
}

/**
 * Normalize Strapi v4/v5 list entry → flat row for the dashboard grid.
 * @param {Record<string, unknown>} entry
 */
function normalizeContactRow(entry) {
  if (!entry || typeof entry !== 'object') return null
  const attrs =
    entry.attributes && typeof entry.attributes === 'object' ? entry.attributes : entry
  const a = /** @type {Record<string, unknown>} */ (attrs)
  const first = String(a.firstName ?? '')
  const last = String(a.lastName ?? '')
  const fullName = [first, last].filter(Boolean).join(' ').trim()
  return {
    id: entry.id ?? entry.documentId,
    documentId: entry.documentId,
    firstName: first,
    lastName: last,
    name: fullName || String(a.name ?? ''),
    email: String(a.email ?? ''),
    phoneCountryCode: String(a.phoneCountryCode ?? ''),
    phoneNumber: String(a.phoneNumber ?? ''),
    phone: [a.phoneCountryCode, a.phoneNumber].filter(Boolean).join(' ').trim(),
    industryType: String(a.industryType ?? ''),
    businessType: String(a.businessType ?? ''),
    organization: String(a.organization ?? ''),
    jobTitle: String(a.jobTitle ?? ''),
    geography: String(a.geography ?? ''),
    country: String(a.country ?? ''),
    city: String(a.city ?? ''),
    inquiryType: String(a.inquiryType ?? ''),
    hearAboutUs: String(a.hearAboutUs ?? ''),
    subject: String(a.inquiryType ?? a.subject ?? ''),
    message: String(a.message ?? ''),
    newsletter: Boolean(a.newsletter),
    agreedToTerms: Boolean(a.agreedToTerms),
    createdAt: String(a.createdAt ?? entry.createdAt ?? ''),
  }
}

/**
 * GET → list contact messages from Strapi (newest first). Uses STRAPI_API_TOKEN when set.
 */
export async function GET() {
  const base = getStrapiBaseUrl()
  const params = new URLSearchParams()
  params.set('sort', 'createdAt:desc')
  params.set('pagination[pageSize]', '100')
  const url = `${base}/api/contact-messages?${params.toString()}`

  const headers = { Accept: 'application/json' }
  if (process.env.STRAPI_API_TOKEN) {
    headers.Authorization = `Bearer ${process.env.STRAPI_API_TOKEN}`
  }

  try {
    const res = await fetch(url, { headers, cache: 'no-store' })
    const rawText = await res.text()
    let errJson = null
    try {
      errJson = rawText ? JSON.parse(rawText) : null
    } catch {
      errJson = null
    }

    if (!res.ok) {
      const detail = summarizeStrapiError(res.status, base, rawText, errJson)
      return NextResponse.json(
        { error: detail, strapiStatus: res.status, data: [] },
        { status: res.status >= 400 && res.status < 600 ? res.status : 502 },
      )
    }

    const rows = Array.isArray(errJson?.data) ? errJson.data : []
    const data = rows.map(normalizeContactRow).filter(Boolean)
    return NextResponse.json({
      data,
      meta: errJson?.meta ?? null,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Network error'
    return NextResponse.json(
      { error: summarizeStrapiError(0, base, msg, null), data: [], strapiStatus: 0 },
      { status: 502 },
    )
  }
}

/**
 * Saves full Get in Touch form to Strapi.
 */
export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (process.env.RECAPTCHA_SECRET_KEY) {
    const ok = await verifyRecaptchaToken(body.recaptchaToken)
    if (!ok) {
      return NextResponse.json({ error: 'reCAPTCHA verification failed.' }, { status: 400 })
    }
  }

  const payload = {
    firstName: str(body.firstName, 120),
    lastName: str(body.lastName, 120),
    industryType: str(body.industryType, 200),
    businessType: str(body.businessType, 200),
    organization: str(body.organization, 300),
    jobTitle: str(body.jobTitle, 200),
    email: str(body.email, 320),
    phoneCountryCode: str(body.phoneCountryCode, 12) || '+91',
    phoneNumber: str(body.phoneNumber, 40),
    geography: str(body.geography, 200),
    country: str(body.country, 120),
    city: str(body.city, 120),
    inquiryType: str(body.inquiryType, 200),
    message: typeof body.message === 'string' ? body.message.trim().slice(0, 20000) : '',
    hearAboutUs: str(body.hearAboutUs, 200),
    newsletter: body.newsletter === true,
    agreedToTerms: body.agreedToTerms === true,
  }

  const missing = []
  if (!payload.firstName) missing.push('firstName')
  if (!payload.lastName) missing.push('lastName')
  if (!payload.industryType) missing.push('industryType')
  if (!payload.businessType) missing.push('businessType')
  if (!payload.organization) missing.push('organization')
  if (!payload.jobTitle) missing.push('jobTitle')
  if (!payload.email) missing.push('email')
  if (!payload.geography) missing.push('geography')
  if (!payload.country) missing.push('country')
  if (!payload.city) missing.push('city')
  if (!payload.inquiryType) missing.push('inquiryType')
  if (!payload.hearAboutUs) missing.push('hearAboutUs')
  if (!payload.agreedToTerms) missing.push('agreedToTerms')

  if (missing.length) {
    return NextResponse.json({ error: 'Please complete all required fields.', missing }, { status: 400 })
  }

  const base = getStrapiBaseUrl()
  const url = `${base}/api/contact-messages`

  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }
  if (process.env.STRAPI_API_TOKEN) {
    headers.Authorization = `Bearer ${process.env.STRAPI_API_TOKEN}`
  }

  const data = {
    firstName: payload.firstName,
    lastName: payload.lastName,
    industryType: payload.industryType,
    businessType: payload.businessType,
    organization: payload.organization,
    jobTitle: payload.jobTitle,
    email: payload.email,
    geography: payload.geography,
    country: payload.country,
    city: payload.city,
    inquiryType: payload.inquiryType,
    hearAboutUs: payload.hearAboutUs,
    newsletter: payload.newsletter,
    agreedToTerms: payload.agreedToTerms,
    phoneCountryCode: payload.phoneCountryCode,
    ...(payload.phoneNumber ? { phoneNumber: payload.phoneNumber } : {}),
    ...(payload.message ? { message: payload.message } : {}),
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ data }),
    })

    const rawText = await res.text()
    let errJson = null
    try {
      errJson = rawText ? JSON.parse(rawText) : null
    } catch {
      errJson = null
    }

    if (!res.ok) {
      const detail = summarizeStrapiError(res.status, base, rawText, errJson)
      const outStatus = res.status >= 400 && res.status < 600 ? res.status : 502
      return NextResponse.json(
        {
          error: detail,
          strapiStatus: res.status,
          detail,
        },
        { status: outStatus },
      )
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Network error'
    const detail = summarizeStrapiError(0, base, msg, null)
    return NextResponse.json({ error: detail, strapiStatus: 0, detail }, { status: 502 })
  }
}
