import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';
import { promisify } from 'util';

const exec = promisify(cp.exec);

export function activate(context: vscode.ExtensionContext) {
    console.log('Git Worktree + Cursor Launcher is now active!');

    let disposable = vscode.commands.registerCommand('git-worktree-cursor.addWorktree', async () => {
        try {
            // Get the workspace folder
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                vscode.window.showErrorMessage('No workspace folder open');
                return;
            }

            // Get the repository name
            const repoPath = workspaceFolder.uri.fsPath;
            const repoName = path.basename(repoPath);

            // Prompt for branch name
            const branchName = await vscode.window.showInputBox({
                prompt: 'Enter branch name',
                placeHolder: 'feature/my-new-feature',
                validateInput: (value) => {
                    if (!value || value.trim() === '') {
                        return 'Branch name cannot be empty';
                    }
                    // Basic validation for branch names
                    if (!/^[a-zA-Z0-9\/_-]+$/.test(value)) {
                        return 'Branch name contains invalid characters';
                    }
                    return null;
                }
            });

            if (!branchName) {
                return; // User cancelled
            }

            // Prompt for parent directory
            const parentDirUri = await vscode.window.showOpenDialog({
                canSelectFiles: false,
                canSelectFolders: true,
                canSelectMany: false,
                openLabel: 'Select Parent Directory for Worktree',
                title: 'Select Parent Directory'
            });

            if (!parentDirUri || parentDirUri.length === 0) {
                return; // User cancelled
            }

            const parentDir = parentDirUri[0].fsPath;

            // Create branch suffix from branch name
            // Convert feature/branch-name to feature-branch-name
            const branchSuffix = branchName.replace(/\//g, '-');
            
            // Create worktree directory name
            const worktreeDirName = `${repoName}-${branchSuffix}`;
            const worktreePath = path.join(parentDir, worktreeDirName);

            // Show progress
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Creating Git Worktree',
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 0, message: 'Creating worktree...' });

                try {
                    // Execute git worktree add command
                    const gitCommand = `git worktree add "${worktreePath}" -b "${branchName}"`;
                    await exec(gitCommand, { cwd: repoPath });

                    progress.report({ increment: 50, message: 'Opening in Cursor...' });

                    // Open in Cursor
                    const cursorCommand = `cursor "${worktreePath}"`;
                    await exec(cursorCommand);

                    progress.report({ increment: 100, message: 'Complete!' });

                    vscode.window.showInformationMessage(
                        `Successfully created worktree '${worktreeDirName}' and opened in Cursor`
                    );
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    vscode.window.showErrorMessage(`Failed to create worktree: ${errorMessage}`);
                    throw error;
                }
            });

        } catch (error) {
            console.error('Error in git-worktree-cursor.addWorktree:', error);
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}