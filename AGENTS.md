<!-- specgit:block:start -->
## SpecGit delivery harness

Managed by `specgit init`. Everything between the markers is regenerated
whenever init writes the harness (a fresh init, or `--force` when a policy
already exists); keep manual guidance outside them.

### The delivery story

- Start with `specgit issue <title-or-number>...`: it creates or reuses
  the issues, branches, opens the draft pull request pre-filled with a
  deterministic scaffold (the `Closes #n` line for every bound issue,
  then Why / What changed / Evidence / Checklist sections), and writes
  `.specgit.yaml`. Re-running resumes; it is idempotent.
- Issue bodies are filled at bootstrap, from the conversation: right after
  `specgit issue` succeeds, edit each issue it created (`gh issue edit <n>`)
  with the discussed Why / Scope / Approach / Acceptance, then implement.
  The PR scaffold's placeholders are advisory — fill those sections in as
  you deliver; the closing references are the only body gate. The PR body
  is written once at creation; no SpecGit command edits an existing PR
  body, and the repository's own pull-request template is never read.
- A draft pull request always fails the verdict (`pr_draft`): before
  `specgit finish`, mark it ready for review — `gh pr ready <number>`
  on GitHub, `glab mr update <number> --ready` on GitLab.
- Finish with `specgit finish`: the verdict, derived from real git, PR,
  and CI evidence. Exit code 0 is the only "done".

### Issue tags

- Every bootstrap applies the title's `kind::<type>` member
  automatically; pass `--tags <a,b>` to choose the full set explicitly.
- Selection is pool-first: existing on-spec labels win verbatim; anything
  missing is seeded from the built-in `kind::` catalog or the policy's
  `tags:` declarations. Unknown vocabulary exits 2 naming the universe.
- Choose with restraint: at most one label per axis, none when unsure —
  off-spec pool labels are reported (`tag_pool_dirty` warnings are for
  humans) and never renamed by SpecGit.

### Repair and diagnostics

- `specgit pr` repairs the pull-request binding: with no arguments it
  auto-discovers the pull request for this head branch, errors with a fix
  when none is found, and refuses with a list when several match.
- `specgit status` shows local evidence only: record, state, drift,
  origin. `specgit doctor` probes git, repository, origin, gh, and
  policy.

### The command surface

- Ten commands: `specgit init`, `specgit setup`, `specgit issue`,
  `specgit pr`, `specgit finish`, `specgit bind`, `specgit unbind`,
  `specgit status`, `specgit accept`, `specgit doctor`.
- `specgit setup` installs the agent entry points (commands for opencode,
  portable skills for other tools); `specgit bind`, `specgit unbind`,
  and `specgit accept` are automation aliases for scripts and CI.

### Before creating an issue, check for duplicates

- Before running `specgit issue` with a new title, search the tracker for
  similar open work: `gh issue list` with keywords from the title
  (state, labels, and search terms via `gh search issues`).
- Open and read every plausible candidate (`gh issue view <n>`) — compare
  the WHY, not just the wording.
- If a candidate covers the same WHY, continue that issue instead of
  creating a new one; if it is close but different, say how they differ.
- When unsure, ask the requester to decide between continuing the existing
  issue and creating a duplicate. The team ships one line of work per WHY,
  never two.

### Issue granularity

One issue = one independently verifiable WHY. If a deliverable cannot be
verified on its own evidence, split it before binding.

### Iron rules

- `specgit finish` exit code other than 0: never request merge. Fix the
  delivery, not the gate.
- Never weaken `spec_git/policy.yaml` to make a verdict pass.
- `--json` is the only parse surface: stdout is exactly one JSON
  document; never scrape human-readable output.

### Agent contract essentials

- **SpecGit is the default way of working here.** Any non-trivial
  task — a feature, a fix, a refactor, a docs change — is a delivery:
  work items live in this tracker as issues, never in private task
  lists or conversational checklists. The trigger is the decision to
  start: the moment the conversation settles and you begin turning
  the plan into changes, the FIRST action is
  `specgit issue <type>: <title>...` — before any file edit.
  Working without a binding is a contract violation, not a style
  choice. Immediately after bootstrap, fill each issue body
  (Why / Scope / Approach / Acceptance) from the discussion with
  `gh issue edit`, then implement. Mid-conversation inventories
  ("let me list everything to do") become issues, not chat
  artifacts. Trivial replies and read-only questions need none of
  this.
- The one rule: a delivery is done if and only if `specgit finish`
  exits `0`. Never declare completion from task lists, file states, or
  test runs you performed yourself.
- Branch on exit codes, not phrasing: `1` = evidence complete, fix what
  the gates named; `3` = evidence missing, fix the environment first
  (`specgit doctor`). Never present exit `3` as success.
- Keep the `Closes #n` references in the PR body intact; after changing
  the PR body, head branch, or CI, re-run `specgit finish`. Never
  bypass or reconfig a required check to make acceptance pass.
- Forge evidence flows through the user's authenticated CLI session only
  (`gh` / `glab`): never read, log, or pass around tokens.
<!-- specgit:block:end -->
