import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// Invariant I7: `lib/orbit/` is pure three.js math. `../errors` is allowed for the coded INVALID_FRAME error; type-only
// imports erase. pose.ts and transition.ts still import `../utils/constants` until O2 rewrites them.
const FILES = ["labelFrame.ts", "frame.ts", "targets.ts"];

describe("lib/orbit imports", () => {
  it.each(FILES)("should import only three and ../errors at runtime in %s", (file) => {
    const source = readFileSync(path.join(__dirname, file), "utf8");
    const runtime = [...source.matchAll(/^import\s+(?!type\s)[^;]*?from\s+"([^"]+)"/gms)].map((match) => match[1]);
    expect(runtime.filter((specifier) => specifier !== "three" && specifier !== "../errors")).toEqual([]);
  });
});
