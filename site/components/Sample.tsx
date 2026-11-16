import { readFileSync } from "node:fs";
import path from "node:path";
import { Code } from "./Code";

/** `next build` type-checks every `.ts` sample here and bundles every `.css` one a page imports. */
const SAMPLES = path.join(process.cwd(), "site", "samples");

/**
 * Shows a file from `site/samples`, so the code on the page is the code the docs build compiled. Lines ending in
 * `// @hide` (the stand-ins for the reader's own camera, renderer and scene) are left out. Server components only.
 */
export function Sample({ file, label }: { file: string; label?: string }) {
  const source = readFileSync(path.join(SAMPLES, file), "utf8")
    .split("\n")
    .filter((line) => !line.trimEnd().endsWith("// @hide"))
    .join("\n");
  return <Code label={label ?? file}>{source}</Code>;
}
