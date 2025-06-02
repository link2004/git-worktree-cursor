import * as vscode from "vscode";
import * as cp from "child_process";
import * as path from "path";
import * as fs from "fs";
import { promisify } from "util";

const exec = promisify(cp.exec);

// ローカルファイルのパターン定義
const LOCAL_FILE_PATTERNS = [".env*", "*.local.*", "config.local.*", ".vscode/settings.json"];

interface Worktree {
  path: string;
  branch: string;
  isMain: boolean;
}

class WorktreeItem extends vscode.TreeItem {
  constructor(
    public readonly worktree: Worktree,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(worktree.branch, collapsibleState);
    this.tooltip = this.worktree.path;
    this.description = this.worktree.isMain ? "(main)" : "";
    this.contextValue = this.worktree.isMain ? "mainWorktree" : "worktree";
    this.iconPath = new vscode.ThemeIcon(this.worktree.isMain ? "git-branch" : "folder-opened");
  }
}

// ローカルファイルをコピーする関数
async function copyLocalFiles(sourcePath: string, targetPath: string): Promise<void> {
  try {
    for (const pattern of LOCAL_FILE_PATTERNS) {
      const sourceFiles = await findMatchingFiles(sourcePath, pattern);

      for (const sourceFile of sourceFiles) {
        const relativePath = path.relative(sourcePath, sourceFile);
        const targetFile = path.join(targetPath, relativePath);

        // ターゲットディレクトリが存在しない場合は作成
        const targetDir = path.dirname(targetFile);
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        // ファイルをコピー
        if (fs.existsSync(sourceFile)) {
          fs.copyFileSync(sourceFile, targetFile);
          console.log(`Copied local file: ${relativePath}`);
        }
      }
    }
  } catch (error) {
    console.error("Error copying local files:", error);
    // エラーが発生してもworktree作成は続行
  }
}

