# Git Worktree + cursor Editor

A VS Code extension that simplifies Git worktree management with seamless Cursor editor integration. Create, view, and delete Git worktrees directly from VS Code's interface.

## ✨ Features

- 🌳 **Visual Worktree Explorer**: View all your Git worktrees in a dedicated sidebar panel
- ✨ **One-Click Creation**: Create new worktrees with automatic branch creation
- 🚀 **Cursor Integration**: New worktrees automatically open in Cursor editor
- 🗑️ **Easy Cleanup**: Delete single or multiple worktrees with confirmation
- 📁 **Organized Structure**: Worktrees are automatically organized in a dedicated folder
- 🔄 **Real-time Updates**: The worktree list refreshes automatically after operations

## 📦 Installation

### From VS Code Marketplace

1. Open VS Code
2. Go to Extensions (Cmd/Ctrl + Shift + X)
3. Search for "Git Worktree + cursor Editor"
4. Click Install

## 🚀 How to Use

### Viewing Your Worktrees

1. **Open the Worktree Explorer**
   - Look for the Git Worktree icon in VS Code's Activity Bar (left sidebar)
   - Click it to open the Worktree Explorer panel
2. **Understanding the Display**
   - Each worktree shows its branch name
   - The main worktree is marked with "(main)" and a git-branch icon
   - Other worktrees show with a folder icon
   - Hover over any worktree to see its full path

### Creating a New Worktree

1. **Click the + Button**
   - In the Worktree Explorer panel, click the **+** icon in the top toolbar
2. **Enter Branch Name**
   - A prompt will appear asking for the branch name
   - Use descriptive names like `feature/user-auth` or `bugfix/login-issue`
   - Only use letters, numbers, hyphens, underscores, and forward slashes
3. **Automatic Actions**
   - The extension creates a new Git worktree
   - Creates a new branch with your specified name
   - Opens the new worktree in Cursor editor automatically
   - Shows a progress notification during creation

### Deleting Worktrees

**Method 1: Right-Click Delete (Single)**

1. Right-click on any worktree (except main) in the explorer
2. Select "Delete Worktree"
3. Confirm the deletion when prompted

**Method 2: Command Palette (Multiple)**

1. Open Command Palette (Cmd/Ctrl + Shift + P)
2. Type and select "Git Worktree: Delete"
3. Check the worktrees you want to delete
4. Click OK and confirm the deletion

**Note**: The main worktree cannot be deleted

### Refreshing the List

- The worktree list refreshes automatically after creating or deleting
- To manually refresh: Click the refresh icon (↻) in the Worktree Explorer toolbar

## 📁 How Worktrees are Organized

The extension automatically creates an organized folder structure:

```
your-projects-folder/
├── my-app/                    ← Your main repository
└── my-app-worktree/          ← Auto-created folder for worktrees
    ├── feature/user-auth/     ← Each worktree in its own folder
    ├── bugfix/login-issue/
    └── experiment/new-ui/
```

Each worktree is a complete, independent copy of your repository where you can:

- Switch branches without affecting other work
- Run different versions simultaneously
- Test changes in isolation

## 📋 Available Commands

Access these through the Command Palette (Cmd/Ctrl + Shift + P):

| Command                                | What it Does                                         |
| -------------------------------------- | ---------------------------------------------------- |
| `Git Worktree: Add and Open in Cursor` | Creates a new worktree and opens it in Cursor        |
| `Git Worktree: Delete`                 | Shows a list to select and delete multiple worktrees |
| `Git Worktree: Refresh`                | Manually updates the worktree list                   |

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
