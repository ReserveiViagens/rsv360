## Repo visibility toggle protocol
- NEVER change repo visibility while CI runs are active
- NEVER change repo visibility while open PRs depend on public links
- NEVER change repo visibility without explicit user confirmation ("GO privatizar" / "GO publicar")
- Pre-flight checklist: `gh run list --status in_progress,queued`, `gh pr list --state open`, worktree status
- Full protocol: https://www.notion.so/2ed5455b303344bcbfb9038800cf9193
