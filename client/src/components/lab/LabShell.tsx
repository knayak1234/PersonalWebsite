import { Link } from "wouter";
import { ChevronRight, FlaskConical, Home } from "lucide-react";

/**
 * LabShell — shared page chrome (top bar + breadcrumb + footer) for every page
 * in the Computer Programming Laboratory. Keeps the lab visually consistent with
 * the main site while giving it its own lightweight navigation.
 */
export default function LabShell({
  children,
  crumb,
}: {
  children: React.ReactNode;
  crumb?: string;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-border bg-gradient-to-r from-white/95 via-blue-50/95 to-white/95 dark:from-background/95 dark:via-background/95 dark:to-background/95 backdrop-blur-md shadow-sm no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link
            href="/teaching/computer-programming"
            className="flex items-center gap-2 group"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow group-hover:scale-105 transition-transform">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <div className="font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                Computational Physics Lab
              </div>
              <div className="text-[11px] text-muted-foreground">MSc Numerical Methods Portal</div>
            </div>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <a
              href="/#teaching"
              className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors flex items-center gap-1"
            >
              <Home className="w-4 h-4" /> <span className="hidden sm:inline">Main Site</span>
            </a>
            <Link
              href="/teaching/computer-programming"
              className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
            >
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 no-print">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
          <a href="/#teaching" className="hover:text-primary">Teaching</a>
          <ChevronRight className="w-3 h-3" />
          <Link href="/teaching/computer-programming" className="hover:text-primary">
            Computer Programming
          </Link>
          {crumb && (
            <>
              <ChevronRight className="w-3 h-3" />
              <span className="text-foreground font-medium">{crumb}</span>
            </>
          )}
        </div>
      </div>

      <main>{children}</main>

      <footer className="border-t border-border mt-16 py-8 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-muted-foreground">
          <p className="mb-1">
            MSc Physics Computer Programming Laboratory · Interactive Numerical Methods &amp;
            Computational Physics Learning Portal
          </p>
          <p>
            Part of{" "}
            <a href="/" className="text-primary hover:underline">
              Dr. Kishora Nayak's
            </a>{" "}
            teaching resources · Built for educational use
          </p>
        </div>
      </footer>
    </div>
  );
}
