const vscode = require('vscode');

let pendingOpenTimer;

async function openPreview(url = 'http://localhost:3000/') {
  const target = typeof url === 'string' && url ? url : 'http://localhost:3000/';

  try {
    await vscode.commands.executeCommand('workbench.action.browser.open', {
      url: target,
      reuseUrlFilter: target,
    });
  } catch (error) {
    try {
      await vscode.commands.executeCommand('simpleBrowser.show', target);
    } catch (fallbackError) {
      const message = fallbackError && fallbackError.message ? fallbackError.message : fallbackError;
      vscode.window.showErrorMessage(`Could not open Livermore preview: ${message}`);
    }
  }
}

function activate(context) {
  context.subscriptions.push(
    vscode.window.registerUriHandler({
      handleUri(uri) {
        const params = new URLSearchParams(uri.query);
        const url = params.get('url') || 'http://localhost:3000/';

        if (pendingOpenTimer) {
          clearTimeout(pendingOpenTimer);
        }

        pendingOpenTimer = setTimeout(() => {
          pendingOpenTimer = undefined;
          openPreview(url);
        }, 300);
      },
    }),
  );
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
