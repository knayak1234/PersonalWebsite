/**
 * expr.ts — A small, safe single-variable math expression compiler.
 *
 * Why not `eval`? Arbitrary `eval` would let a user execute any JavaScript.
 * Instead we tokenize the input, parse it with a tiny recursive-descent parser
 * that only understands numbers, `x`, a fixed set of constants/functions and the
 * operators + - * / ^, then evaluate the resulting AST numerically. Nothing the
 * user types ever reaches a JS parser, so there is no injection surface.
 *
 * Supported syntax for the user-facing f(x) inputs:
 *   - variable:        x
 *   - operators:       + - * / ^   (^ is exponentiation, right-associative)
 *   - grouping:        ( )
 *   - constants:       pi, e
 *   - functions:       sin cos tan asin acos atan sinh cosh tanh
 *                      exp log ln log10 sqrt abs floor ceil round sign cbrt
 *
 * Examples: "exp(-x^2)", "sin(x)/x", "x^3 - 2*x - 5", "2^-x"
 *
 * Precedence (high → low): function call / parens, then `^`, then unary +/-,
 * then * /, then + -. This makes `-x^2` parse as `-(x^2)` and lets exponents be
 * signed (`2^-x`), matching ordinary mathematical convention.
 */

export type ScalarFn = (x: number) => number;

const FUNCS: Record<string, (v: number) => number> = {
  sin: Math.sin, cos: Math.cos, tan: Math.tan,
  asin: Math.asin, acos: Math.acos, atan: Math.atan,
  sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh,
  exp: Math.exp, sqrt: Math.sqrt, cbrt: Math.cbrt, abs: Math.abs,
  floor: Math.floor, ceil: Math.ceil, round: Math.round, sign: Math.sign,
  log: Math.log, ln: Math.log, log10: Math.log10,
};

const CONSTS: Record<string, number> = { pi: Math.PI, e: Math.E };

export interface CompileResult {
  ok: boolean;
  fn?: ScalarFn;
  error?: string;
}

/** Normalize common Unicode look-alikes (minus sign, en/em dash, ×, ÷) to ASCII. */
function normalize(s: string): string {
  return s
    .replace(/[−–—―]/g, "-") // − – — ― → -
    .replace(/[×⋅∙]/g, "*")        // × ⋅ ∙ → *
    .replace(/[÷]/g, "/")                    // ÷ → /
    .replace(/[（]/g, "(")
    .replace(/[）]/g, ")");
}

type Tok =
  | { t: "num"; v: number }
  | { t: "id"; v: string }
  | { t: "op"; v: "+" | "-" | "*" | "/" | "^" }
  | { t: "lp" }
  | { t: "rp" };

function tokenize(input: string): Tok[] {
  const toks: Tok[] = [];
  let i = 0;
  while (i < input.length) {
    const c = input[i];
    if (/\s/.test(c)) { i++; continue; }
    if (c >= "0" && c <= "9" || c === ".") {
      let j = i + 1;
      while (j < input.length && (/[0-9.]/.test(input[j]))) j++;
      const num = Number(input.slice(i, j));
      if (!Number.isFinite(num)) throw new Error("bad number");
      toks.push({ t: "num", v: num });
      i = j;
      continue;
    }
    if (/[a-zA-Z_]/.test(c)) {
      let j = i + 1;
      while (j < input.length && /[a-zA-Z_0-9]/.test(input[j])) j++;
      toks.push({ t: "id", v: input.slice(i, j).toLowerCase() });
      i = j;
      continue;
    }
    if (c === "(") { toks.push({ t: "lp" }); i++; continue; }
    if (c === ")") { toks.push({ t: "rp" }); i++; continue; }
    if (c === "+" || c === "-" || c === "*" || c === "/" || c === "^") {
      toks.push({ t: "op", v: c });
      i++;
      continue;
    }
    throw new Error("unsupported character");
  }
  return toks;
}

type Node =
  | { k: "num"; v: number }
  | { k: "var" }
  | { k: "const"; name: string }
  | { k: "neg"; e: Node }
  | { k: "bin"; op: "+" | "-" | "*" | "/" | "^"; l: Node; r: Node }
  | { k: "call"; name: string; arg: Node };

/**
 * Compile a textual expression into a numeric function of x.
 * Returns a result object (never throws) so callers can show validation errors.
 */
