/**
 * expr.ts — A small, safe single-variable math expression compiler.
 *
 * Why not `eval`? Arbitrary `eval` would let a user execute any JavaScript.
 * Instead we (1) strictly whitelist the characters and function names that may
 * appear, then (2) build a narrow `Function('x', ...)` whose body can only
 * reference `x`, numeric literals, operators, and a fixed set of Math helpers.
 *
 * Supported syntax for the user-facing f(x) inputs:
 *   - variable:        x
 *   - operators:       + - * / ^   (^ is mapped to Math.pow)
 *   - grouping:        ( )
 *   - constants:       pi, e
 *   - functions:       sin cos tan asin acos atan sinh cosh tanh
 *                      exp log ln log10 sqrt abs floor ceil round sign
 *
 * Example: "exp(-x^2)", "sin(x)/x", "x^3 - 2*x - 5"
 */

export type ScalarFn = (x: number) => number;

const ALLOWED_FUNCS = [
  "sin", "cos", "tan", "asin", "acos", "atan",
  "sinh", "cosh", "tanh",
  "exp", "log", "ln", "log10", "sqrt", "abs",
  "floor", "ceil", "round", "sign", "cbrt",
];

const ALLOWED_CONSTS = ["pi", "e"];

export interface CompileResult {
  ok: boolean;
  fn?: ScalarFn;
  error?: string;
}

/**
 * Compile a textual expression into a numeric function of x.
 * Returns a result object (never throws) so callers can show validation errors.
 */
export function compileExpression(raw: string): CompileResult {
  const input = (raw ?? "").trim();
  if (!input) return { ok: false, error: "Expression is empty." };

  // 1) Character whitelist: digits, x, operators, parens, dot, comma, letters
  //    (letters are validated against the function/const whitelist below).
  if (!/^[0-9a-zA-Z_+\-*/^().,\s]+$/.test(input)) {
    return { ok: false, error: "Expression contains unsupported characters." };
  }

  // 2) Token-level whitelist: every alphabetic identifier must be x,
  //    an allowed constant, or an allowed function name.
  const identifiers = input.match(/[a-zA-Z_]+/g) ?? [];
  for (const id of identifiers) {
    const lower = id.toLowerCase();
    if (lower === "x") continue;
    if (ALLOWED_CONSTS.includes(lower)) continue;
    if (ALLOWED_FUNCS.includes(lower)) continue;
    return { ok: false, error: `Unknown name "${id}". Allowed: x, pi, e, ${ALLOWED_FUNCS.join(", ")}.` };
  }

  // 3) Translate to a JS expression that only touches Math.* and x.
  let js = input;
  // ^ -> ** (exponentiation)
  js = js.replace(/\^/g, "**");
  // word-boundary replacements for functions/constants
  js = js.replace(/\bln\b/gi, "Math.log");
  js = js.replace(/\blog10\b/gi, "Math.log10");
  js = js.replace(/\blog\b/gi, "Math.log");
  js = js.replace(/\bpi\b/gi, "Math.PI");
  // standalone e (constant) but not part of a function/number — handled last
  for (const f of ALLOWED_FUNCS) {
    if (f === "ln" || f === "log" || f === "log10") continue;
    js = js.replace(new RegExp(`\\b${f}\\b`, "gi"), `Math.${f}`);
  }
  // bare constant e -> Math.E (only when surrounded by non-identifier chars)
  js = js.replace(/\be\b/gi, "Math.E");

  try {
    // eslint-disable-next-line no-new-func
    const built = new Function("x", `"use strict"; return (${js});`) as ScalarFn;
    // sanity probe
    const probe = built(1);
    if (typeof probe !== "number") {
      return { ok: false, error: "Expression did not evaluate to a number." };
    }
    return { ok: true, fn: built };
  } catch (err) {
    return { ok: false, error: "Could not parse expression. Check parentheses and operators." };
  }
}

/** Convenience: compile or return a constant-NaN function (callers should check ok first). */
export function safeFn(raw: string): ScalarFn {
  const r = compileExpression(raw);
  return r.ok && r.fn ? r.fn : () => NaN;
}
