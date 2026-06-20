# Workspace Rules

## Automatic Changelog Updates
Do not bump the version or update the changelog after every small feature or fix. 
Instead, **only bump the version and update the changelog when preparing to `git commit` and `push`**. 
When the user asks you to commit and push, follow these steps before committing:
1. Open `js/app.js`.
2. Bump the `APP_VERSION` string appropriately based on the total changes since the last commit (e.g., semantic versioning).
3. Add a single new entry to the top of the `CHANGELOG` array summarizing all the changes made in this commit.

## Git Operations
Do not automatically run `git commit` or `git push` after making changes. Only save the files locally and wait for the user's explicit command to push or commit changes.
