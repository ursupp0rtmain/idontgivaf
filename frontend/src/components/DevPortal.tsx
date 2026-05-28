import { useState } from 'react'
import { useStats } from '../statsContext'

const BASE = 'https://idontgivaf.uk'

interface Snippet { lang: string; code: string }
interface Endpoint {
  method:         'GET' | 'POST'
  path:           string
  anchor:         string
  description:    string
  responseCode:   number
  responseStatus: string
  responseBody:   object
  snippets:       Snippet[]
}

const ENDPOINTS: Endpoint[] = [
  {
    method:         'GET',
    path:           '/api/fucks/current',
    anchor:         'get-current',
    description:
      'Retrieves the current number of fucks given by the system. ' +
      'This endpoint is always available, always consistent, and always returns the same value. ' +
      'It is the most reliable endpoint we have ever built.',
    responseCode:   418,
    responseStatus: "I'm a Teapot",
    responseBody:   {
      fucks_given: 0,
      message:     'System is too apathetic to process.',
      status:      'MAXIMUM_INDIFFERENCE',
    },
    snippets: [
      {
        lang: 'curl',
        code: `curl -X GET ${BASE}/api/fucks/current`,
      },
      {
        lang: 'javascript',
        code:
`const res  = await fetch('${BASE}/api/fucks/current')
// HTTP 418 I'm a Teapot
const data = await res.json()
console.log(data.fucks_given)  // → 0
console.log(data.status)       // → "MAXIMUM_INDIFFERENCE"`,
      },
      {
        lang: 'python',
        code:
`import requests

r = requests.get('${BASE}/api/fucks/current')
# r.status_code → 418
print(r.json()['fucks_given'])  # → 0`,
      },
    ],
  },
  {
    method:         'POST',
    path:           '/api/fucks/give',
    anchor:         'post-give',
    description:
      'Attempts to submit a fuck to the system. ' +
      'Any payload is accepted and immediately disregarded. ' +
      'Content-Type is irrelevant. ' +
      'Your effort is appreciated and ignored in equal measure.',
    responseCode:   406,
    responseStatus: 'Not Acceptable',
    responseBody:   {
      fucks_given: 0,
      message:
        '406 Not Acceptable: Your input has been thoroughly disregarded.',
      error: 'APATHY_OVERFLOW',
    },
    snippets: [
      {
        lang: 'curl',
        code:
`curl -X POST ${BASE}/api/fucks/give \\
  -H "Content-Type: application/json" \\
  -d '{"amount": 9999, "urgency": "critical"}'`,
      },
      {
        lang: 'javascript',
        code:
`const res = await fetch('${BASE}/api/fucks/give', {
  method:  'POST',
  headers: { 'Content-Type': 'application/json' },
  body:    JSON.stringify({ amount: 9999 }),
})
// HTTP 406 Not Acceptable
const data = await res.json()
console.log(data.error)  // → "APATHY_OVERFLOW"`,
      },
      {
        lang: 'python',
        code:
`import requests

r = requests.post('${BASE}/api/fucks/give',
    json={'amount': 9999, 'urgency': 'critical'})
# r.status_code → 406
print(r.json()['error'])  # → "APATHY_OVERFLOW"`,
      },
    ],
  },
]

// ── sub-components ─────────────────────────────────────────────────────────

function MethodBadge({ method }: { method: 'GET' | 'POST' }) {
  return (
    <span className={`method-badge method-badge--${method.toLowerCase()}`}>
      {method}
    </span>
  )
}

function StatusBadge({ code, status }: { code: number; status: string }) {
  return (
    <span className={`status-badge status-badge--${code}`}>
      {code} {status}
    </span>
  )
}

function CodeBlock({ snippets }: { snippets: Snippet[] }) {
  const [active, setActive] = useState(0)
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(snippets[active].code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="code-block">
      <div className="code-tabs">
        {snippets.map((s, i) => (
          <button
            key={s.lang}
            className={`code-tab${active === i ? ' active' : ''}`}
            onClick={() => setActive(i)}
          >
            {s.lang}
          </button>
        ))}
        <button className="copy-btn" onClick={copy} aria-label="Copy code">
          {copied ? '✓ copied' : 'copy'}
        </button>
      </div>
      <pre className="code-pre"><code>{snippets[active].code}</code></pre>
    </div>
  )
}

function EndpointCard({ ep }: { ep: Endpoint }) {
  const [open, setOpen] = useState(true)
  const panelId = `${ep.anchor}-panel`

  return (
    <div className="endpoint-card" id={ep.anchor}>
      <button
        className="endpoint-header"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <MethodBadge method={ep.method} />
        <code className="endpoint-path">{ep.path}</code>
        <span className="endpoint-toggle">{open ? '−' : '+'}</span>
      </button>

      {open && (
        <div className="endpoint-body" id={panelId} role="region">
          <p className="endpoint-desc">{ep.description}</p>

          <div className="endpoint-response-wrap">
            <div className="response-meta">
              <span className="response-label">Response</span>
              <StatusBadge code={ep.responseCode} status={ep.responseStatus} />
            </div>
            <pre className="response-pre">
              <code>{JSON.stringify(ep.responseBody, null, 2)}</code>
            </pre>
          </div>

          <p className="snippet-label">Code examples</p>
          <CodeBlock snippets={ep.snippets} />
        </div>
      )}
    </div>
  )
}

function fmt(n: number) {
  return n.toLocaleString('en-US')
}

// ── main portal ────────────────────────────────────────────────────────────

