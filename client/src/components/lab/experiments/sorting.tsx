import { useMemo, useState } from "react";
import { selectionSort } from "@/lib/lab/numerics";
import SimLayout, { StatTile, OutputBlock } from "@/components/lab/SimLayout";
import { TextField } from "@/components/lab/ParamControl";
import { Label } from "@/components/ui/label";
import MathTeX from "@/components/lab/MathTeX";
import { Callout, FactGrid } from "@/components/lab/Content";
import type { ExperimentContent } from "@/components/lab/ExperimentScaffold";
import type { ExperimentMeta } from "@/lib/lab/types";

function parseList(raw: string): number[] {
  return raw.split(/[,\s]+/).map((s) => parseFloat(s)).filter((v) => !Number.isNaN(v));
}

function Bars({ values, highlight }: { values: number[]; highlight: [number, number] | null }) {
  const max = Math.max(...values.map((v) => Math.abs(v)), 1);
  return (
    <div className="flex items-end gap-1.5 h-40 border-b border-border pb-1">
      {values.map((v, i) => {
        const h = (Math.abs(v) / max) * 100;
        const on = highlight && (i === highlight[0] || i === highlight[1]);
        return (
          <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
            <div
              className={`w-full rounded-t transition-all ${on ? "bg-amber-500" : "bg-primary/70"}`}
              style={{ height: `${h}%` }}
            />
            <span className="text-[10px] font-mono text-muted-foreground">{v}</span>
          </div>
        );
      })}
    </div>
  );
}

