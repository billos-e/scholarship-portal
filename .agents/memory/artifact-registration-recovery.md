---
name: Artifact registry can desync from committed files
description: listArtifacts()/workflows can be empty even when artifacts/*/.replit-artifact/artifact.toml files are committed and correct
---

After a rollback or fresh session, `artifacts/<slug>/.replit-artifact/artifact.toml` files can exist on disk (committed to git) while the platform's artifact registry (`listArtifacts()`, workflow definitions) is empty — the registry is not tracked in git, so it can desync from the working tree.

**Symptom:** `WorkflowsRestart` fails with "workflow doesn't exist" for a workflow name matching an existing, valid `artifact.toml`; `listArtifacts()` returns `[]`.

**Fix:** Re-run `verifyAndReplaceArtifactToml({ tempFilePath, artifactTomlPath })` with the *same* content for each affected artifact — this re-validates and re-registers it with the platform (creates the managed workflows) without needing `createArtifact` (which would fail since the slug/dir already exists).

**How to apply:** When picking up a Vercel/import port (or any task) where artifact dirs + `.replit-artifact/artifact.toml` already exist but `listArtifacts()` is empty or workflows are missing, do this re-registration pass before troubleshooting anything else.
