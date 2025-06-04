# Change Log

All notable changes to the "Git Worktree + cursor Editor" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.0.0] - 2024-01-XX

### Added

- Initial release of Git Worktree + cursor Editor
- Sidebar interface in VS Code Activity Bar for worktree management
- Create new Git worktrees with automatic branch creation
- Automatic opening of new worktrees in Cursor editor
- Smart directory organization with `<repo-name>-worktree` structure
- Delete single worktrees via context menu in sidebar
- Bulk delete functionality with multi-select checkboxes
- Auto-refresh of worktree list after operations
- Visual indicators to distinguish main worktree from feature worktrees
- Progress notifications during worktree operations
- Copy of `.env` and other local config files from subdirectories when creating a worktree
- User-defined local file patterns via `git-worktree-cursor.localFilePatterns`
- Input validation for branch names
- Error handling with user-friendly messages

### Technical Details

- Built with TypeScript and VS Code Extension API
- Uses Git CLI for worktree operations
- Integrates with Cursor editor via command line
- Tree view implementation for sidebar interface
- Supports all standard Git branch naming conventions
