# Git Worktree + Cursor Launcher

A powerful VS Code extension that streamlines Git worktree management with automatic Cursor editor integration. Perfect for developers who work on multiple features simultaneously.

## ✨ Features

- 🌳 **Sidebar Interface**: Manage all your worktrees from a dedicated sidebar in VS Code
- ✨ **Quick Creation**: Create new worktrees with a single click
- 🚀 **Auto-launch in Cursor**: Newly created worktrees automatically open in Cursor editor
- 🗑️ **Easy Deletion**: Delete single or multiple worktrees with directory cleanup
- 📁 **Smart Directory Structure**: Automatically organizes worktrees in `<repo-name>-worktree` folder
- 🔄 **Live Updates**: Worktree list automatically refreshes after operations

## 📦 Installation

### From VS Code Marketplace
1. Open VS Code
2. Go to Extensions (Cmd/Ctrl + Shift + X)
3. Search for "Git Worktree + Cursor Launcher"
4. Click Install

### For Development
```bash
git clone https://github.com/your-username/git-worktree-cursor
cd git-worktree-cursor
npm install
npm run compile
```

## 🚀 Usage

### Creating a New Worktree

**From Sidebar:**
1. Click the Git Worktree icon in the Activity Bar (left sidebar)
2. Click the **+** button in the Worktrees view
3. Enter your branch name (e.g., `feature/new-feature`)
4. The worktree will be created and automatically opened in Cursor

**From Command Palette:**
1. Press `Cmd/Ctrl + Shift + P`
2. Run "Git Worktree: Add and Open in Cursor"
3. Enter your branch name
4. Done! Your new worktree opens in Cursor

### Viewing Worktrees

Click the Git Worktree icon in the Activity Bar to see all worktrees. The main worktree is marked with "(main)".

### Deleting Worktrees

**Option 1: Individual Delete**
- Click the trash icon (🗑️) next to any worktree in the sidebar

**Option 2: Bulk Delete**
- Run "Git Worktree: Delete" from the Command Palette
- Select multiple worktrees using checkboxes
- Confirm deletion

### Directory Structure

Worktrees are automatically organized:
```
parent-directory/
├── your-repo/                 (main repository)
└── your-repo-worktree/        (auto-created)
    ├── feature/new-feature
    ├── bugfix/issue-123
    └── experiment/test
```

## 📋 Commands

| Command | Description |
|---------|-------------|
| `Git Worktree: Add and Open in Cursor` | Create a new worktree and open in Cursor |
| `Git Worktree: Delete` | Delete existing worktrees with multi-select |
| `Refresh Worktrees` | Manually refresh the worktree list |

## ⚙️ Requirements

- Git installed and available in PATH
- Cursor editor installed with command line tools
  - In Cursor: `Cmd+Shift+P` → `Shell Command: Install 'cursor' command in PATH`
- VS Code 1.75.0 or higher
- An active Git repository

## 🎯 Use Cases

- **Feature Development**: Work on multiple features without branch switching
- **Bug Fixes**: Keep your main branch clean while fixing bugs
- **Experimentation**: Try new ideas without affecting your main work
- **Code Reviews**: Check out PR branches in separate worktrees

## 🔧 Troubleshooting

### "cursor command not found"
1. Open Cursor editor
2. Press `Cmd+Shift+P` → `Shell Command: Install 'cursor' command in PATH`
3. Restart your terminal/VS Code

### Worktree creation fails
- Ensure you're in a Git repository
- Check if the branch name already exists
- Verify write permissions for the parent directory

### Extension not showing in sidebar
- Reload VS Code window (`Cmd/Ctrl + R`)
- Check if the extension is enabled

## 📝 Release Notes

### 1.0.0 - Initial Release
- ✅ Sidebar interface for worktree management
- ✅ Automatic worktree creation with Cursor integration
- ✅ Smart directory organization (`<repo>-worktree` structure)
- ✅ Single and bulk delete functionality
- ✅ Auto-refresh after operations
- ✅ Visual indicators for main worktree

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for the amazing Cursor editor community
- Inspired by the need for better worktree management in modern development workflows

---

**Note**: Remember to update the publisher name in `package.json` before publishing to the VS Code Marketplace.