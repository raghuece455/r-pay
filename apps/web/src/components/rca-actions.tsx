"use client";

import { useMemo, useState } from "react";
import { Clipboard, Download } from "lucide-react";

export function RcaActions({ body }: { body?: string | null }) {
  const [copied, setCopied] = useState(false);
  const content = body ?? "No RCA draft yet. Generate it after mitigation evidence is captured.";
  const downloadHref = useMemo(() => `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`, [content]);

  async function copyDraft() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button type="button" className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-bold text-zinc-200 hover:bg-white/10" onClick={copyDraft}>
        <Clipboard size={14} aria-hidden />
        {copied ? "Copied" : "Copy"}
      </button>
      <a className="inline-flex items-center gap-1 rounded-lg bg-aqua px-3 py-1.5 text-xs font-bold text-slate-950" href={downloadHref} download="rpay-incident-rca.txt">
        <Download size={14} aria-hidden />
        Download
      </a>
    </div>
  );
}
