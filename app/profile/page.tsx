'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@auth0/nextjs-auth0/client'
import { mockTickets, type Ticket } from '@/lib/data'

// ── Types ────────────────────────────────────────────────────────────────────

type ProfileTab = 'tokens' | 'connections' | 'support' | 'methods'
type Strategy = 'oidc' | 'samlp'

interface TokenData {
  accessToken: string | null
  idToken: string | null
  refreshToken: string | null
}

interface SamlFields {
  name: string
  signInEndpoint: string
  signingCert: string
  signOutEndpoint: string
  signSAMLRequest: boolean
  digestAlgorithm: 'sha1' | 'sha256'
  signatureAlgorithm: 'rsa-sha1' | 'rsa-sha256'
}

const defaultOidc = {
  name: '',
  discoveryUrl: '',
  clientId: '',
  clientSecret: '',
  scope: 'openid profile email',
}

const defaultSaml: SamlFields = {
  name: '',
  signInEndpoint: '',
  signingCert: '',
  signOutEndpoint: '',
  signSAMLRequest: false,
  digestAlgorithm: 'sha256',
  signatureAlgorithm: 'rsa-sha256',
}

type OidcFields = typeof defaultOidc

// ── Helpers ──────────────────────────────────────────────────────────────────

function decodeJwt(token: string): { header: object; payload: object } | null {
  try {
    const [headerB64, payloadB64] = token.split('.')
    const decode = (s: string) => JSON.parse(atob(s.replace(/-/g, '+').replace(/_/g, '/')))
    return { header: decode(headerB64), payload: decode(payloadB64) }
  } catch {
    return null
  }
}

function stripPem(cert: string): string {
  return cert
    .replace(/-----BEGIN CERTIFICATE-----/g, '')
    .replace(/-----END CERTIFICATE-----/g, '')
    .replace(/\s+/g, '')
}

// ── Shared UI ────────────────────────────────────────────────────────────────

const inputCls =
  'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-portal-blue focus:border-transparent placeholder-gray-400'

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

// ── Token Card ───────────────────────────────────────────────────────────────

