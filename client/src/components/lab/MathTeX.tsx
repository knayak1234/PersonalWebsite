import { useEffect, useRef, useState } from "react";

/**
 * MathTeX — renders a LaTeX string using KaTeX, which is loaded from CDN in
 * index.html (so we add no npm dependency). Because the CDN script is `defer`,
 * KaTeX may not be present on first paint; we poll briefly until it is ready.
 *
 * Usage:
 *   <MathTeX tex="\\int_a^b f(x)\\,dx" />          // inline
 *   <MathTeX tex="E = mc^2" block />               // display / centered
 */

declare global {
  interface Window {
    katex?: {
      render: (tex: string, el: HTMLElement, opts?: Record<string, unknown>) => void;
      renderToString: (tex: string, opts?: Record<string, unknown>) => string;
    };
  }
}

interface MathTeXProps {
  tex: string;
  block?: boolean;
  className?: string;
}

export default function MathTeX({ tex, block = false, className = "" }: MathTeXProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [ready, setReady] = useState<boolean>(typeof window !== "undefined" && !!window.katex);

  useEffect(() => {
    if (ready) return;
    let tries = 0;
    const id = window.setInterval(() => {
      tries += 1;
      if (window.katex) {
        setReady(true);
        window.clearInterval(id);
      } else if (tries > 50) {
        window.clearInterval(id); // give up after ~5s, show raw tex fallback
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [ready]);

  useEffect(() => {
    if (ready && ref.current && window.katex) {
      try {
        window.katex.render(tex, ref.current, {
          throwOnError: false,
          displayMode: block,
        });
      } catch {
        if (ref.current) ref.current.textContent = tex;
      }
    }
  }, [tex, block, ready]);

  return (
    <span
      ref={ref}
      className={`${block ? "block my-3 overflow-x-auto text-center" : "inline"} ${className}`}
      aria-label={tex}
    >
      {!ready && <span className="text-muted-foreground">{tex}</span>}
    </span>
  );
}
