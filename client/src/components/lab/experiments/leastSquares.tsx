import { useMemo, useRef, useState } from "react";
import {
  ComposedChart, Scatter, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { leastSquaresLinear } from "@/lib/lab/numerics";
import SimLayout, { StatTile, OutputBlock } from "@/components/lab/SimLayout";
import ResultsTable from "@/components/lab/ResultsTable";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import MathTeX from "@/components/lab/MathTeX";
import { Callout, FactGrid } from "@/components/lab/Content";
import type { ExperimentContent } from "@/components/lab/ExperimentScaffold";
import type { ExperimentMeta } from "@/lib/lab/types";

const DEFAULT_DATA = `1, 1.2
2, 1.9
3, 3.2
4, 3.9
5, 5.1
6, 6.2
7, 6.8
8, 8.1`;

/** Parse "x, y" rows (comma/space/tab/newline separated) into numeric arrays. */
function parseData(raw: string): { xs: number[]; ys: number[]; bad: number } {
  const xs: number[] = [], ys: number[] = [];
  let bad = 0;
  raw.split(/\n/).forEach((line) => {
    const t = line.trim();
    if (!t) return;
    const parts = t.split(/[,\s\t]+/).map((p) => parseFloat(p));
    if (parts.length >= 2 && Number.isFinite(parts[0]) && Number.isFinite(parts[1])) {
      xs.push(parts[0]); ys.push(parts[1]);
    } else bad++;
  });
  return { xs, ys, bad };
}

function LeastSquaresSim() {
  const [text, setText] = useState(DEFAULT_DATA);
  const [run, setRun] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const { xs, ys, bad } = parseData(text);
  const valid = xs.length >= 2;

  const result = useMemo(() => {
    if (!valid) return null;
    const fit = leastSquaresLinear(xs, ys);
    // Single dataset (sorted by x) carrying both the data point y and the fitted
    // value; the fit is linear so connecting fitted points draws a straight line.
    const plot = xs
      .map((x, i) => ({ x, y: ys[i], fit: fit.intercept + fit.slope * x }))
      .sort((a, b) => a.x - b.x);
    return { fit, plot };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result || "");
      // strip a header row if it is non-numeric
      const lines = content.split(/\r?\n/);
      const cleaned = lines.filter((l, i) => !(i === 0 && /[a-zA-Z]/.test(l))).join("\n");
      setText(cleaned.trim());
      setRun((r) => r + 1);
    };
    reader.readAsText(file);
  };

  return (
    <SimLayout
      onRun={() => setRun((r) => r + 1)}
      onReset={() => { setText(DEFAULT_DATA); setRun((r) => r + 1); }}
      runLabel="Fit line"
      controls={
        <>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Data points (x, y per line)</Label>
            <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={9} className="font-mono text-xs" />
            {bad > 0 && <p className="text-[11px] text-amber-600">{bad} line(s) skipped (need two numbers).</p>}
            {!valid && <p className="text-[11px] text-rose-600">Enter at least two valid points.</p>}
          </div>
          <div>
            <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleFile} className="hidden" />
            <Button variant="outline" size="sm" className="w-full" onClick={() => fileRef.current?.click()}>
              <Upload className="w-4 h-4 mr-1" /> Upload CSV
            </Button>
            <p className="text-[11px] text-muted-foreground mt-1">Two columns: x, y. A text header row is ignored.</p>
          </div>
        </>
      }
      output={
        !result ? (
          <Callout tone="warn" title="Need more data">Enter at least two valid (x, y) points to fit a line.</Callout>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatTile label="Slope b" value={result.fit.slope.toFixed(5)} />
              <StatTile label="Intercept a" value={result.fit.intercept.toFixed(5)} accent="text-emerald-600" />
              <StatTile label="R²" value={result.fit.r2.toFixed(5)} accent="text-amber-600" />
              <StatTile label="N points" value={String(xs.length)} accent="text-rose-600" />
            </div>

            <Callout tone="success" title="Best-fit line">
              <MathTeX tex={`y = ${result.fit.intercept.toFixed(4)} ${result.fit.slope >= 0 ? "+" : "−"} ${Math.abs(result.fit.slope).toFixed(4)}\\,x`} />
            </Callout>

            <OutputBlock title="Visualization — data & best-fit line">
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={result.plot} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 80% / 0.3)" />
                  <XAxis dataKey="x" type="number" tick={{ fontSize: 11 }} domain={["dataMin", "dataMax"]} />
                  <YAxis tick={{ fontSize: 11 }} width={50} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Scatter dataKey="y" name="data" fill="#f59e0b" isAnimationActive={false} />
                  <Line dataKey="fit" name="best-fit line" stroke="#2563eb" strokeWidth={2} dot={false} isAnimationActive={false} />
                </ComposedChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2">
                The blue line minimises the sum of squared vertical distances (residuals) to the orange data points.
              </p>
            </OutputBlock>

            <OutputBlock title="Numerical results — residuals">
              <ResponsiveContainer width="100%" height={220}>
                <ComposedChart data={result.fit.residuals} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 80% / 0.3)" />
                  <XAxis dataKey="x" type="number" tick={{ fontSize: 11 }} domain={["dataMin", "dataMax"]} />
                  <YAxis tick={{ fontSize: 11 }} width={50} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <ReferenceLine y={0} stroke="#94a3b8" />
                  <Scatter dataKey="residual" name="residual" fill="#e11d48" isAnimationActive={false} />
                </ComposedChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                Residuals should scatter randomly about zero — a pattern (curvature) signals the linear model is wrong.
              </p>
              <ResultsTable
                rows={result.fit.residuals}
                columns={[
                  { key: "x", header: "x", render: (r) => r.x.toFixed(4) },
                  { key: "y", header: "y (data)", render: (r) => r.y.toFixed(4) },
                  { key: "fit", header: "ŷ (fit)", render: (r) => r.fit.toFixed(4) },
                  { key: "residual", header: "residual", render: (r) => r.residual.toExponential(3) },
                ]}
                caption="Residual = observed − fitted; the fit minimises the sum of their squares."
              />
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
          <strong>Least-squares fitting</strong> finds the straight line <MathTeX tex="y = a + bx" /> that best
          represents a set of data points by minimising the sum of the squared vertical distances (residuals)
          between the data and the line. It is the most widely used data-analysis tool in experimental physics.
        </p>
        <p>
          Almost every measurement in a physics lab ends with a fit: extracting a rate constant from a decay
          curve, a spring constant from force–extension data, or a slope from a calibration. Least squares gives
          the optimal parameters and a quantitative measure of fit quality, <MathTeX tex="R^2" />.
        </p>
        <Callout tone="info" title="Why squares?">
          Squaring the residuals penalises large deviations, makes the objective smooth and differentiable, and
          (under Gaussian errors) yields the maximum-likelihood estimate of the parameters.
        </Callout>
      </>
    ),
    applications: (
      <>
        <p>Linear and linearised least squares pervade experimental physics:</p>
        <ul>
          <li><strong>pT spectra fitting:</strong> extracting slope (temperature) parameters from log-linear spectra.</li>
          <li><strong>Exponential decay:</strong> fitting <MathTeX tex="\ln N" /> vs <MathTeX tex="t" /> to find the decay constant <MathTeX tex="\lambda" />.</li>
          <li><strong>Gaussian peaks:</strong> linearising to locate centroids and widths of spectral lines.</li>
          <li><strong>Calibration curves:</strong> detector and instrument response linearisation.</li>
          <li><strong>Determining constants:</strong> Planck's constant from the photoelectric effect, g from a pendulum, etc.</li>
        </ul>
      </>
    ),
    theory: (
      <>
        <p>
          For data <MathTeX tex="(x_i, y_i),\ i=1\dots n" />, model each point as <MathTeX tex="y_i \approx a + b x_i" />.
          Define the sum of squared residuals:
        </p>
        <MathTeX block tex="S(a,b) = \sum_{i=1}^{n}\big(y_i - a - b x_i\big)^2." />
        <p>Minimising — setting <MathTeX tex="\partial S/\partial a = 0" /> and <MathTeX tex="\partial S/\partial b = 0" /> — gives the <strong>normal equations</strong>:</p>
        <MathTeX block tex="\sum y_i = n\,a + b\sum x_i, \qquad \sum x_i y_i = a\sum x_i + b\sum x_i^2." />
        <p>Solving this 2×2 system yields the closed-form estimates:</p>
        <MathTeX block tex="b = \frac{n\sum x_i y_i - \sum x_i \sum y_i}{\,n\sum x_i^2 - \left(\sum x_i\right)^2\,}, \qquad a = \bar y - b\,\bar x." />
        <h3>Goodness of fit</h3>
        <p>The coefficient of determination measures how much variance the line explains:</p>
        <MathTeX block tex="R^2 = 1 - \frac{\sum (y_i - \hat y_i)^2}{\sum (y_i - \bar y)^2}," />
        <p>with <MathTeX tex="R^2 = 1" /> a perfect fit and <MathTeX tex="R^2 = 0" /> no linear relationship.</p>
        <Callout tone="tip" title="Linearise, then fit">
          Many nonlinear laws become linear after a transform: <MathTeX tex="y=Ae^{bx}\Rightarrow \ln y = \ln A + bx" />,
          or <MathTeX tex="y=Ax^{b}\Rightarrow \log y = \log A + b\log x" />. Fit the transformed data with these same formulas.
        </Callout>
        <FactGrid items={[
          { label: "Advantages", value: "Closed-form solution; optimal under Gaussian errors; gives R² and parameter estimates; easily linearises many laws." },
          { label: "Limitations", value: "Sensitive to outliers (squares amplify them); assumes errors only in y; only as good as the chosen model." },
        ]} />
      </>
    ),
    algorithm: {
      steps: [
        { label: "Collect the n data pairs (xᵢ, yᵢ)." },
        { label: "Compute the sums Σxᵢ, Σyᵢ, Σxᵢ², Σxᵢyᵢ." },
        { label: "Compute slope b = (nΣxy − ΣxΣy) / (nΣx² − (Σx)²)." },
        { label: "Compute intercept a = ȳ − b·x̄." },
        { label: "Evaluate fitted values ŷᵢ = a + b·xᵢ and residuals yᵢ − ŷᵢ." },
        { label: "Compute R² from the residual and total sums of squares." },
      ],
      pseudocode: `INPUT x[1..n], y[1..n]
Sx ← Σx;  Sy ← Σy;  Sxx ← Σx²;  Sxy ← Σ(x*y)
b ← (n*Sxy − Sx*Sy) / (n*Sxx − Sx*Sx)
a ← (Sy − b*Sx) / n
FOR i = 1 TO n DO  res[i] ← y[i] − (a + b*x[i])
R2 ← 1 − Σ(res²) / Σ((y − ȳ)²)
OUTPUT a, b, R2`,
      flowchart: ["Start", "Read data (x_i, y_i)", "Compute Σx, Σy, Σx^2, Σxy", "b = (nΣxy−ΣxΣy)/(nΣx^2−(Σx)^2)", "a = ȳ − b·x̄", "Compute residuals & R^2", "Output a, b, R^2", "Stop"],
    },
    simulator: <LeastSquaresSim />,
    cFilename: "least_squares.c",
    cCode: `/* Least Squares Linear Fit  y = a + b*x
 * Compile: gcc least_squares.c -o lsq -lm
 */
#include <stdio.h>

int main(void) {
    int n, i;
    double x[100], y[100];
    double Sx = 0, Sy = 0, Sxx = 0, Sxy = 0, Syy = 0;

    printf("Enter number of data points: ");
    scanf("%d", &n);
    printf("Enter %d pairs (x y):\\n", n);
    for (i = 0; i < n; i++) {
        scanf("%lf %lf", &x[i], &y[i]);
        Sx += x[i];  Sy += y[i];
        Sxx += x[i]*x[i];  Sxy += x[i]*y[i];  Syy += y[i]*y[i];
    }

    double b = (n*Sxy - Sx*Sy) / (n*Sxx - Sx*Sx);   /* slope     */
    double a = (Sy - b*Sx) / n;                       /* intercept */

    /* R^2 */
    double meanY = Sy / n, ssRes = 0, ssTot = 0;
    for (i = 0; i < n; i++) {
        double fit = a + b*x[i];
        ssRes += (y[i]-fit)*(y[i]-fit);
        ssTot += (y[i]-meanY)*(y[i]-meanY);
    }
    double r2 = 1.0 - ssRes/ssTot;

    printf("Best fit: y = %.5lf + %.5lf x\\n", a, b);
    printf("R^2 = %.5lf\\n", r2);
    return 0;
}`,
    viva: [
      { q: "What does the least-squares method minimise?", a: "The sum of the squares of the residuals — the vertical distances between the data points and the fitted line." },
      { q: "Write the normal equations for a straight-line fit.", a: "Σy = na + bΣx and Σxy = aΣx + bΣx²." },
      { q: "Give the formula for the slope b.", a: "b = (nΣxy − ΣxΣy) / (nΣx² − (Σx)²)." },
      { q: "How is the intercept a obtained once b is known?", a: "a = ȳ − b·x̄, so the fitted line passes through the centroid (x̄, ȳ)." },
      { q: "What does R² represent?", a: "The fraction of the variance in y explained by the fit: R² = 1 − SSres/SStot; 1 is perfect, 0 is none." },
      { q: "Why square the residuals rather than take absolute values?", a: "Squaring gives a smooth, differentiable objective with a unique closed-form minimum, and is the maximum-likelihood estimate for Gaussian errors." },
      { q: "What assumption about errors underlies ordinary least squares?", a: "Errors are independent, of constant variance, and lie only in y (x is error-free)." },
      { q: "How can an exponential law y = A·e^{bx} be fitted linearly?", a: "Take logarithms: ln y = ln A + b x, then fit ln y against x." },
      { q: "How can a power law y = A·x^b be linearised?", a: "Take logs of both sides: log y = log A + b log x — a straight line in log–log space." },
      { q: "Why is least squares sensitive to outliers?", a: "Because squaring large residuals gives them disproportionate weight, pulling the line toward the outlier." },
      { q: "What is the geometric meaning of the fitted line passing through (x̄, ȳ)?", a: "The centroid of the data always lies on the least-squares line." },
      { q: "Distinguish interpolation from least-squares fitting.", a: "Interpolation passes exactly through every point; least squares finds a smooth trend that need not pass through any point." },
      { q: "What is weighted least squares?", a: "Each residual is divided by its uncertainty σᵢ, so more precise points carry more weight in the fit." },
      { q: "How would you fit a parabola y = a + bx + cx²?", a: "Set up three normal equations (one per parameter) and solve the 3×3 linear system — polynomial least squares." },
      { q: "Give a physics example of a least-squares fit.", a: "Determining the decay constant λ from a semi-log plot of counts vs time, or extracting the slope parameter (temperature) from a transverse-momentum spectrum." },
    ],
    problems: [
      { level: "Easy", text: "Fit y = a + bx to (1,2),(2,4),(3,5),(4,8) and report the slope and intercept.", hint: "Compute the four sums first." },
      { level: "Easy", text: "For the data above, compute R² and comment on the fit quality.", hint: "Use SSres and SStot." },
      { level: "Easy", text: "Show that the least-squares line passes through the centroid (x̄, ȳ).", hint: "Substitute a = ȳ − b·x̄." },
      { level: "Medium", text: "Fit an exponential N(t) = N₀e^{−λt} to decay data by linearising with ln N.", hint: "Slope of ln N vs t is −λ." },
      { level: "Medium", text: "Fit a power law y = A x^b to data using a log–log transform.", hint: "Plot log y vs log x." },
      { level: "Medium", text: "Determine g from pendulum data T² vs L using a straight-line fit.", hint: "T² = (4π²/g) L; slope gives g." },
      { level: "Medium", text: "Investigate how adding one large outlier shifts the fitted slope.", hint: "Recompute with and without the point." },
      { level: "Advanced", text: "Derive the normal equations for a quadratic fit y = a + bx + cx² and solve a sample dataset.", hint: "Three equations in a, b, c." },
      { level: "Advanced", text: "Implement weighted least squares with per-point uncertainties σᵢ and refit decay data.", hint: "Replace sums Σ with Σ(1/σᵢ²)·(…)." },
      { level: "Advanced", text: "Compute the standard errors of the slope and intercept and quote the slope with its uncertainty.", hint: "σ_b² = σ²·n / (nΣx² − (Σx)²)." },
    ],
    references: (
      <ul>
        <li>S. C. Chapra &amp; R. P. Canale, <em>Numerical Methods for Engineers</em> — Ch. 17 (Least-squares regression).</li>
        <li>W. H. Press et al., <em>Numerical Recipes in C</em> — §15.2 (Fitting data to a straight line).</li>
        <li>P. R. Bevington &amp; D. K. Robinson, <em>Data Reduction and Error Analysis for the Physical Sciences</em>.</li>
        <li>V. Rajaraman, <em>Computer Oriented Numerical Methods</em>, PHI.</li>
        <li>N. J. Giordano &amp; H. Nakanishi, <em>Computational Physics</em>.</li>
      </ul>
    ),
  };
}