function TokenCard({ label, token }: { label: string; token: string | null }) {
  const [visible, setVisible] = useState(false)
  const [decoded, setDecoded] = useState(false)
  const [copied, setCopied] = useState(false)

  const isJwt = token ? token.split('.').length === 3 : false
  const decodedData = token && isJwt ? decodeJwt(token) : null

  async function copy() {
    if (!token) return
    await navigator.clipboard.writeText(token)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-800">{label}</span>
          {token ? (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
              Present
            </span>
          ) : (
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
              Not available
            </span>
          )}
        </div>

        {token && (
          <div className="flex items-center gap-2">
            {isJwt && (
              <button
                onClick={() => setDecoded((d) => !d)}
                className="text-xs text-portal-blue hover:underline font-medium"
              >
                {decoded ? 'Raw' : 'Decode'}
              </button>
            )}
            <button
              onClick={() => setVisible((v) => !v)}
              className="text-xs text-gray-500 hover:text-gray-800 font-medium border border-gray-200 rounded px-2 py-0.5 transition-colors"
            >
              {visible ? 'Hide' : 'Show'}
            </button>
            <button
              onClick={copy}
              className="text-xs font-medium border border-gray-200 rounded px-2 py-0.5 transition-colors text-gray-500 hover:text-gray-800"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        )}
      </div>

      {token && visible && (
        <div className="mt-2">
          {decoded && decodedData ? (
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Header</p>
                <pre className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-xs font-mono text-gray-800 overflow-x-auto whitespace-pre-wrap break-all">
                  {JSON.stringify(decodedData.header, null, 2)}
                </pre>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Payload</p>
                <pre className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-xs font-mono text-gray-800 overflow-x-auto whitespace-pre-wrap break-all">
                  {JSON.stringify(decodedData.payload, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <pre className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-xs font-mono text-gray-800 overflow-x-auto whitespace-pre-wrap break-all">
              {token}
            </pre>
          )}
        </div>
      )}

      {!token && (
        <p className="text-xs text-gray-400">
          {label === 'Refresh Token'
            ? 'Requires offline_access scope to be requested at login.'
            : label === 'Access Token'
            ? 'Requires an API audience to be configured.'
            : 'Not returned in this session.'}
        </p>
      )}
    </div>
  )
}

// ── Profile & Tokens Tab ─────────────────────────────────────────────────────

function TokensTab() {
  const { user } = useUser()
  const [tokens, setTokens] = useState<TokenData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error)
        } else {
          setTokens(data as TokenData)
        }
      })
      .catch(() => setError('Failed to load tokens.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-8">
      {/* User profile card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex items-center gap-5">
        <div className="w-16 h-16 bg-portal-yellow rounded-full flex items-center justify-center text-portal-dark font-bold text-2xl shrink-0">
          {user?.name?.charAt(0).toUpperCase() ?? 'U'}
        </div>
        <div className="min-w-0">
          <p className="text-lg font-bold text-gray-900 truncate">{user?.name}</p>
          <p className="text-sm text-gray-500 truncate">{user?.email}</p>
          {user?.sub && (
            <p className="text-xs text-gray-400 mt-1 font-mono truncate">sub: {user.sub}</p>
          )}
        </div>
      </div>

      {/* Tokens */}
      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-4">Session Tokens</h2>

        {loading && (
          <p className="text-sm text-gray-400">Loading tokens…</p>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {tokens && !loading && (
          <div className="space-y-4">
            <TokenCard label="Access Token" token={tokens.accessToken} />
            <TokenCard label="ID Token" token={tokens.idToken} />
            <TokenCard label="Refresh Token" token={tokens.refreshToken} />
          </div>
        )}
      </div>
    </div>
  )
}

// ── Enterprise Connections Tab ───────────────────────────────────────────────

function ConnectionsTab() {
  const [strategy, setStrategy] = useState<Strategy>('oidc')
  const [oidc, setOidc] = useState<OidcFields>(defaultOidc)
  const [saml, setSaml] = useState<SamlFields>(defaultSaml)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ id: string; name: string; label: string } | null>(null)
  const [error, setError] = useState('')

  function resetFeedback() {
    setResult(null)
    setError('')
  }

  async function submitOidc() {
    resetFeedback()
    if (!oidc.name.trim() || !oidc.discoveryUrl.trim() || !oidc.clientId.trim() || !oidc.clientSecret.trim()) {
      setError('Please fill in all required fields.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: oidc.name.trim(),
          strategy: 'oidc',
          options: {
            type: 'back_channel',
            discovery_url: oidc.discoveryUrl.trim(),
            client_id: oidc.clientId.trim(),
            client_secret: oidc.clientSecret,
            scope: oidc.scope.trim() || 'openid profile email',
          },
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError((data as { error?: string }).error ?? 'Failed to create connection.')
      } else {
        setResult({ id: (data as { id: string }).id, name: (data as { name: string }).name, label: 'OIDC' })
        setOidc(defaultOidc)
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function submitSaml() {
    resetFeedback()
    if (!saml.name.trim() || !saml.signInEndpoint.trim() || !saml.signingCert.trim()) {
      setError('Please fill in all required fields.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: saml.name.trim(),
          strategy: 'samlp',
          options: {
            signInEndpoint: saml.signInEndpoint.trim(),
            signingCert: stripPem(saml.signingCert),
            ...(saml.signOutEndpoint.trim() && { signOutEndpoint: saml.signOutEndpoint.trim() }),
            signSAMLRequest: saml.signSAMLRequest,
            digestAlgorithm: saml.digestAlgorithm,
            signatureAlgorithm: saml.signatureAlgorithm,
          },
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError((data as { error?: string }).error ?? 'Failed to create connection.')
      } else {
        setResult({ id: (data as { id: string }).id, name: (data as { name: string }).name, label: 'SAML 2.0' })
        setSaml(defaultSaml)
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-base font-semibold text-gray-800">Enterprise Connection Onboarding</h2>
        <p className="text-sm text-gray-500 mt-1">
          Create OIDC or SAML 2.0 enterprise connections via the Auth0 Management API.
        </p>
      </div>

      {/* Success banner */}
      {result && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-green-600 text-lg leading-none mt-0.5">✓</span>
          <div>
            <p className="text-green-800 font-semibold text-sm">{result.label} connection created successfully</p>
            <p className="text-green-700 text-xs mt-1">
              <span className="font-medium">{result.name}</span>
              <span className="mx-2 text-green-400">•</span>
              Connection ID: <span className="font-mono">{result.id}</span>
            </p>
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-red-500 text-lg leading-none mt-0.5">⚠</span>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Strategy tabs */}
      <div className="flex border-b border-gray-200 mb-8">
        {(['oidc', 'samlp'] as Strategy[]).map((s) => (
          <button
            key={s}
            onClick={() => { setStrategy(s); resetFeedback() }}
            className={`px-6 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              strategy === s
                ? 'border-portal-blue text-portal-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {s === 'oidc' ? 'OIDC' : 'SAML 2.0'}
          </button>
        ))}
      </div>

      {/* OIDC Form */}
      {strategy === 'oidc' && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div>
            <h3 className="text-base font-semibold text-gray-800">OpenID Connect (OIDC)</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Uses auto-discovery. The IdP must expose a{' '}
              <code className="font-mono text-gray-600">.well-known/openid-configuration</code> endpoint.
            </p>
          </div>

          <Field
            label="Connection Name"
            required
            hint="Alphanumeric and hyphens only, e.g. okta-prod. Must be unique in your Auth0 tenant."
          >
            <input
              type="text"
              value={oidc.name}
              onChange={(e) => setOidc((p) => ({ ...p, name: e.target.value }))}
              placeholder="okta-prod"
              className={inputCls}
            />
          </Field>

          <Field
            label="Discovery URL"
            required
            hint="The IdP's OpenID Connect well-known configuration URL."
          >
            <input
              type="url"
              value={oidc.discoveryUrl}
              onChange={(e) => setOidc((p) => ({ ...p, discoveryUrl: e.target.value }))}
              placeholder="https://dev-xxxxxx.okta.com/.well-known/openid-configuration"
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Client ID" required>
              <input
                type="text"
                value={oidc.clientId}
                onChange={(e) => setOidc((p) => ({ ...p, clientId: e.target.value }))}
                placeholder="0oabcdef1234..."
                className={inputCls}
              />
            </Field>
            <Field label="Client Secret" required>
              <input
                type="password"
                value={oidc.clientSecret}
                onChange={(e) => setOidc((p) => ({ ...p, clientSecret: e.target.value }))}
                placeholder="••••••••••••••"
                className={inputCls}
              />
            </Field>
          </div>

          <Field
            label="Scope"
            hint="Space-separated OAuth 2.0 scopes to request from the IdP."
          >
            <input
              type="text"
              value={oidc.scope}
              onChange={(e) => setOidc((p) => ({ ...p, scope: e.target.value }))}
              placeholder="openid profile email"
              className={inputCls}
            />
          </Field>

          <div className="pt-2">
            <button
              onClick={submitOidc}
              disabled={submitting}
              className="bg-portal-blue text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-portal-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating…' : 'Create OIDC Connection →'}
            </button>
          </div>
        </div>
      )}

      {/* SAML Form */}
      {strategy === 'samlp' && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div>
            <h3 className="text-base font-semibold text-gray-800">SAML 2.0</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Connect via SAML 2.0 protocol. Requires the IdP sign-in URL and X.509 signing certificate.
            </p>
          </div>

          <Field
            label="Connection Name"
            required
            hint="Alphanumeric and hyphens only, e.g. azure-ad-saml. Must be unique in your Auth0 tenant."
          >
            <input
              type="text"
              value={saml.name}
              onChange={(e) => setSaml((p) => ({ ...p, name: e.target.value }))}
              placeholder="azure-ad-saml"
              className={inputCls}
            />
          </Field>

          <Field
            label="IdP Sign-In URL"
            required
            hint="The SAML SSO endpoint where Auth0 sends authentication requests."
          >
            <input
              type="url"
              value={saml.signInEndpoint}
              onChange={(e) => setSaml((p) => ({ ...p, signInEndpoint: e.target.value }))}
              placeholder="https://login.microsoftonline.com/<tenant-id>/saml2"
              className={inputCls}
            />
          </Field>

          <Field
            label="X.509 Signing Certificate"
            required
            hint="Paste the IdP's PEM certificate. Headers (-----BEGIN CERTIFICATE-----) are stripped automatically."
          >
            <textarea
              value={saml.signingCert}
              onChange={(e) => setSaml((p) => ({ ...p, signingCert: e.target.value }))}
              rows={6}
              placeholder={"-----BEGIN CERTIFICATE-----\nMIIC4jCCAcqgAwIBAgIQXttx...\n-----END CERTIFICATE-----"}
              className={`${inputCls} resize-y font-mono text-xs leading-relaxed`}
            />
          </Field>

          <Field
            label="IdP Sign-Out URL"
            hint="Optional. The SAML SLO endpoint for single logout."
          >
            <input
              type="url"
              value={saml.signOutEndpoint}
              onChange={(e) => setSaml((p) => ({ ...p, signOutEndpoint: e.target.value }))}
              placeholder="https://login.microsoftonline.com/<tenant-id>/saml2 (optional)"
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Digest Algorithm">
              <select
                value={saml.digestAlgorithm}
                onChange={(e) =>
                  setSaml((p) => ({ ...p, digestAlgorithm: e.target.value as 'sha1' | 'sha256' }))
                }
                className={inputCls}
              >
                <option value="sha256">SHA-256 (recommended)</option>
                <option value="sha1">SHA-1</option>
              </select>
            </Field>
            <Field label="Signature Algorithm">
              <select
                value={saml.signatureAlgorithm}
                onChange={(e) =>
                  setSaml((p) => ({
                    ...p,
                    signatureAlgorithm: e.target.value as 'rsa-sha1' | 'rsa-sha256',
                  }))
                }
                className={inputCls}
              >
                <option value="rsa-sha256">RSA-SHA256 (recommended)</option>
                <option value="rsa-sha1">RSA-SHA1</option>
              </select>
            </Field>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={saml.signSAMLRequest}
              onChange={(e) => setSaml((p) => ({ ...p, signSAMLRequest: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-300 text-portal-blue focus:ring-portal-blue"
            />
            <span className="text-sm text-gray-700 select-none">Sign SAML authentication requests</span>
          </label>

          <div className="pt-2">
            <button
              onClick={submitSaml}
              disabled={submitting}
              className="bg-portal-blue text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-portal-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating…' : 'Create SAML Connection →'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Support Tab ──────────────────────────────────────────────────────────────

const ticketStatusColors: Record<Ticket['status'], string> = {
  Open: 'bg-yellow-100 text-yellow-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  Resolved: 'bg-green-100 text-green-700',
  Closed: 'bg-gray-100 text-gray-500',
}

const ticketPriorityColors: Record<Ticket['priority'], string> = {
  Low: 'text-gray-400',
  Medium: 'text-yellow-500',
  High: 'text-orange-500',
  Critical: 'text-red-600',
}

function SupportTab() {
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    subject: '',
    category: '',
    priority: 'Medium',
    description: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setShowForm(false)
    setForm({ subject: '', category: '', priority: 'Medium', description: '' })
    setTimeout(() => setSubmitted(false), 6000)
  }

  const openCount = mockTickets.filter((t) => t.status === 'Open' || t.status === 'In Progress').length

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Support Tickets</h2>
          <p className="text-gray-500 text-sm mt-1">
            {openCount} open ticket{openCount !== 1 ? 's' : ''} — submit issues, disputes, or questions.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-portal-blue text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-portal-dark transition-colors"
        >
          + Open New Ticket
        </button>
      </div>

      {submitted && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <span className="text-green-600 text-xl">✓</span>
          <div>
            <p className="text-green-800 font-medium">Ticket submitted successfully!</p>
            <p className="text-green-600 text-sm">Our support team will respond within 1–2 business days. You&apos;ll receive email updates.</p>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-7 mb-8">
          <h3 className="text-base font-semibold text-gray-900 mb-5">Open a Support Ticket</h3>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
              <input
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Brief description of the issue"
                className={inputCls}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  required
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className={inputCls}
                >
                  <option value="">Select category</option>
                  <option>Inventory</option>
                  <option>Invoice</option>
                  <option>Payment</option>
                  <option>Account</option>
                  <option>Technical</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className={inputCls}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Provide as much detail as possible — include relevant SKUs, invoice numbers, or error messages."
                className={`${inputCls} resize-y`}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-portal-blue text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-portal-dark transition-colors"
              >
                Submit Ticket
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="border border-gray-300 text-gray-600 px-6 py-2.5 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <h3 className="text-base font-semibold text-gray-700 mb-4">My Tickets</h3>
      <div className="space-y-3">
        {mockTickets.map((ticket) => (
          <div key={ticket.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-gray-400">{ticket.ticketNumber}</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs text-gray-500">{ticket.category}</span>
                  <span className="text-gray-300">•</span>
                  <span className={`text-xs font-medium ${ticketPriorityColors[ticket.priority]}`}>
                    {ticket.priority} Priority
                  </span>
                </div>
                <p className="font-medium text-gray-900 text-sm">{ticket.subject}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Opened {ticket.createdDate} &bull; Last updated {ticket.lastUpdated}
                </p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${ticketStatusColors[ticket.status]}`}>
                {ticket.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Methods Tab ──────────────────────────────────────────────────────────────

interface AuthMethod {
  id: string
  type: string
  created_at?: string
  name?: string
  phone_number?: string
  email?: string
  authenticator_attachment?: string
  credential_backed_up?: boolean
}

interface EnrollStart {
  auth_session: string
  authn_params_public_key: {
    rp: { id: string; name: string }
    user: { id: string; name: string; displayName: string }
    challenge: string
    pubKeyCredParams: Array<{ type: string; alg: number }>
    timeout?: number
    excludeCredentials?: Array<{ type: string; id: string; transports?: string[] }>
    authenticatorSelection?: Record<string, unknown>
    attestation?: string
  }
}

interface LoginChallenge {
  auth_session: string
  authn_params_public_key: {
    rpId: string
    challenge: string
    allowCredentials?: Array<{ type: string; id: string; transports?: string[] }>
    userVerification?: string
    timeout?: number
  }
}

interface LoginResult {
  access_token?: string
  id_token?: string
  token_type?: string
  expires_in?: number
}

function b64urlToBuffer(b64url: string): ArrayBuffer {
  const bin = atob(b64url.replace(/-/g, '+').replace(/_/g, '/'))
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes.buffer
}

function bufferToB64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

const methodTypeLabel: Record<string, string> = {
  passkey: 'Passkey',
  totp: 'Authenticator App (TOTP)',
  phone: 'SMS / Phone',
  email: 'Email OTP',
  guardian: 'Auth0 Guardian',
  webauthn_roaming: 'Security Key',
  webauthn_platform: 'Platform Authenticator',
  'recovery-code': 'Recovery Code',
}

const methodTypeBadge: Record<string, string> = {
  passkey: 'bg-blue-100 text-blue-700',
  totp: 'bg-purple-100 text-purple-700',
  phone: 'bg-green-100 text-green-700',
  email: 'bg-yellow-100 text-yellow-700',
  guardian: 'bg-indigo-100 text-indigo-700',
  webauthn_roaming: 'bg-teal-100 text-teal-700',
  webauthn_platform: 'bg-cyan-100 text-cyan-700',
  'recovery-code': 'bg-gray-100 text-gray-600',
}

function MethodsTab() {
  const [methods, setMethods] = useState<AuthMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [loggingIn, setLoggingIn] = useState(false)
  const [loginResult, setLoginResult] = useState<LoginResult | null>(null)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const flash = (msg: string) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 5000)
  }

  async function loadMethods() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/methods')
      const data = await res.json()
      if (!res.ok) {
        setError((data as { error?: string }).error ?? 'Failed to load methods.')
      } else {
        setMethods((data as { methods?: AuthMethod[] }).methods ?? [])
      }
    } catch {
      setError('Network error. Could not load methods.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMethods()
  }, [])

  async function handleEnroll() {
    setError('')
    setEnrolling(true)
    try {
      // Step 1 — start enrollment, get WebAuthn creation options
      const startRes = await fetch('/api/methods/passkey/enroll', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      const startData = await startRes.json()
      if (!startRes.ok) {
        setError((startData as { error?: string }).error ?? 'Failed to start passkey enrollment.')
        return
      }
      const { auth_session, authn_params_public_key } = startData as EnrollStart

      // Step 2 — decode binary fields from Base64URL → ArrayBuffer
      const pk = authn_params_public_key
      const creationOptions: PublicKeyCredentialCreationOptions = {
        rp: pk.rp,
        user: {
          id: b64urlToBuffer(pk.user.id),
          name: pk.user.name,
          displayName: pk.user.displayName,
        },
        challenge: b64urlToBuffer(pk.challenge),
        pubKeyCredParams: pk.pubKeyCredParams as PublicKeyCredentialParameters[],
        timeout: pk.timeout,
        excludeCredentials: pk.excludeCredentials?.map((c) => ({
          type: c.type as PublicKeyCredentialType,
          id: b64urlToBuffer(c.id),
          transports: c.transports as AuthenticatorTransport[],
        })),
        authenticatorSelection: pk.authenticatorSelection as AuthenticatorSelectionCriteria,
        attestation: pk.attestation as AttestationConveyancePreference,
      }

      // Step 3 — browser WebAuthn ceremony
      const credential = await navigator.credentials.create({ publicKey: creationOptions }) as PublicKeyCredential | null
      if (!credential) {
        setError('Passkey creation was cancelled or failed.')
        return
      }

      const response = credential.response as AuthenticatorAttestationResponse
      const authn_response = {
        id: credential.id,
        rawId: bufferToB64url(credential.rawId),
        type: credential.type,
        response: {
          clientDataJSON: bufferToB64url(response.clientDataJSON),
          attestationObject: bufferToB64url(response.attestationObject),
          transports: response.getTransports?.() ?? [],
        },
      }

      // Step 4 — send attestation to verify endpoint
      const verifyRes = await fetch('/api/methods/passkey/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auth_session, authn_response }),
      })
      const verifyData = await verifyRes.json()
      if (!verifyRes.ok) {
        setError((verifyData as { error?: string }).error ?? 'Passkey verification failed.')
        return
      }

      flash('Passkey enrolled successfully.')
      await loadMethods()
    } catch (err) {
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          setError('Passkey creation was cancelled.')
        } else if (err.name === 'InvalidStateError') {
          setError('A passkey for this account already exists on this device.')
        } else {
          setError(`WebAuthn error: ${err.message}`)
        }
      } else {
        setError('Unexpected error during passkey enrollment.')
      }
    } finally {
      setEnrolling(false)
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    setError('')
    try {
      const res = await fetch('/api/methods', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.status === 204) {
        setMethods((prev) => prev.filter((m) => m.id !== id))
        flash('Authentication method removed.')
      } else {
        const data = await res.json().catch(() => ({}))
        setError((data as { error?: string }).error ?? 'Failed to delete method.')
      }
    } catch {
      setError('Network error. Could not delete method.')
    } finally {
      setDeletingId(null)
    }
  }

  async function handleLogin() {
    setLoggingIn(true)
    setLoginResult(null)
    setError('')
    try {
      // Step 1 — get authentication challenge
      const challengeRes = await fetch('/api/methods/passkey/login')
      const challengeData = await challengeRes.json()
      if (!challengeRes.ok) {
        setError((challengeData as { error?: string }).error ?? 'Failed to get passkey challenge.')
        return
      }
      const { auth_session, authn_params_public_key } = challengeData as LoginChallenge

      // Step 2 — decode challenge and build assertion options
      const pk = authn_params_public_key
      const assertionOptions: PublicKeyCredentialRequestOptions = {
        rpId: pk.rpId,
        challenge: b64urlToBuffer(pk.challenge),
        allowCredentials: pk.allowCredentials?.map((c) => ({
          type: c.type as PublicKeyCredentialType,
          id: b64urlToBuffer(c.id),
          transports: c.transports as AuthenticatorTransport[],
        })),
        userVerification: (pk.userVerification ?? 'required') as UserVerificationRequirement,
        timeout: pk.timeout,
      }

      // Step 3 — browser WebAuthn assertion ceremony
      const credential = await navigator.credentials.get({ publicKey: assertionOptions }) as PublicKeyCredential | null
      if (!credential) {
        setError('Passkey authentication was cancelled or failed.')
        return
      }

      const assertionResponse = credential.response as AuthenticatorAssertionResponse
      const authn_response = {
        id: credential.id,
        rawId: bufferToB64url(credential.rawId),
        type: credential.type,
        response: {
          clientDataJSON: bufferToB64url(assertionResponse.clientDataJSON),
          authenticatorData: bufferToB64url(assertionResponse.authenticatorData),
          signature: bufferToB64url(assertionResponse.signature),
          userHandle: assertionResponse.userHandle ? bufferToB64url(assertionResponse.userHandle) : null,
        },
      }

      // Step 4 — exchange assertion for tokens
      const tokenRes = await fetch('/api/methods/passkey/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auth_session, authn_response }),
      })
      const tokenData = await tokenRes.json()
      if (!tokenRes.ok) {
        setError((tokenData as { error?: string }).error ?? 'Passkey authentication failed.')
        return
      }

      setLoginResult(tokenData as LoginResult)
      flash('Passkey login successful — tokens received.')
    } catch (err) {
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          setError('Passkey authentication was cancelled.')
        } else {
          setError(`WebAuthn error: ${err.message}`)
        }
      } else {
        setError('Unexpected error during passkey login.')
      }
    } finally {
      setLoggingIn(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Authentication Methods</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage your enrolled authenticators via the Auth0 My Account API.
          </p>
        </div>
        <button
          onClick={handleEnroll}
          disabled={enrolling}
          className="bg-portal-blue text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-portal-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {enrolling ? 'Enrolling…' : '+ Enroll Passkey'}
        </button>
      </div>

      {/* Setup note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-700 space-y-2">
        <p className="font-semibold">Setup required</p>
        <p>
          Set <code className="font-mono text-xs bg-blue-100 px-1 py-0.5 rounded">AUTH0_MANAGEMENT_DOMAIN=your-tenant.us.auth0.com</code> in{' '}
          <code className="font-mono text-xs bg-blue-100 px-1 py-0.5 rounded">.env.local</code>.
          This must be the <strong>native Auth0 tenant domain</strong> — not a custom domain —
          because the My Account API (<code className="font-mono text-xs bg-blue-100 px-1 py-0.5 rounded">/me/v1/</code>) is not routed through custom domains.
        </p>
        <p>
          Also set <code className="font-mono text-xs bg-blue-100 px-1 py-0.5 rounded">A0_MYACCOUNT_API_AUDIENCE=https://your-tenant.us.auth0.com/me</code> and
          enable <strong>Auth0 My Account</strong> in your tenant&apos;s Advanced Settings.
        </p>
        <p className="text-blue-600">
          Passkey enrollment requires a <strong>database connection account</strong> (sub: <code className="font-mono text-xs bg-blue-100 px-1 py-0.5 rounded">auth0|…</code>).
          Social logins (Google, etc.) must link a database identity first.
        </p>
      </div>

      {/* Success banner */}
      {successMsg && (
        <div className="mb-5 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 text-sm text-green-800">
          <span className="text-green-600">✓</span>
          {successMsg}
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-sm text-red-700">
          <span className="mt-0.5">⚠</span>
          <span>{error}</span>
        </div>
      )}

      {/* Methods list */}
      {loading ? (
        <p className="text-sm text-gray-400">Loading methods…</p>
      ) : methods.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 text-center text-gray-400">
          <p className="text-sm">No authentication methods enrolled.</p>
          <p className="text-xs mt-1">Click <strong>+ Enroll Passkey</strong> to add one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {methods.map((m) => (
            <div key={m.id} className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${methodTypeBadge[m.type] ?? 'bg-gray-100 text-gray-600'}`}>
                    {methodTypeLabel[m.type] ?? m.type}
                  </span>
                  {m.credential_backed_up && (
                    <span className="text-xs text-green-600 font-medium">Synced</span>
                  )}
                </div>
                {m.name && <p className="text-sm font-medium text-gray-800">{m.name}</p>}
                {m.phone_number && <p className="text-sm text-gray-600">{m.phone_number}</p>}
                {m.email && <p className="text-sm text-gray-600">{m.email}</p>}
                <div className="flex items-center gap-3 mt-1">
                  <p className="font-mono text-xs text-gray-400 truncate">{m.id}</p>
                  {m.authenticator_attachment && (
                    <span className="text-xs text-gray-400">· {m.authenticator_attachment}</span>
                  )}
                </div>
                {m.created_at && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Enrolled {new Date(m.created_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleDelete(m.id)}
                disabled={deletingId === m.id}
                className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {deletingId === m.id ? 'Removing…' : 'Remove'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Passkey Login ─────────────────────────────────────────────────── */}
      <div className="mt-10 border-t border-gray-200 pt-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-base font-semibold text-gray-800">Passkey Login</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Demonstrate the passkey authentication flow — challenge, assertion, and token exchange.
            </p>
          </div>
          <button
            onClick={handleLogin}
            disabled={loggingIn}
            className="bg-gray-900 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loggingIn ? 'Authenticating…' : 'Login with Passkey'}
          </button>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-500 mb-4 space-y-1">
          <p><span className="font-semibold text-gray-700">Step 1</span> — GET <code className="font-mono bg-gray-100 px-1 rounded">/api/methods/passkey/login</code> → Auth0 <code className="font-mono bg-gray-100 px-1 rounded">/co/authenticate</code> returns challenge</p>
          <p><span className="font-semibold text-gray-700">Step 2</span> — Browser runs <code className="font-mono bg-gray-100 px-1 rounded">navigator.credentials.get()</code> WebAuthn assertion</p>
          <p><span className="font-semibold text-gray-700">Step 3</span> — POST <code className="font-mono bg-gray-100 px-1 rounded">/api/methods/passkey/login</code> → Auth0 <code className="font-mono bg-gray-100 px-1 rounded">/oauth/token</code> returns tokens</p>
        </div>

        {loginResult && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
            <p className="text-sm font-semibold text-gray-700 mb-2">Login Result</p>
            {loginResult.token_type && (
              <p className="text-xs text-gray-500">
                <span className="font-medium text-gray-700">token_type:</span>{' '}
                <span className="font-mono">{loginResult.token_type}</span>
                {loginResult.expires_in && (
                  <span className="ml-3 font-medium text-gray-700">expires_in:</span>
                )}
                {loginResult.expires_in && (
                  <span className="font-mono ml-1">{loginResult.expires_in}s</span>
                )}
              </p>
            )}
            {loginResult.access_token && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Access Token</p>
                <pre className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-xs font-mono text-gray-700 overflow-x-auto whitespace-pre-wrap break-all">
                  {loginResult.access_token}
                </pre>
              </div>
            )}
            {loginResult.id_token && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">ID Token</p>
                <pre className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-xs font-mono text-gray-700 overflow-x-auto whitespace-pre-wrap break-all">
                  {loginResult.id_token}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<ProfileTab>('tokens')

  const tabs: { id: ProfileTab; label: string }[] = [
    { id: 'tokens', label: 'Profile & Tokens' },
    { id: 'connections', label: 'Enterprise Connections' },
    { id: 'support', label: 'Support' },
    { id: 'methods', label: 'Methods' },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1 text-sm">
          View your session tokens, manage enterprise connections, track support tickets, and enroll authentication methods.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-gray-200 mb-8">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-6 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              activeTab === t.id
                ? 'border-portal-blue text-portal-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'tokens' && <TokensTab />}
      {activeTab === 'connections' && <ConnectionsTab />}
      {activeTab === 'support' && <SupportTab />}
      {activeTab === 'methods' && <MethodsTab />}
    </div>
  )
}
