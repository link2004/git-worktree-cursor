# Git Worktree + Cursor Launcher

🚀 A VS Code extension to easily create and manage Git worktrees in Cursor editor

## 📋 Overview

This extension enables you to:
- Input a branch name via GUI
- Select a parent directory
- Automatically create a `<repository-name>-<branch-suffix>` directory
- Create a Git worktree and open it in a new Cursor window

## 🔧 Prerequisites

- Cursor Editor (VS Code compatible)
- Git CLI installed
- `cursor` command-line tool installed
  - In Cursor: `Cmd+Shift+P` → `Shell Command: Install 'cursor' command in PATH`

## 📦 Installation

### For Development

1. Clone this repository
```bash
git clone <repository-url>
cd git-worktree-extention
```

2. Install dependencies
```bash
npm install
```

3. Build the extension
```bash
npm run compile
```

4. Development in Cursor
   - Open the project in Cursor
   - Press `F5` to launch a new Cursor window with the extension loaded

## 🎯 Usage

1. **Open Command Palette**
   - `Cmd+Shift+P` (Mac) / `Ctrl+Shift+P` (Windows/Linux)

2. **Run Command**
   - Select `Git: Add Worktree and Open in Cursor`

3. **Enter Branch Name**
   - Example: `feature/login-ui`
   - Allowed characters: alphanumeric, hyphens, underscores, slashes

4. **Select Parent Directory**
   - Default: one level up from current repository
   - Can select any location

5. **Automatic Execution**
   - Creates directory like `myapp-login-ui` in selected parent directory
   - Creates Git worktree
   - Opens in new Cursor window

## 📁 Directory Structure Example

```
/Users/username/projects/
├── myapp/                    ← Current workspace
├── myapp-login-ui/          ← Auto-generated worktree
    └── ...                  ← Contents of feature/login-ui branch
```

## ⚙️ How It Works

Internally executes:
```bash
git worktree add "<working-directory>" -b "<branch-name>" && cursor "<working-directory>"
```

## 🚨 Troubleshooting

### "cursor command not found" error
1. Open Cursor
2. `Cmd+Shift+P` → `Shell Command: Install 'cursor' command in PATH`
3. Restart terminal

### Git worktree creation fails
- Ensure you're in a Git repository root
- Check if branch name already exists
- Verify write permissions for parent directory

## 🔮 Planned Features

- [ ] Select from existing local branches
- [ ] Display existing worktrees list
- [ ] GitHub PR integration (`gh pr checkout`)
- [ ] Auto-run `npm install` on first launch

## 📝 License

MIT License

## 🤝 Contributing

Issues and Pull Requests are welcome!

---

Made with ❤️ for Cursor users