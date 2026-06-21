import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy, Download } from "lucide-react";

/**
 * CodeBlock — displays source code (default language C) with:
 *   - highlight.js syntax highlighting (loaded from CDN in index.html)
 *   - a Copy-to-clipboard button
 *   - a Download button that saves a real file
 */

declare global {
  interface Window {
    hljs?: {
      highlightElement: (el: HTMLElement) => void;
      highlightAll: () => void;
    };
  }
}

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

export default function CodeBlock({ code, language = "c", filename = "program.c" }: CodeBlockProps) {
  const codeRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let tries = 0;
    const tryHighlight = () => {
      if (window.hljs && codeRef.current) {
        // reset so re-highlighting works on content change
        codeRef.current.removeAttribute("data-highlighted");
        codeRef.current.className = `language-${language}`;
        window.hljs.highlightElement(codeRef.current);
        return true;
      }
      return false;
    };
    if (!tryHighlight()) {
      const id = window.setInterval(() => {
        tries += 1;
        if (tryHighlight() || tries > 50) window.clearInterval(id);
      }, 100);
      return () => window.clearInterval(id);
    }
  }, [code, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-xl overflow-hidden border border-border shadow-sm bg-[#282c34]">
      <div className="flex items-center justify-between px-4 py-2 bg-black/30 border-b border-white/10">
        <span className="text-xs font-mono text-gray-300 tracking-wide">{filename}</span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            className="h-7 px-2 text-gray-300 hover:text-white hover:bg-white/10"
          >
            {copied ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDownload}
            className="h-7 px-2 text-gray-300 hover:text-white hover:bg-white/10"
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            Download
          </Button>
        </div>
      </div>
      <pre className="overflow-x-auto m-0 p-4 text-sm leading-relaxed">
        <code ref={codeRef} className={`language-${language}`}>
          {code}
        </code>
      </pre>
    </div>
  );
}
