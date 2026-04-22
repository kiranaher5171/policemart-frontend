'use client'

import React, { useEffect, useRef, useState } from 'react'
import HeaderFooterLayout from '@/components/layout/HeaderFooterLayout/HeaderFooterLayout'
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

const INDUSTRY_OPTIONS = ['Banking', 'Insurance', 'Asset management', 'Real estate', 'Technology', 'Other']
const BUSINESS_TYPE_OPTIONS = ['B2B', 'B2C', 'Enterprise', 'SMB', 'Other']
const GEOGRAPHY_OPTIONS = ['Asia-Pacific', 'EMEA', 'Americas', 'Global', 'India', 'Other']
const COUNTRY_OPTIONS = ['India', 'United States', 'United Kingdom', 'Singapore', 'Other']
const INQUIRY_OPTIONS = ['General inquiry', 'Job inquiry', 'Partnership', 'Product demo', 'Support', 'Other']
const HEAR_ABOUT_OPTIONS = ['Search engine', 'LinkedIn', 'Referral', 'Event', 'Newsletter', 'Other']
const PHONE_CODES = [
  { label: 'IN +91', value: '+91' },
  { label: 'US +1', value: '+1' },
  { label: 'UK +44', value: '+44' },
  { label: 'SG +65', value: '+65' },
]

const initialValues = {
  firstName: '',
  lastName: '',
  industryType: '',
  businessType: '',
  organization: '',
  jobTitle: '',
  email: '',
  phoneCountryCode: '+91',
  phoneNumber: '',
  geography: '',
  country: '',
  city: '',
  inquiryType: '',
  message: '',
  hearAboutUs: '',
  newsletter: false,
  agreedToTerms: false,
}