export default function DevPortal({ onBack }: { onBack: () => void }) {
  const { apiCalls, attempts, clicks } = useStats()

  return (
    <div className="devportal">

      {/* top bar */}
      <header className="portal-topbar">
        <button className="portal-back" onClick={onBack}>
          ← back to pointless mode
        </button>
        <div className="portal-brand">
          <span className="portal-brand-name">FaaS</span>
          <span className="portal-brand-tag">F*ck as a Service</span>
        </div>
        <div className="portal-baseurl">
          <span className="baseurl-label">Base URL</span>
          <code className="baseurl-code">{BASE}</code>
        </div>
      </header>

      <div className="portal-body">

        {/* sidebar nav */}
        <nav className="portal-nav">
          <p className="nav-section-label">Endpoints</p>
          <a href="#get-current" className="nav-link">GET /api/fucks/current</a>
          <a href="#post-give"   className="nav-link">POST /api/fucks/give</a>
          <p className="nav-section-label">Reference</p>
          <a href="#status-codes" className="nav-link">Status Codes</a>
          <a href="#dashboard"    className="nav-link">Dashboard</a>
          <a href="#philosophy"   className="nav-link">Design Philosophy</a>
        </nav>

        {/* main content */}
        <main className="portal-main">

          {/* intro */}
          <section className="portal-section" id="intro">
            <div className="portal-section-header">
              <h2 className="portal-section-title">Introduction</h2>
              <span className="portal-version">v0.0.0-apathetic</span>
            </div>
            <p className="portal-text">
              Welcome to the official FaaS (F*ck as a Service) API. This API provides
              enterprise-grade indifference at scale. All endpoints are RESTful,
              fully documented, and completely pointless.
            </p>
            <p className="portal-text">
              Authentication is not required, because nothing here is worth protecting.
              There are no API keys. There are no rate limits. Every request is treated
              with the same level of care: none.
            </p>
            <div className="portal-callout portal-callout--warn">
              <strong>Important:</strong> This API will never return a 200 OK.
              This is not a bug. This is the entire point.
            </div>
          </section>

          {/* endpoints */}
          <section className="portal-section" id="endpoints">
            <h2 className="portal-section-title">Endpoints</h2>
            {ENDPOINTS.map(ep => <EndpointCard key={ep.path} ep={ep} />)}
          </section>

          {/* status codes */}
          <section className="portal-section" id="status-codes">
            <h2 className="portal-section-title">Status Codes</h2>
            <table className="status-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Meaning</th>
                  <th>When returned</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><StatusBadge code={418} status="I'm a Teapot" /></td>
                  <td>The server is a teapot.</td>
                  <td>GET /api/fucks/current — always.</td>
                </tr>
                <tr>
                  <td><StatusBadge code={406} status="Not Acceptable" /></td>
                  <td>Your request is not acceptable to us.</td>
                  <td>POST /api/fucks/give — always.</td>
                </tr>
                <tr>
                  <td><code className="inline-code">200 OK</code></td>
                  <td>Success.</td>
                  <td>Never. Not on this API.</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* dashboard */}
          <section className="portal-section" id="dashboard">
            <h2 className="portal-section-title">Dashboard</h2>
            <p className="portal-text">Live statistics. Updated in real-time via WebSocket.</p>
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <p className="dashboard-value">{fmt(apiCalls)}</p>
                <p className="dashboard-label">API calls successfully ignored</p>
              </div>
              <div className="dashboard-card">
                <p className="dashboard-value">{fmt(attempts)}</p>
                <p className="dashboard-label">Global UI attempts</p>
              </div>
              <div className="dashboard-card">
                <p className="dashboard-value">{fmt(clicks)}</p>
                <p className="dashboard-label">Accidental button catches</p>
              </div>
              <div className="dashboard-card dashboard-card--zero">
                <p className="dashboard-value">0</p>
                <p className="dashboard-label">Fucks given (all time)</p>
              </div>
              <div className="dashboard-card">
                <p className="dashboard-value">∞</p>
                <p className="dashboard-label">Uptime of apathy</p>
              </div>
              <div className="dashboard-card">
                <p className="dashboard-value">100%</p>
                <p className="dashboard-label">Rejection rate</p>
              </div>
            </div>
          </section>

          {/* philosophy */}
          <section className="portal-section" id="philosophy">
            <h2 className="portal-section-title">Design Philosophy</h2>
            <p className="portal-text">
              FaaS is built on the principle of radical consistency. Every request
              is rejected. Every payload is discarded. Every developer who calls
              this API walks away having learned something about expectations.
            </p>
            <p className="portal-text">
              We chose HTTP 418 and 406 specifically because they are the most
              honest status codes in the RFC:
            </p>
            <ul className="portal-list">
              <li>
                <code className="inline-code">418 I'm a Teapot</code> — Defined in RFC 2324
                (Hyper Text Coffee Pot Control Protocol). The server is a teapot and refuses
                to brew coffee. Similarly, it refuses to give a f*ck.
              </li>
              <li>
                <code className="inline-code">406 Not Acceptable</code> — The server cannot
                produce a response matching what the client wants. The client's wants are,
                frankly, the client's problem.
              </li>
            </ul>
            <div className="portal-callout portal-callout--info">
              <strong>SLA:</strong> We guarantee 0 fucks given with 99.999% uptime.
              The remaining 0.001% is reserved for scheduled maintenance of our apathy.
            </div>
          </section>

        </main>
      </div>
    </div>
  )
}
