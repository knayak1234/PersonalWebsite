import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

/**
 * ResultsTable — a thin, scrollable wrapper over the shadcn table for showing
 * iteration / convergence data. Caps very long traces with a note.
 */
export default function ResultsTable<T extends Record<string, any>>({
  columns,
  rows,
  maxRows = 60,
  caption,
}: {
  columns: Column<T>[];
  rows: T[];
  maxRows?: number;
  caption?: string;
}) {
  const shown = rows.slice(0, maxRows);
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="max-h-[420px] overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-muted/95 backdrop-blur z-10">
            <TableRow>
              {columns.map((c) => (
                <TableHead key={String(c.key)} className={`text-xs font-semibold ${c.className ?? ""}`}>
                  {c.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {shown.map((row, i) => (
              <TableRow key={i} className="text-xs font-mono">
                {columns.map((c) => (
                  <TableCell key={String(c.key)} className={c.className}>
                    {c.render ? c.render(row) : String(row[c.key as keyof T])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {(caption || rows.length > maxRows) && (
        <div className="px-3 py-2 text-xs text-muted-foreground bg-muted/40 border-t border-border">
          {caption}
          {rows.length > maxRows && ` Showing first ${maxRows} of ${rows.length} rows.`}
        </div>
      )}
    </div>
  );
}