async function findMatchingFiles(basePath: string, pattern: string): Promise<string[]> {
  const matchingFiles: string[] = [];

  try {
    // glob的なパターンマッチングを簡易実装
    if (pattern.includes("*")) {
      const files = await getAllFiles(basePath);
      const regex = patternToRegex(pattern);

      for (const file of files) {
        const relativePath = path.relative(basePath, file);
        if (regex.test(relativePath)) {
          matchingFiles.push(file);
        }
      }
    } else {
      // 直接パス指定の場合
      const fullPath = path.join(basePath, pattern);
      if (fs.existsSync(fullPath)) {
        matchingFiles.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error finding files for pattern ${pattern}:`, error);
  }

  return matchingFiles;
}

async function getAllFiles(dir: string, files: string[] = []): Promise<string[]> {
  try {
    const dirents = fs.readdirSync(dir, { withFileTypes: true });

    for (const dirent of dirents) {
      const fullPath = path.join(dir, dirent.name);

      if (dirent.isDirectory()) {
        // .git ディレクトリなどは除外
        if (!dirent.name.startsWith(".git") && dirent.name !== "node_modules") {
          await getAllFiles(fullPath, files);
        }
      } else {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // ディレクトリアクセスエラーは無視
  }

  return files;
}

function patternToRegex(pattern: string): RegExp {
  // 簡易的なglob to regex変換
  let regexPattern = pattern.replace(/\./g, "\\.").replace(/\*/g, ".*").replace(/\?/g, ".");

  return new RegExp(`^${regexPattern}$`);
}

class WorktreeProvider implements vscode.TreeDataProvider<WorktreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<WorktreeItem | undefined | null | void> =
    new vscode.EventEmitter<WorktreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<WorktreeItem | undefined | null | void> =
    this._onDidChangeTreeData.event;

  constructor(private workspaceRoot: string | undefined) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: WorktreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: WorktreeItem): Thenable<WorktreeItem[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage("No workspace folder open");
      return Promise.resolve([]);
    }

    if (element) {
      return Promise.resolve([]);
    } else {
      return this.getWorktrees();
    }
  }

  private async getWorktrees(): Promise<WorktreeItem[]> {
    try {
      const { stdout: worktreeList } = await exec("git worktree list", { cwd: this.workspaceRoot });
      const worktrees = worktreeList
        .trim()
        .split("\n")
        .map((line) => {
          const parts = line.trim().split(/\s+/);
          const worktreePath = parts[0];
          const branch = parts[2] ? parts[2].replace(/[\[\]]/g, "") : "";
          return {
            path: worktreePath,
            branch: branch || "main",
            isMain: worktreePath === this.workspaceRoot,
          };
        });

      return worktrees.map((wt) => new WorktreeItem(wt, vscode.TreeItemCollapsibleState.None));
    } catch (error) {
      console.error("Error getting worktrees:", error);
      return [];
    }
  }
}

export function activate(context: vscode.ExtensionContext) {
  console.log("Git Worktree + cursor Editor is now active!");

  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  const workspaceRoot = workspaceFolder?.uri.fsPath;

  // Create tree data provider
  const worktreeProvider = new WorktreeProvider(workspaceRoot);
  vscode.window.registerTreeDataProvider("gitWorktreeExplorer", worktreeProvider);

  // Register refresh command
  let refreshDisposable = vscode.commands.registerCommand(
    "git-worktree-cursor.refreshWorktrees",
    () => {
      worktreeProvider.refresh();
    }
  );

  let disposable = vscode.commands.registerCommand("git-worktree-cursor.addWorktree", async () => {
    try {
      // Get the workspace folder
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        vscode.window.showErrorMessage("No workspace folder open");
        return;
      }

      // Get the repository name
      const repoPath = workspaceFolder.uri.fsPath;
      const repoName = path.basename(repoPath);

      // Prompt for branch name
      const branchName = await vscode.window.showInputBox({
        prompt: "Enter branch name",
        placeHolder: "feature/my-new-feature",
        validateInput: (value) => {
          if (!value || value.trim() === "") {
            return "Branch name cannot be empty";
          }
          // Basic validation for branch names
          if (!/^[a-zA-Z0-9\/_-]+$/.test(value)) {
            return "Branch name contains invalid characters";
          }
          return null;
        },
      });

      if (!branchName) {
        return; // User cancelled
      }

      // Create default parent directory structure
      // Get the parent directory of the current repository
      const repoParentDir = path.dirname(repoPath);

      // Create the worktree parent directory name: <repo-name>-worktree
      const worktreeParentDirName = `${repoName}-worktree`;
      const worktreeParentPath = path.join(repoParentDir, worktreeParentDirName);

      // Create the worktree path: <repo-name>-worktree/<branch-name>
      const worktreePath = path.join(worktreeParentPath, branchName);

      // Ensure the parent directory exists
      if (!fs.existsSync(worktreeParentPath)) {
        fs.mkdirSync(worktreeParentPath, { recursive: true });
      }

      // Show progress
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Creating Git Worktree",
          cancellable: false,
        },
        async (progress) => {
          progress.report({ increment: 0, message: "Creating worktree..." });

          try {
            // Execute git worktree add command
            const gitCommand = `git worktree add "${worktreePath}" -b "${branchName}"`;
            await exec(gitCommand, { cwd: repoPath });

            progress.report({ increment: 30, message: "Copying local files..." });

            // ローカルファイルをコピー
            await copyLocalFiles(repoPath, worktreePath);

            progress.report({ increment: 70, message: "Opening in Cursor..." });

            // Open in Cursor
            const cursorCommand = `cursor "${worktreePath}"`;
            await exec(cursorCommand);

            progress.report({ increment: 100, message: "Complete!" });

            vscode.window.showInformationMessage(
              `Successfully created worktree at '${worktreeParentDirName}/${branchName}' and opened in Cursor`
            );
            worktreeProvider.refresh();
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            vscode.window.showErrorMessage(`Failed to create worktree: ${errorMessage}`);
            throw error;
          }
        }
      );
    } catch (error) {
      console.error("Error in git-worktree-cursor.addWorktree:", error);
    }
  });

  context.subscriptions.push(disposable);

  let deleteDisposable = vscode.commands.registerCommand(
    "git-worktree-cursor.deleteWorktree",
    async (item?: WorktreeItem) => {
      try {
        // Get the workspace folder
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
          vscode.window.showErrorMessage("No workspace folder open");
          return;
        }

        const repoPath = workspaceFolder.uri.fsPath;

        let selected:
          | Array<{
              label: string;
              description: string;
              worktree: { path: string; branch: string };
            }>
          | undefined;

        if (item && !item.worktree.isMain) {
          // Single item from context menu
          selected = [
            {
              label: item.worktree.branch,
              description: item.worktree.path,
              worktree: item.worktree,
            },
          ];
        } else {
          // Get list of worktrees
          const { stdout: worktreeList } = await exec("git worktree list", { cwd: repoPath });
          const worktrees = worktreeList
            .trim()
            .split("\n")
            .map((line) => {
              const parts = line.trim().split(/\s+/);
              const path = parts[0];
              const branch = parts[2] ? parts[2].replace(/[\[\]]/g, "") : "";
              return { path, branch, label: `${branch} (${path})` };
            })
            .filter((wt) => wt.path !== repoPath); // Exclude main worktree

          if (worktrees.length === 0) {
            vscode.window.showInformationMessage("No worktrees found to delete");
            return;
          }

          // Show quick pick with multi-select
          selected = await vscode.window.showQuickPick(
            worktrees.map((wt) => ({
              label: wt.label,
              description: wt.path,
              picked: false,
              worktree: wt,
            })),
            {
              canPickMany: true,
              placeHolder: "Select worktrees to delete",
              title: "Delete Git Worktrees",
            }
          );

          if (!selected || selected.length === 0) {
            return; // User cancelled
          }
        }

        // Confirm deletion
        const deleteMessage = `Are you sure you want to delete ${
          selected.length
        } worktree director${selected.length > 1 ? "ies" : "y"}?`;

        const confirm = await vscode.window.showWarningMessage(
          deleteMessage,
          "Directory and Branch",
          "Directory Only",
          "Cancel"
        );

        if (confirm === "Cancel") {
          return;
        }

        const deletionOption =
          confirm === "Directory Only" ? "directory-only" : "directory-and-branch";

        // Delete selected worktrees
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: "Deleting Git Worktrees",
            cancellable: false,
          },
          async (progress) => {
            const total = selected!.length;
            let completed = 0;

            for (const item of selected!) {
              progress.report({
                increment: 100 / total,
                message: `Deleting ${item.worktree.branch}...`,
              });

              try {
                // Remove worktree
                await exec(`git worktree remove --force "${item.worktree.path}"`, {
                  cwd: repoPath,
                });

                // If user chose to delete branch as well
                if (deletionOption === "directory-and-branch") {
                  try {
                    // Delete local branch
                    await exec(`git branch -D "${item.worktree.branch}"`, {
                      cwd: repoPath,
                    });
                  } catch (branchError) {
                    // Branch might not exist or might be the current branch
                    console.warn(`Failed to delete branch ${item.worktree.branch}:`, branchError);
                  }
                }

                completed++;
              } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                vscode.window.showErrorMessage(
                  `Failed to delete worktree ${item.worktree.branch}: ${errorMessage}`
                );
              }
            }

            if (completed > 0) {
              const successMessage =
                deletionOption === "directory-and-branch"
                  ? `Successfully deleted ${completed} worktree director${
                      completed > 1 ? "ies" : "y"
                    } and local branch${completed > 1 ? "es" : ""}`
                  : `Successfully deleted ${completed} worktree director${
                      completed > 1 ? "ies" : "y"
                    }`;
              vscode.window.showInformationMessage(successMessage);
              worktreeProvider.refresh();
            }
          }
        );
      } catch (error) {
        console.error("Error in git-worktree-cursor.deleteWorktree:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Failed to list worktrees: ${errorMessage}`);
      }
    }
  );

  context.subscriptions.push(refreshDisposable);
  context.subscriptions.push(deleteDisposable);
}

export function deactivate() {}