export function compileExpression(raw: string): CompileResult {
  const input = normalize(raw ?? "").trim();
  if (!input) return { ok: false, error: "Expression is empty." };

  let toks: Tok[];
  try {
    toks = tokenize(input);
  } catch {
    return { ok: false, error: "Expression contains unsupported characters." };
  }
  if (toks.length === 0) return { ok: false, error: "Expression is empty." };

  let pos = 0;
  const peek = () => toks[pos];
  const eat = () => toks[pos++];
  /** True when the next token is one of the given operators. */
  const nextOp = (...ops: string[]) => {
    const tk = peek();
    return !!tk && tk.t === "op" && ops.includes(tk.v);
  };

  // addExpr := mulExpr (('+'|'-') mulExpr)*
  function parseAdd(): Node {
    let left = parseMul();
    while (nextOp("+", "-")) {
      const op = (eat() as any).v;
      const right = parseMul();
      left = { k: "bin", op, l: left, r: right };
    }
    return left;
  }

  // mulExpr := unary (('*'|'/') unary)*
  function parseMul(): Node {
    let left = parseUnary();
    while (nextOp("*", "/")) {
      const op = (eat() as any).v;
      const right = parseUnary();
      left = { k: "bin", op, l: left, r: right };
    }
    return left;
  }

  // unary := ('+'|'-')* powExpr
  function parseUnary(): Node {
    if (nextOp("+", "-")) {
      const op = (eat() as any).v;
      const operand = parseUnary();
      return op === "-" ? { k: "neg", e: operand } : operand;
    }
    return parsePow();
  }

  // powExpr := primary ('^' unary)?   (right-associative; exponent may be signed)
  function parsePow(): Node {
    const base = parsePrimary();
    if (nextOp("^")) {
      eat();
      const exp = parseUnary();
      return { k: "bin", op: "^", l: base, r: exp };
    }
    return base;
  }

  // primary := number | const | x | func '(' addExpr ')' | '(' addExpr ')'
  function parsePrimary(): Node {
    const tk = peek();
    if (!tk) throw new Error("unexpected end");
    if (tk.t === "num") { eat(); return { k: "num", v: tk.v }; }
    if (tk.t === "lp") {
      eat();
      const inner = parseAdd();
      if (!peek() || peek().t !== "rp") throw new Error("missing )");
      eat();
      return inner;
    }
    if (tk.t === "id") {
      eat();
      const name = tk.v;
      // function call?
      if (peek() && peek().t === "lp") {
        if (!(name in FUNCS)) {
          throw new Error(`Unknown name "${name}". Allowed: ${Object.keys(FUNCS).join(", ")}.`);
        }
        eat(); // (
        const arg = parseAdd();
        if (!peek() || peek().t !== "rp") throw new Error("missing )");
        eat();
        return { k: "call", name, arg };
      }
      if (name === "x") return { k: "var" };
      if (name in CONSTS) return { k: "const", name };
      throw new Error(`Unknown name "${name}". Allowed: x, pi, e, ${Object.keys(FUNCS).join(", ")}.`);
    }
    throw new Error("unexpected token");
  }

  function evalNode(n: Node, x: number): number {
    switch (n.k) {
      case "num": return n.v;
      case "var": return x;
      case "const": return CONSTS[n.name];
      case "neg": return -evalNode(n.e, x);
      case "call": return FUNCS[n.name](evalNode(n.arg, x));
      case "bin": {
        const l = evalNode(n.l, x);
        const r = evalNode(n.r, x);
        switch (n.op) {
          case "+": return l + r;
          case "-": return l - r;
          case "*": return l * r;
          case "/": return l / r;
          case "^": return Math.pow(l, r);
        }
      }
    }
    return NaN;
  }

  try {
    const ast = parseAdd();
    if (pos !== toks.length) throw new Error("Could not parse expression. Check parentheses and operators.");
    const fn: ScalarFn = (x: number) => evalNode(ast, x);
    const probe = fn(1);
    if (typeof probe !== "number") {
      return { ok: false, error: "Expression did not evaluate to a number." };
    }
    return { ok: true, fn };
  } catch (err: any) {
    const msg = typeof err?.message === "string" && err.message.startsWith("Unknown name")
      ? err.message
      : "Could not parse expression. Check parentheses and operators.";
    return { ok: false, error: msg };
  }
}

/** Convenience: compile or return a constant-NaN function (callers should check ok first). */
export function safeFn(raw: string): ScalarFn {
  const r = compileExpression(raw);
  return r.ok && r.fn ? r.fn : () => NaN;
}
