"use client"

import { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import rehypeHighlight from "rehype-highlight"
import "katex/dist/katex.min.css"

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
}

export function MarkdownEditor({ value, onChange, placeholder, minHeight = "200px" }: MarkdownEditorProps) {
  const [mode, setMode] = useState<"edit" | "preview" | "split">("edit")

  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-1">
          <ToolbarButton onClick={() => insertText(onChange, value, "**", "**")} title="Bold">B</ToolbarButton>
          <ToolbarButton onClick={() => insertText(onChange, value, "_", "_")} title="Italic" className="italic">I</ToolbarButton>
          <ToolbarButton onClick={() => insertText(onChange, value, "`", "`")} title="Code" className="font-mono text-xs">{"<>"}</ToolbarButton>
          <ToolbarButton onClick={() => insertText(onChange, value, "$", "$")} title="Inline math" className="font-serif">∑</ToolbarButton>
          <ToolbarButton onClick={() => insertText(onChange, value, "\n$$\n", "\n$$")} title="Display math" className="font-serif text-xs">∫dx</ToolbarButton>
        </div>
        <div className="flex items-center rounded-md bg-white border border-slate-200 p-0.5 gap-0.5">
          {(["edit", "split", "preview"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-2 py-0.5 text-[10px] font-medium rounded transition-colors capitalize ${mode === m ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-700"}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Editor / Preview */}
      <div className={`flex ${mode === "split" ? "divide-x divide-slate-200" : ""}`}>
        {(mode === "edit" || mode === "split") && (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder ?? "Write using Markdown. Use $formula$ for inline math, $$...$$  for display math."}
            className="flex-1 resize-none p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-mono leading-relaxed bg-white"
            style={{ minHeight }}
          />
        )}
        {(mode === "preview" || mode === "split") && (
          <div
            className="flex-1 p-3 overflow-auto prose prose-sm prose-slate max-w-none"
            style={{ minHeight }}
          >
            {value ? (
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex, rehypeHighlight]}
              >
                {value}
              </ReactMarkdown>
            ) : (
              <p className="text-slate-400 text-sm">Preview will appear here...</p>
            )}
          </div>
        )}
      </div>

      <div className="px-3 py-1 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-400 flex gap-3">
        <span>**bold** _italic_ `code`</span>
        <span>$E=mc^2$ inline math</span>
        <span>$$...$$  display math</span>
        <span>```python code block</span>
      </div>
    </div>
  )
}

function ToolbarButton({ onClick, children, title, className }: {
  onClick: () => void
  children: React.ReactNode
  title: string
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`h-6 w-6 flex items-center justify-center rounded text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors ${className ?? ""}`}
    >
      {children}
    </button>
  )
}

function insertText(onChange: (v: string) => void, current: string, before: string, after: string) {
  onChange(current + before + "placeholder" + after)
}

export function MarkdownPreview({ content }: { content: string }) {
  if (!content) return null
  return (
    <div className="prose prose-sm prose-slate max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
