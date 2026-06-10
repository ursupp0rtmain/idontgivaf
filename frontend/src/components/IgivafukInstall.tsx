import { useState } from 'react'

const NPM_CMD = 'npm create igivafuk@latest my-app'
const COPY_TEXT = 'idontgivaf? igiveafuck. Structure over slop. npm create igivafuk@latest'

export default function IgivafukInstall() {
  const [copied, setCopied] = useState(false)

  function copyPitch() {
    navigator.clipboard.writeText(COPY_TEXT).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="igivafuk-bar">
      <a
        className="igiveafuck-link"
        href="https://github.com/ursupp0rtmain/igivafuk"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Guided agent setup for people who actually give a fuck"
        title="guided agent setup — for when your ai slop needs guardrails"
      >
        igiveafuck →
      </a>

      <div className="igivafuk-install">
        <code className="igivafuk-cmd">{NPM_CMD}</code>
        <div className="igivafuk-install-actions">
          <a
            className="igivafuk-install-link"
            href="https://www.npmjs.com/package/create-igivafuk"
            target="_blank"
            rel="noopener noreferrer"
          >
            npm
          </a>
          <span className="igivafuk-install-sep">·</span>
          <a
            className="igivafuk-install-link"
            href="https://github.com/ursupp0rtmain/igivafuk"
            target="_blank"
            rel="noopener noreferrer"
          >
            github
          </a>
          <span className="igivafuk-install-sep">·</span>
          <button
            className="igivafuk-install-copy"
            onClick={copyPitch}
            aria-label="Copy pitch text"
            title={COPY_TEXT}
          >
            {copied ? '✓ copied' : 'copy'}
          </button>
        </div>
      </div>
    </div>
  )
}
