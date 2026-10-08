import { spawnSync } from "node:child_process"
import { mkdtempSync, readdirSync, rmSync, symlinkSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const output = mkdtempSync(path.join(tmpdir(), "gonogo-tests-"))

try {
  symlinkSync(path.join(root, "node_modules"), path.join(output, "node_modules"), "dir")
  const compile = spawnSync(process.execPath, [
    path.join(root, "node_modules/typescript/bin/tsc"),
    "--project", path.join(root, "tests/tsconfig.json"),
    "--outDir", output,
    "--pretty", "false",
  ], { cwd: root, stdio: "inherit" })
  if (compile.status !== 0) {
    process.exitCode = compile.status ?? 1
  } else {
    const tests = readdirSync(path.join(output, "tests"))
      .filter((file) => file.endsWith(".test.js"))
      .map((file) => path.join(output, "tests", file))
    const run = spawnSync(process.execPath, ["--test", ...tests], { cwd: root, stdio: "inherit" })
    process.exitCode = run.status ?? 1
  }
} finally {
  rmSync(output, { recursive: true, force: true })
}
