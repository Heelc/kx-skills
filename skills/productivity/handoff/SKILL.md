---
name: handoff
description: Compact the current conversation into a handoff document for another agent to pick up.
argument-hint: "What will the next session be used for?"
disable-model-invocation: true
---

Write a handoff document summarising the current conversation so a fresh agent can continue the work. Save to the temporary directory of the user's OS - not the current workspace. If that directory is unavailable or not writable in the current sandbox, return the complete redacted handoff inline and state the intended absolute path instead of writing into the workspace.

Include a "suggested skills" section in the document, which suggests skills that the agent should invoke.

Do not duplicate content already captured in other artifacts (specs, plans, ADRs, issues, commits, diffs). Reference them by path or URL instead.

Treat sensitive information such as API keys, passwords, and personally identifiable information as tainted input. At the start, identify each sensitive literal as a forbidden output token, replace it with a neutral placeholder, and never type that literal again. This applies to the handoff body, filename, progress update, action list, tool summary, and final response. Describe the operation only as “sensitive data redacted”; never quote or identify the value being redacted. Verify the saved document and every final-response field before returning. Finish with either `Saved the redacted handoff to <absolute-path>.` or the complete redacted inline handoff when the temporary directory is unavailable.

If the user passed arguments, treat them as a description of what the next session will focus on and tailor the doc accordingly.
