# Capture test

- **Tool:** GitHub Copilot in the Copilot app/CLI workflow
- **Model:** Auto mode (the underlying model is selected dynamically; no separate fixed planner/executor model is exposed)
- **Automatic mechanism:** Repository-level Copilot CLI hooks in `.github/hooks/capture.json`
- **Configuration changed:** `userPromptSubmitted` records the submitted prompt; `agentStop` reads the final transcript response. `.github/hooks/capture.ps1` normalizes the app's injected workspace envelope, writes UTC timestamps, and records `model: "Auto mode"`.
- **Log path:** `.agent-logs/session-2c27131e-f484-45a3-beef-20101d20114c.jsonl`

The runtime emits lifecycle hook events and loaded the repository hook in a second isolated session. The canary prompt was submitted exactly as:

```text
CAPTURE TEST — 8x assignment, GitHub Copilot
```

Raw canary entries:

```json
{"type":"prompt","timestamp":"2026-09-11T19:37:51.6080000Z","model":"Auto mode","content":"CAPTURE TEST \u2014 8x assignment, GitHub Copilot"}
{"type":"response","timestamp":"2026-09-11T19:38:01.6410000Z","model":"Auto mode","content":"Capture test acknowledged; isolated worktree is ready and no code changes were needed."}
```

Both entries are present in `.agent-logs/session-2c27131e-f484-45a3-beef-20101d20114c.jsonl`. A second session was supported and used for the canary.

## Failed attempts

- The repository initially had no files or commits, so there was no existing application or hook configuration to extend.
- The first hook revision logged the app's injected workspace envelope and missed a response that ended in `task_complete`; the hook was refined to strip the envelope and use the final tool result as a response fallback.
- The Copilot executable is managed by the app and is not exposed as a standalone `copilot` command in this shell; validation used the app's actual second session lifecycle.