export default function ContactUsPage() {
  const [v, setV] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const recaptchaWidgetId = useRef(null)

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

  useEffect(() => {
    if (!siteKey || typeof window === 'undefined') return undefined

    const render = () => {
      const el = document.getElementById('recaptcha-container')
      if (!el || !window.grecaptcha?.render) return
      try {
        recaptchaWidgetId.current = window.grecaptcha.render('recaptcha-container', {
          sitekey: siteKey,
          theme: 'light',
        })
      } catch {
        /* already rendered */
      }
    }

    const existing = document.querySelector('script[data-recaptcha-v2]')
    if (existing) {
      window.grecaptcha?.ready?.(render) ?? render()
      return undefined
    }

    window.__recaptchaV2OnLoad = () => {
      window.grecaptcha?.ready?.(render) ?? render()
    }
    const script = document.createElement('script')
    script.src = 'https://www.google.com/recaptcha/api.js?onload=__recaptchaV2OnLoad&render=explicit'
    script.async = true
    script.defer = true
    script.setAttribute('data-recaptcha-v2', '1')
    document.body.appendChild(script)

    return () => {
      delete window.__recaptchaV2OnLoad
    }
  }, [siteKey])

  function validate() {
    const e = {}
    if (!v.firstName.trim()) e.firstName = 'First name is required'
    if (!v.lastName.trim()) e.lastName = 'Last name is required'
    if (!v.industryType) e.industryType = 'Industry type is required'
    if (!v.businessType) e.businessType = 'Business type is required'
    if (!v.organization.trim()) e.organization = 'Organization is required'
    if (!v.jobTitle.trim()) e.jobTitle = 'Job title is required'
    if (!v.email.trim()) e.email = 'Email address is required'
    if (!v.geography) e.geography = 'Geography is required'
    if (!v.country) e.country = 'Country is required'
    if (!v.city.trim()) e.city = 'City is required'
    if (!v.inquiryType) e.inquiryType = 'Inquiry type is required'
    if (!v.hearAboutUs) e.hearAboutUs = 'This field is required'
    if (!v.agreedToTerms) e.agreedToTerms = 'You must agree to the Terms of Use and Privacy Policy'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setFeedback('')
    if (!validate()) return

    let recaptchaToken = ''
    if (siteKey && typeof window !== 'undefined' && window.grecaptcha && recaptchaWidgetId.current != null) {
      recaptchaToken = window.grecaptcha.getResponse(recaptchaWidgetId.current) || ''
      if (!recaptchaToken) {
        setError('Please complete the reCAPTCHA.')
        return
      }
    }

    const payload = {
      ...v,
      recaptchaToken: recaptchaToken || undefined,
    }

    setPending(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const hint = data.error || data.detail || 'Something went wrong'
        const code =
          typeof data.strapiStatus === 'number' && data.strapiStatus > 0
            ? ` [Strapi HTTP ${data.strapiStatus}]`
            : ''
        throw new Error(`${hint}${code}`)
      }
      setFeedback(
        'Thank you — your message has been received. We will get back to you as soon as possible.',
      )
      setV(initialValues)
      setErrors({})
      if (siteKey && window.grecaptcha && recaptchaWidgetId.current != null) {
        window.grecaptcha.reset(recaptchaWidgetId.current)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setPending(false)
    }
  }

  const tf = (sx = {}) => ({ variant: 'outlined', fullWidth: true, sx: { mb: 0.5, ...sx } })

  return (
    <HeaderFooterLayout>
      <Container maxWidth="md" sx={{ pt: '100px', pb: 6 }}>
        <Typography variant="h3" component="h1" className="lora" sx={{ fontWeight: 700, mb: 1 }}>
          Get in Touch
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 560 }}>
          Define your goals and identify areas where we can add value to your business
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...tf()}
                label="First Name *"
                value={v.firstName}
                onChange={(e) => setV((s) => ({ ...s, firstName: e.target.value }))}
                error={Boolean(errors.firstName)}
                helperText={errors.firstName}
                autoComplete="given-name"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...tf()}
                label="Last Name *"
                value={v.lastName}
                onChange={(e) => setV((s) => ({ ...s, lastName: e.target.value }))}
                error={Boolean(errors.lastName)}
                helperText={errors.lastName}
                autoComplete="family-name"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControl variant="outlined" fullWidth error={Boolean(errors.industryType)}>
                <InputLabel id="industry-label">Industry Type *</InputLabel>
                <Select
                  labelId="industry-label"
                  label="Industry Type *"
                  value={v.industryType}
                  onChange={(e) => setV((s) => ({ ...s, industryType: e.target.value }))}
                >
                  <MenuItem value="">
                    <em>Select</em>
                  </MenuItem>
                  {INDUSTRY_OPTIONS.map((o) => (
                    <MenuItem key={o} value={o}>
                      {o}
                    </MenuItem>
                  ))}
                </Select>
                {errors.industryType ? <FormHelperText>{errors.industryType}</FormHelperText> : null}
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl variant="outlined" fullWidth error={Boolean(errors.businessType)}>
                <InputLabel id="bt-label">Business Type *</InputLabel>
                <Select
                  labelId="bt-label"
                  label="Business Type *"
                  value={v.businessType}
                  onChange={(e) => setV((s) => ({ ...s, businessType: e.target.value }))}
                >
                  <MenuItem value="">
                    <em>Select</em>
                  </MenuItem>
                  {BUSINESS_TYPE_OPTIONS.map((o) => (
                    <MenuItem key={o} value={o}>
                      {o}
                    </MenuItem>
                  ))}
                </Select>
                {errors.businessType ? <FormHelperText>{errors.businessType}</FormHelperText> : null}
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...tf()}
                label="Organization *"
                value={v.organization}
                onChange={(e) => setV((s) => ({ ...s, organization: e.target.value }))}
                error={Boolean(errors.organization)}
                helperText={errors.organization}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...tf()}
                label="Job Title *"
                value={v.jobTitle}
                onChange={(e) => setV((s) => ({ ...s, jobTitle: e.target.value }))}
                error={Boolean(errors.jobTitle)}
                helperText={errors.jobTitle}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...tf()}
                label="Email Address *"
                type="email"
                value={v.email}
                onChange={(e) => setV((s) => ({ ...s, email: e.target.value }))}
                error={Boolean(errors.email)}
                helperText={errors.email}
                autoComplete="email"
              />
            </Grid>

            <Grid size={{ xs: 12 }}> 
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                  <InputLabel id="cc-label">Code</InputLabel>
                  <Select
                    labelId="cc-label"
                    label="Code"
                    value={v.phoneCountryCode}
                    onChange={(e) => setV((s) => ({ ...s, phoneCountryCode: e.target.value }))}
                  >
                    {PHONE_CODES.map((o) => (
                      <MenuItem key={o.value} value={o.value}>
                        {o.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  {...tf({ flex: 1 })}
                  label="Phone number"
                  value={v.phoneNumber}
                  onChange={(e) => setV((s) => ({ ...s, phoneNumber: e.target.value }))}
                  type="tel"
                  autoComplete="tel-national"
                />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControl variant="outlined" fullWidth error={Boolean(errors.geography)}>
                <InputLabel id="geo-label">Geography *</InputLabel>
                <Select
                  labelId="geo-label"
                  label="Geography *"
                  value={v.geography}
                  onChange={(e) => setV((s) => ({ ...s, geography: e.target.value }))}
                >
                  <MenuItem value="">
                    <em>Select</em>
                  </MenuItem>
                  {GEOGRAPHY_OPTIONS.map((o) => (
                    <MenuItem key={o} value={o}>
                      {o}
                    </MenuItem>
                  ))}
                </Select>
                {errors.geography ? <FormHelperText>{errors.geography}</FormHelperText> : null}
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl variant="outlined" fullWidth error={Boolean(errors.country)}>
                <InputLabel id="country-label">Country *</InputLabel>
                <Select
                  labelId="country-label"
                  label="Country *"
                  value={v.country}
                  onChange={(e) => setV((s) => ({ ...s, country: e.target.value }))}
                >
                  <MenuItem value="">
                    <em>Select</em>
                  </MenuItem>
                  {COUNTRY_OPTIONS.map((o) => (
                    <MenuItem key={o} value={o}>
                      {o}
                    </MenuItem>
                  ))}
                </Select>
                {errors.country ? <FormHelperText>{errors.country}</FormHelperText> : null}
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...tf()}
                label="City *"
                value={v.city}
                onChange={(e) => setV((s) => ({ ...s, city: e.target.value }))}
                error={Boolean(errors.city)}
                helperText={errors.city}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControl variant="outlined" fullWidth error={Boolean(errors.inquiryType)}>
                <InputLabel id="inq-label">Inquiry Type *</InputLabel>
                <Select
                  labelId="inq-label"
                  label="Inquiry Type *"
                  value={v.inquiryType}
                  onChange={(e) => setV((s) => ({ ...s, inquiryType: e.target.value }))}
                >
                  <MenuItem value="">
                    <em>Select</em>
                  </MenuItem>
                  {INQUIRY_OPTIONS.map((o) => (
                    <MenuItem key={o} value={o}>
                      {o}
                    </MenuItem>
                  ))}
                </Select>
                {errors.inquiryType ? <FormHelperText>{errors.inquiryType}</FormHelperText> : null}
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                {...tf()}
                label="Message"
                value={v.message}
                onChange={(e) => setV((s) => ({ ...s, message: e.target.value }))}
                multiline
                minRows={4}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControl variant="outlined" fullWidth error={Boolean(errors.hearAboutUs)}>
                <InputLabel id="hear-label">How did you hear about us? *</InputLabel>
                <Select
                  labelId="hear-label"
                  label="How did you hear about us? *"
                  value={v.hearAboutUs}
                  onChange={(e) => setV((s) => ({ ...s, hearAboutUs: e.target.value }))}
                >
                  <MenuItem value="">
                    <em>Select</em>
                  </MenuItem>
                  {HEAR_ABOUT_OPTIONS.map((o) => (
                    <MenuItem key={o} value={o}>
                      {o}
                    </MenuItem>
                  ))}
                </Select>
                {errors.hearAboutUs ? <FormHelperText>{errors.hearAboutUs}</FormHelperText> : null}
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={v.newsletter}
                    onChange={(e) => setV((s) => ({ ...s, newsletter: e.target.checked }))}
                    color="primary"
                  />
                }
                label="Subscribe to our Newsletter"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={v.agreedToTerms}
                    onChange={(e) => setV((s) => ({ ...s, agreedToTerms: e.target.checked }))}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2" component="span">
                    I agree to the{' '}
                    <Link href="/terms-of-use" underline="hover">
                      Terms of Use
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy-policy" underline="hover">
                      Privacy Policy
                    </Link>
                    . *
                  </Typography>
                }
              />
              {errors.agreedToTerms ? (
                <FormHelperText error sx={{ ml: 0 }}>
                  {errors.agreedToTerms}
                </FormHelperText>
              ) : null}
            </Grid>

            {siteKey ? (
              <Grid size={{ xs: 12 }}>
                <Box id="recaptcha-container" sx={{ mt: 1 }} />
              </Grid>
            ) : (
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" color="text.secondary">
                  Optional: set NEXT_PUBLIC_RECAPTCHA_SITE_KEY and RECAPTCHA_SECRET_KEY to enable Google reCAPTCHA.
                </Typography>
              </Grid>
            )}

            <Grid size={{ xs: 12 }} sx={{ mt: 1 }}>
              <Button
                type="submit"
                variant="outlined"
                size="large"
                disabled={pending}
                sx={{
                  borderColor: 'var(--secondary)',
                  color: 'var(--secondary)',
                  px: 4,
                  '&:hover': {
                    borderColor: 'var(--secondary)',
                    bgcolor: 'rgba(204, 51, 102, 0.06)',
                  },
                }}
              >
                {pending ? 'Submitting…' : 'Submit'}
              </Button>
            </Grid>
          </Grid>
        </Box>

        {error ? (
          <Typography variant="body2" color="error" sx={{ mt: 2 }} role="alert">
            {error}
          </Typography>
        ) : null}
        {feedback ? (
          <Typography variant="body2" color="success.main" sx={{ mt: 2 }}>
            {feedback}
          </Typography>
        ) : null}
      </Container>
    </HeaderFooterLayout>
  )
}
