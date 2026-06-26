# Farely Agent Workflow

This repo is the Farely flight comparison and AI trip-planning project.

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
5. Report back with:
   - what changed,
   - whether it was pushed to GitHub,
   - the branch name,
   - anything that failed or could not be verified,
   - and a short copy-paste message the user can send to ChatGPT explaining what was changed, what checks passed, the GitHub status, and any remaining issue.

Do not commit or push broken or untested code. If checks fail, stop and explain the issue instead of pushing. If GitHub is not connected or the push fails, explain the exact next step needed.
