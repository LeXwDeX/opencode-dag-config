import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"

const root = resolve(import.meta.dir, "..")
const routes = [
  "code-review",
  "debug-repair",
  "performance-audit",
  "product-planning",
  "project-development",
  "security-audit",
  "technical-design",
].flatMap((domain) => [`${domain}-full.yaml`, `${domain}-lite.yaml`])
routes.push("release-route.yaml", "ultra-flow-route.yaml")

let fixture: string

beforeEach(async () => {
  fixture = await mkdtemp(join(tmpdir(), "dag-route-catalog-"))
  await Promise.all(
    routes.map((route) =>
      Bun.write(join(fixture, route), Bun.file(join(root, route))),
    ),
  )
})

afterEach(async () => {
  await rm(fixture, { recursive: true, force: true })
})

describe("route catalog guardrails", () => {
  test("rejects a lite gate disconnected from its qualification evidence", async () => {
    await rewrite(
      "project-development-lite.yaml",
      "depends_on: [lite-development-plan]",
      "depends_on: []",
    )

    const result = await validate()
    expect(result.exitCode).toBe(1)
    expect(result.stderr).toContain(
      "lite-scope gate must depend on its qualification evidence",
    )
  })

  test("rejects executable work before the lite qualification gate", async () => {
    await rewrite("project-development-lite.yaml", "kind: plan", "kind: coding")

    const result = await validate()
    expect(result.exitCode).toBe(1)
    expect(result.stderr).toContain(
      "lite qualification must be a non-reporting evidence block",
    )
  })

  test("rejects post-gate work that can bypass the gate-dominated chain", async () => {
    await rewrite(
      "project-development-lite.yaml",
      "depends_on: [lite-development-gate]",
      "depends_on: [lite-development-plan]",
    )

    const result = await validate()
    expect(result.exitCode).toBe(1)
    expect(result.stderr).toContain("has work outside its lite-scope gate")
  })

  test("rejects child instructions that select another saved route", async () => {
    await rewrite(
      "project-development-lite.yaml",
      "route and control changes.",
      "route and control changes. Also return next_action: { operation: replan, route: project-development-full }.",
    )

    const result = await validate()
    expect(result.exitCode).toBe(1)
    expect(result.stderr).toContain(
      "must not select another route or control action inside a child block",
    )
  })
})

async function rewrite(file: string, before: string, after: string) {
  const source = await Bun.file(join(fixture, file)).text()
  expect(source).toContain(before)
  await Bun.write(join(fixture, file), source.replace(before, after))
}

async function validate() {
  const child = Bun.spawn(
    [
      process.execPath,
      join(root, "script", "validate-route-catalog.ts"),
      fixture,
    ],
    {
      cwd: root,
      stdout: "pipe",
      stderr: "pipe",
    },
  )
  const [exitCode, stdout, stderr] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ])
  return { exitCode, stdout, stderr }
}
