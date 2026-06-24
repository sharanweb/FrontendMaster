import { useEffect, useRef, useState } from 'react'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'

hljs.registerLanguage('javascript', javascript)

export default function CodeBlock({ code, language = 'javascript' }) {
  const ref = useRef(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (ref.current) {
      ref.current.removeAttribute('data-highlighted')
      hljs.highlightElement(ref.current)
    }
  }, [code])

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="code-editor">
      <div className="code-editor-titlebar">
        <div className="traffic-lights">
          <span className="tl tl-red" />
          <span className="tl tl-yellow" />
          <span className="tl tl-green" />
        </div>
        <span className="code-editor-lang">JavaScript</span>
        <button className="copy-btn" onClick={handleCopy}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <div className="code-editor-body">
        <div className="line-numbers" aria-hidden="true">
          {code.split('\n').map((_, i) => (
            <span key={i}>{i + 1}</span>
          ))}
        </div>
        <pre className="code-pre">
          <code ref={ref} className={`language-${language}`}>
            {code}
          </code>
        </pre>
      </div>
    </div>
  )
}