function SortingSim() {
  const [str, setStr] = useState("29, 10, 14, 37, 13, 5, 21");
  const [asc, setAsc] = useState(true);
  const [run, setRun] = useState(0);

  const nums = parseList(str);
  const errors: Record<string, string> = {};
  if (nums.length < 2) errors.list = "Enter at least two numbers.";
  const valid = Object.keys(errors).length === 0;

  const result = useMemo(() => {
    if (!valid) return null;
    return selectionSort(nums, asc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  return (
    <SimLayout
      onRun={() => setRun((r) => r + 1)}
      onReset={() => { setStr("29, 10, 14, 37, 13, 5, 21"); setAsc(true); setRun((r) => r + 1); }}
      runLabel="Sort"
      controls={
        <>
          <TextField label="Numbers" value={str} onChange={setStr} error={errors.list} hint="Comma or space separated." />
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Order</Label>
            <div className="flex gap-2">
              <button
                onClick={() => setAsc(true)}
                className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${asc ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10"}`}
              >Ascending</button>
              <button
                onClick={() => setAsc(false)}
                className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${!asc ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10"}`}
              >Descending</button>
            </div>
          </div>
        </>
      }
      output={
        !result ? (
          <Callout tone="warn" title="Enter numbers to sort">Provide at least two comma-separated numbers.</Callout>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatTile label="Count n" value={String(nums.length)} />
              <StatTile label="Comparisons" value={String(result.comparisons)} accent="text-amber-600" />
              <StatTile label="Swaps" value={String(result.swaps)} accent="text-emerald-600" />
              <StatTile label="Order" value={asc ? "Ascending" : "Descending"} accent="text-violet-600" />
            </div>

            <OutputBlock title="Sorted result">
              <div className="font-mono text-sm p-3 rounded-lg bg-muted/50 break-words">
                [{result.sorted.join(", ")}]
              </div>
            </OutputBlock>

            <OutputBlock title="Visualization — state after each pass (swapped bars highlighted)">
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Initial</div>
                  <Bars values={nums} highlight={null} />
                </div>
                {result.steps.map((s) => (
                  <div key={s.pass}>
                    <div className="text-xs text-muted-foreground mb-1">
                      Pass {s.pass}{s.swapped ? ` — swapped positions ${s.swapped[0] + 1} ↔ ${s.swapped[1] + 1}` : " — no swap needed"}
                    </div>
                    <Bars values={s.array} highlight={s.swapped} />
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Selection sort repeatedly finds the {asc ? "smallest" : "largest"} remaining element and moves it into
                place, so after pass <MathTeX tex="i" /> the first <MathTeX tex="i" /> positions are final.
              </p>
            </OutputBlock>
          </>
        )
      }
    />
  );
}

export default function build(meta: ExperimentMeta, prev?: any, next?: any): ExperimentContent {
  return {
    meta,
    prev: prev && { id: prev.id, name: prev.name },
    next: next && { id: next.id, name: next.name },
    intro: (
      <>
        <p>
          <strong>Sorting</strong> — arranging a set of numbers into ascending or descending order — is one of the most
          fundamental operations in computing. In physics data analysis it precedes finding the median, building
          histograms, ranking measurements, and any binary-search lookup.
        </p>
        <p>
          This experiment uses <strong>selection sort</strong>, whose logic is easy to trace by hand: on each pass it
          selects the extreme (smallest or largest) element from the unsorted part and places it at the boundary. Its
          transparency makes it an ideal first sorting program even though faster algorithms exist.
        </p>
        <Callout tone="info" title="Sorting as a building block">
          Once data is sorted, the median, quartiles, minimum and maximum are read off instantly, and searching becomes
          logarithmic instead of linear.
        </Callout>
      </>
    ),
    applications: (
      <>
        <p>Sorting underpins many data-processing tasks in experimental physics:</p>
        <ul>
          <li><strong>Median &amp; quartiles:</strong> robust statistics require ordered data.</li>
          <li><strong>Histogramming:</strong> binning events efficiently after ordering.</li>
          <li><strong>Ranking:</strong> ordering detector hits by energy or time.</li>
          <li><strong>Search:</strong> binary search on sorted arrays is O(log n).</li>
          <li><strong>Percentiles &amp; outliers:</strong> identifying extreme measurements.</li>
        </ul>
      </>
    ),
    theory: (
      <>
        <p>
          <strong>Selection sort</strong> divides the array into a sorted prefix and an unsorted suffix. For an array of
          <MathTeX tex="\,n" /> elements it performs <MathTeX tex="n-1" /> passes. On pass <MathTeX tex="i" /> it scans
          the unsorted suffix, finds the index of the extreme element, and swaps it into position <MathTeX tex="i" />.
        </p>
        <h3>Operation count</h3>
        <p>The number of comparisons is fixed regardless of the input:</p>
        <MathTeX block tex="C = (n-1) + (n-2) + \cdots + 1 = \frac{n(n-1)}{2} = O(n^2)." />
        <p>
          At most <MathTeX tex="n-1" /> swaps are performed — one per pass — which makes selection sort attractive when
          writing (swapping) is far more expensive than reading (comparing).
        </p>
        <h3>Stability and memory</h3>
        <p>
          Selection sort is <em>in-place</em> (needs no extra array) but is <em>not stable</em> — equal elements may be
          reordered. For large datasets, <MathTeX tex="O(n\log n)" /> methods such as quicksort or mergesort are
          preferred.
        </p>
        <FactGrid items={[
          { label: "Advantages", value: "Very simple; in-place (O(1) extra memory); minimal number of writes (≤ n−1 swaps)." },
          { label: "Limitations", value: "Always O(n²) comparisons even if already sorted; not stable; impractical for large n." },
        ]} />
      </>
    ),
    algorithm: {
      steps: [
        { label: "Read the n numbers into an array." },
        { label: "For each position i from 0 to n−2, treat it as the boundary of the sorted part." },
        { label: "Scan positions i+1 … n−1 to find the index of the smallest (ascending) or largest (descending) element." },
        { label: "If that index differs from i, swap the two elements." },
        { label: "Advance i; the sorted prefix grows by one." },
        { label: "After n−1 passes the whole array is ordered — print it." },
      ],
      pseudocode: `INPUT a[0..n-1], order
FOR i = 0 TO n-2 DO
    sel ← i
    FOR j = i+1 TO n-1 DO
        IF a[j] "more extreme than" a[sel] THEN sel ← j
    IF sel ≠ i THEN swap(a[i], a[sel])
OUTPUT a`,
      flowchart: ["Start", "Read array", "i = 0", "Find extreme in a[i..n-1]", "Swap into a[i]", "i < n-1 ?", "Output sorted array", "Stop"],
    },
    simulator: <SortingSim />,
    cFilename: "sorting.c",
    cCode: `/* Sorting a set of numbers (Selection Sort), ascending order
 * Compile: gcc sorting.c -o sort
 */
#include <stdio.h>

int main(void) {
    int n, i, j, sel;
    double a[100], t;

    printf("Enter number of elements: ");
    scanf("%d", &n);
    printf("Enter %d numbers:\\n", n);
    for (i = 0; i < n; i++) scanf("%lf", &a[i]);

    for (i = 0; i < n-1; i++) {
        sel = i;
        for (j = i+1; j < n; j++)
            if (a[j] < a[sel]) sel = j;      /* '>' for descending */
        if (sel != i) { t = a[i]; a[i] = a[sel]; a[sel] = t; }
    }

    printf("Sorted (ascending):\\n");
    for (i = 0; i < n; i++) printf("%.2lf ", a[i]);
    printf("\\n");
    return 0;
}`,
    viva: [
      { q: "What does selection sort do on each pass?", a: "It finds the extreme (smallest for ascending) element in the unsorted part and swaps it into the next sorted position." },
      { q: "How many comparisons does selection sort make?", a: "n(n−1)/2, i.e. O(n²), independent of the initial order." },
      { q: "How many swaps at most?", a: "At most n−1 swaps — one per pass." },
      { q: "Is selection sort stable?", a: "No; equal keys can be reordered relative to their original positions." },
      { q: "Is it in-place?", a: "Yes; it uses only O(1) additional memory (a temporary for swapping)." },
      { q: "How do you change ascending to descending?", a: "Reverse the comparison — look for the largest element instead of the smallest." },
      { q: "What is the best-case time of selection sort?", a: "Still O(n²) comparisons, because it always scans the whole unsorted part." },
      { q: "Name two faster general-purpose sorts.", a: "Quicksort and mergesort, both average O(n log n)." },
      { q: "How does bubble sort differ from selection sort?", a: "Bubble sort repeatedly swaps adjacent out-of-order pairs; it makes many swaps, while selection sort makes at most n−1." },
      { q: "How does insertion sort differ?", a: "Insertion sort grows a sorted prefix by inserting each new element into place; it is efficient for nearly-sorted data." },
      { q: "Why sort data before finding the median?", a: "The median is the middle element of the sorted array (or average of the two middle elements)." },
      { q: "What is a stable sort useful for?", a: "Sorting by a secondary key while preserving the order of a previously sorted primary key." },
    ],
    problems: [
      { level: "Easy", text: "Sort 29, 10, 14, 37, 13 in ascending order by hand, listing each pass.", hint: "5,10,13,14,29,37 after full sort." },
      { level: "Easy", text: "Modify the program to sort in descending order.", hint: "Change a[j] < a[sel] to a[j] > a[sel]." },
      { level: "Easy", text: "Count the exact number of comparisons for n = 7.", hint: "7·6/2 = 21." },
      { level: "Medium", text: "After sorting, print the median of an odd-length list.", hint: "Element at index n/2." },
      { level: "Medium", text: "Sort an array of student marks and print the top three.", hint: "Descending, then first three." },
      { level: "Medium", text: "Implement bubble sort and compare its swap count with selection sort on the same data.", hint: "Bubble usually swaps far more." },
      { level: "Advanced", text: "Implement quicksort and compare running time with selection sort for n = 10000.", hint: "O(n log n) vs O(n²)." },
      { level: "Advanced", text: "Make selection sort stable and explain the modification.", hint: "Insert rather than swap the selected element." },
      { level: "Advanced", text: "Sort records by two keys (energy, then time) and discuss stability.", hint: "Sort by secondary key first with a stable sort." },
    ],
    references: (
      <ul>
        <li>T. H. Cormen et al., <em>Introduction to Algorithms</em> — sorting.</li>
        <li>E. Balagurusamy, <em>Programming in ANSI C</em> — arrays &amp; sorting.</li>
        <li>W. H. Press et al., <em>Numerical Recipes in C</em> — §8 (sorting).</li>
        <li>V. Rajaraman, <em>Computer Oriented Numerical Methods</em>, PHI.</li>
      </ul>
    ),
  };
}
