# Workspace Rules

## Automatic Changelog Updates
Whenever you complete a task that adds a new feature, makes a significant improvement, or fixes a bug, you **MUST automatically update the changelog** before finishing your turn.
1. Open `js/app.js`.
2. Bump the `APP_VERSION` string appropriately (e.g., semantic versioning: minor bump for features, patch bump for fixes).
3. Add a new entry to the top of the `CHANGELOG` array documenting the changes.
4. Do not wait for the user to ask you to do this. Consider it a mandatory final step of any feature development or bug fix.

## Git Operations
Do not automatically run `git commit` or `git push` after making changes. Only save the files locally and wait for the user's explicit command to push or commit changes.
