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

    let deleteDisposable = vscode.commands.registerCommand('git-worktree-cursor.deleteWorktree', async () => {
        try {
            // Get the workspace folder
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                vscode.window.showErrorMessage('No workspace folder open');
                return;
            }

            const repoPath = workspaceFolder.uri.fsPath;

            // Get list of worktrees
            const { stdout: worktreeList } = await exec('git worktree list', { cwd: repoPath });
            const worktrees = worktreeList.trim().split('\n').map(line => {
                const parts = line.trim().split(/\s+/);
                const path = parts[0];
                const branch = parts[2] ? parts[2].replace(/[\[\]]/g, '') : '';
                return { path, branch, label: `${branch} (${path})` };
            }).filter(wt => wt.path !== repoPath); // Exclude main worktree

            if (worktrees.length === 0) {
                vscode.window.showInformationMessage('No worktrees found to delete');
                return;
            }

            // Show quick pick with multi-select
            const selected = await vscode.window.showQuickPick(
                worktrees.map(wt => ({
                    label: wt.label,
                    description: wt.path,
                    picked: false,
                    worktree: wt
                })),
                {
                    canPickMany: true,
                    placeHolder: 'Select worktrees to delete',
                    title: 'Delete Git Worktrees'
                }
            );

            if (!selected || selected.length === 0) {
                return; // User cancelled
            }

            // Confirm deletion
            const confirm = await vscode.window.showWarningMessage(
                `Are you sure you want to delete ${selected.length} worktree(s)? This will remove the directories permanently.`,
                'Yes, Delete',
                'Cancel'
            );

            if (confirm !== 'Yes, Delete') {
                return;
            }

            // Delete selected worktrees
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Deleting Git Worktrees',
                cancellable: false
            }, async (progress) => {
                const total = selected.length;
                let completed = 0;

                for (const item of selected) {
                    progress.report({ 
                        increment: (100 / total), 
                        message: `Deleting ${item.worktree.branch}...` 
                    });

                    try {
                        // Remove worktree
                        await exec(`git worktree remove --force "${item.worktree.path}"`, { cwd: repoPath });
                        completed++;
                    } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : String(error);
                        vscode.window.showErrorMessage(`Failed to delete worktree ${item.worktree.branch}: ${errorMessage}`);
                    }
                }

                if (completed > 0) {
                    vscode.window.showInformationMessage(
                        `Successfully deleted ${completed} worktree(s)`
                    );
                }
            });

        } catch (error) {
            console.error('Error in git-worktree-cursor.deleteWorktree:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            vscode.window.showErrorMessage(`Failed to list worktrees: ${errorMessage}`);
        }
    });

    context.subscriptions.push(deleteDisposable);
}

export function deactivate() {}