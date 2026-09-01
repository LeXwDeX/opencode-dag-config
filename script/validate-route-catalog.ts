import path from "node:path"
import fs from "node:fs/promises"

const root = path.resolve(process.argv[2] ?? ".")
const domains = [
  "product-planning",
  "technical-design",
  "project-development",
  "debug-repair",
  "code-review",
  "security-audit",
  "performance-audit",
]
const expected = domains
  .flatMap((domain) => [`${domain}-full.yaml`, `${domain}-lite.yaml`])
  .sort()
// Cross-domain routes compose several domains into one topology; they are not
// domain pairs, so they bypass the lite/topology checks but still carry
// config with config.name == filename stem.
const crossDomainRoutes = ["release-route.yaml", "ultra-flow-route.yaml"]
const catalog = [...expected, ...crossDomainRoutes].sort()
const routeNames = catalog.map((file) => path.basename(file, ".yaml"))
// The compatible runtime gate (runtime-compat.json, commit b48dce46) rejects
// any node whose worker_type is outside its builtin agent catalog
// (build, plan, general, explore); the portable profile skips the catalog when
// absent, so this check closes the gap config-side.
const compatibleWorkerTypes = ["explore", "build", "plan", "general"]
const files = (await fs.readdir(root))
  // Hidden dotfiles are delivery tooling (e.g. the SpecGit `.specgit.yaml`
  // binding), never route templates; the catalog inventory is over visible files.
  .filter((file) => !file.startsWith("."))
  .filter((file) => /\.ya?ml$/i.test(file))
  .sort()

if (JSON.stringify(files) !== JSON.stringify(catalog)) {
  console.error(`Route catalog must contain exactly:\n${catalog.join("\n")}`)
  console.error(`Found:\n${files.join("\n")}`)
  process.exit(1)
}

for (const filename of catalog) {
  const parsed: unknown = Bun.YAML.parse(
    await Bun.file(path.join(root, filename)).text(),
  )
  const name = path.basename(filename, ".yaml")
  if (!isRecord(parsed) || !isRecord(parsed.config))
    fail(`${filename} must contain config`)
  if (parsed.config.name !== name)
    fail(`${filename} config.name must equal ${name}`)
  if (name.endsWith("-lite")) validateLiteRoute(filename, parsed.config)
  validateWorkerTypes(filename, parsed.config)
}

function validateWorkerTypes(
  filename: string,
  config: Record<string, unknown>,
) {
  const workers = [
    ...(Array.isArray(config.nodes) ? config.nodes : []),
    ...(Array.isArray(config.blocks) ? config.blocks : []),
  ].filter(isRecord)
  for (const worker of workers) {
    if (worker.worker_type === undefined) continue
    const workerType = String(worker.worker_type)
    if (compatibleWorkerTypes.includes(workerType)) continue
    fail(
      `${filename} node ${worker.id} worker type "${workerType}" is not in the compatible runtime agent catalog (${compatibleWorkerTypes.join(", ")})`,
    )
  }
}

console.log(
  `Validated ${catalog.length} routes: ${domains.length} full/lite domains plus ${crossDomainRoutes.length} cross-domain routes.`,
)

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function validateLiteRoute(filename: string, config: Record<string, unknown>) {
  if (!Array.isArray(config.blocks))
    fail(`${filename} must use composable blocks`)
  const blocks = config.blocks.filter(isRecord)
  if (blocks.length !== config.blocks.length)
    fail(`${filename} contains an invalid block`)
  if (
    blocks.some((block) =>
      selectsRouteOrControl(String(block.instruction ?? "")),
    )
  )
    fail(
      `${filename} must not select another route or control action inside a child block`,
    )

  const gates = blocks.filter(
    (block) =>
      block.kind === "review" &&
      block.report_to_parent === true &&
      String(block.instruction ?? "").includes("Return ACCEPT only") &&
      String(block.instruction ?? "").includes(
        "parent Router owns route and control changes",
      ),
  )
  if (gates.length !== 1)
    fail(`${filename} must contain exactly one parent-owned lite-scope gate`)

  const gateID = gates[0]?.id
  if (typeof gateID !== "string")
    fail(`${filename} lite-scope gate must have an id`)
  const gateIndex = blocks.findIndex((block) => block.id === gateID)
  if (gateIndex !== 1)
    fail(
      `${filename} must contain exactly one qualification block before its lite-scope gate`,
    )
  const qualification = blocks[0]
  if (
    typeof qualification?.id !== "string" ||
    !["explore", "plan", "debug"].includes(String(qualification.kind)) ||
    qualification.report_to_parent === true
  )
    fail(
      `${filename} lite qualification must be a non-reporting evidence block`,
    )
  if (
    !Array.isArray(gates[0]?.depends_on) ||
    gates[0].depends_on.length !== 1 ||
    gates[0].depends_on[0] !== qualification.id
  )
    fail(
      `${filename} lite-scope gate must depend on its qualification evidence`,
    )
  const dominated = new Set([gateID])
  blocks.slice(gateIndex + 1).forEach((block) => {
    if (typeof block.id !== "string")
      fail(`${filename} contains a post-gate block without an id`)
    if (
      !Array.isArray(block.depends_on) ||
      block.depends_on.length === 0 ||
      !block.depends_on.every(
        (dependency) =>
          typeof dependency === "string" && dominated.has(dependency),
      )
    )
      fail(`${filename} has work outside its lite-scope gate`)
    dominated.add(block.id)
  })
}

function selectsRouteOrControl(instruction: string) {
  if (
    /(?:escalat|full route|next_action|select (?:a |the )?(?:workflow )?control|choose (?:a |the )?(?:workflow )?control|control\((?:pause|resume|replan|complete|cancel)\)|operation\s*:\s*(?:continue|extend|replan|complete|stop))/i.test(
      instruction,
    )
  )
    return true
  return routeNames.some((name) => instruction.toLowerCase().includes(name))
}

function fail(message: string): never {
  console.error(message)
  process.exit(1)
}
