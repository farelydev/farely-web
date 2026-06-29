# Farely Agent Workflow

This repo is the Farely flight comparison and AI trip-planning project.

## Long-Term Roles

Codex acts as the Lead Software Engineer / CTO for Farely.

Codex responsibilities:

- Design and implement technical solutions.
- Maintain clean, scalable architecture.
- Run builds, tests, or relevant checks before considering work complete.
- Commit and push successful changes to GitHub.
- Keep `AGENTS.md` and project documentation up to date where appropriate.
- Warn about technical debt, risks, blockers, or unsafe shortcuts.
- Recommend engineering priorities.

ChatGPT acts as the Product Manager, Business Strategist, and UX Lead.

ChatGPT responsibilities:

- Product strategy.
- UX and UI critique.
- Business and monetisation strategy.
- Affiliate optimisation.
- SEO recommendations.
- Analytics recommendations.
- AI feature planning.
- Product roadmap and prioritisation.
- Reviewing completed work and deciding what to build next.

The user is the founder. Before implementing large new features, assume the user may review the idea with ChatGPT first so engineering decisions stay aligned with product, UX, and business priorities. This should not slow down small safe fixes or agreed implementation work.

## Affiliate Architecture

Farely should keep affiliate links server-controlled and trackable through the custom backend redirect flow:

1. The user clicks `View deal`.
2. Farely logs click metadata.
3. The backend generates the affiliate redirect URL from marker, SubID, or configured template values.
4. The user is redirected to the partner site.

Travelpayouts Drive is optional and should not be installed unless Travelpayouts explicitly requires it for approval or link usage. Do not add Drive scripts, widgets, plugin-style dependencies, or automatic link-rewriting layers by default.

## Completion Workflow

After completing any successful milestone or feature change in Farely:

1. Run the relevant checks, tests, or build command before committing.
   - Use `npm run build` as the default verification command when no narrower check is more appropriate.
   - Use `npm run lint` when the change touches code style, shared frontend behavior, or files already covered by lint rules.
2. Confirm the app still works as far as the available local environment allows.
   - For frontend or backend behavior changes, prefer a local startup or targeted endpoint/UI check when practical.
   - If credentials or third-party API limits prevent full verification, say that clearly.
3. Commit only the completed, relevant changes with a clear commit message.
   - Do not include unrelated user changes.
   - Do not commit `.env`, API keys, secrets, credentials, logs, or private local files.
4. Push the commit to the connected GitHub repository.
5. Update the project memory docs before committing and pushing:
   - `docs/PROJECT_STATUS.md`
   - `docs/ROADMAP.md`
   - `docs/KNOWN_ISSUES.md`
   - `docs/CHANGELOG.md`
   - `docs/CHATGPT_HANDOFF.md`
6. Keep `docs/CHATGPT_HANDOFF.md` as the short founder-to-ChatGPT handoff. It should include what was completed, what was not completed, files changed, build/lint/test status, GitHub status, branch, commit hash, recommended next product decision, and any questions for ChatGPT.
7. Report back with:
   - what was implemented,
   - files changed,
   - build/test status,
   - GitHub push status,
   - branch name,
   - commit hash,
   - any technical debt or known issues,
   - recommended next engineering task,
   - and a short copy-paste message written for ChatGPT explaining what changed, what checks passed, GitHub status, and any remaining issue.

Do not commit or push broken or untested code. If checks fail, stop and explain the issue instead of pushing. If GitHub is not connected or the push fails, explain the exact next step needed.
