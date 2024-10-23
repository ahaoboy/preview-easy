import * as vscode from "vscode"
import { Html, Svg, Ans, Wem, Zip } from "./rules"

const Rules = [Html, Svg, Ans, Wem, Zip]

let panel: vscode.WebviewPanel | undefined
let statusBarItem: vscode.StatusBarItem | undefined

/**
 * Checks if file is ans
 * @param fileName: string
 * @returns: boolean
 */
function isMatch(fileName: string): boolean {
  return !!Rules.find((i) => i.match(fileName))
}

/**
 * Generates the webview content
 * @param fileName: string
 */
async function updateWebviewContent(fileName: string) {
  if (panel) {
    const r = Rules.find((i) => i.match(fileName))
    if (r) {
      const html = await r.render(fileName)
      if (html.length) {
        panel.webview.html = html
      }
    }
  }
}

/**
 * Opens the viewer
 * @param fileName: string
 */
async function openViewer(fileName: string): Promise<void> {
  panel?.reveal(vscode.ViewColumn.One)

  if (!panel) {
    panel = vscode.window.createWebviewPanel(
      "Viewer",
      "Viewer",
      vscode.ViewColumn.One,
      { enableScripts: true },
    )

    // Delete panel on dispose
    panel.onDidDispose(() => {
      panel = undefined
    })
  }

  updateWebviewContent(fileName)
}

export function activate(context: vscode.ExtensionContext): void {
  // Customize statusbar
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    10000,
  )

  statusBarItem.text = "Viewer"
  statusBarItem.tooltip = "Looking for files"
  statusBarItem.command = "extension.openExtensionPage"
  statusBarItem.show()

  // Open extension's page on click over statusbar item
  const openExtensionPageCommand = vscode.commands.registerCommand(
    "extension.openExtensionPage",
    () => {
      const extensionPageUrl = "vscode:extension/ahaoboy.preview-easy"
      vscode.env.openExternal(vscode.Uri.parse(extensionPageUrl))
    },
  )

  // Open preview with command 'ctrl+shift+t' when text editor is open in an svg file
  const openPreviewOnFocusCommand = vscode.commands.registerCommand(
    "extension.openPreviewOnFocus",
    () => {
      const activeTextEditor = vscode.window.activeTextEditor

      if (activeTextEditor) {
        openViewer(activeTextEditor.document.fileName)
      } else {
        vscode.window.showInformationMessage("There's no open textfile.")
      }
    },
  )

  // Open preview with mouse's right button
  const openPreviewMenuCommand = vscode.commands.registerCommand(
    "extension.openPreviewMenu",
    (resource) => {
      if (resource) {
        openViewer(resource.fsPath)
      }
    },
  )

  // Open using editor title button
  const openPreviewOnEditorButton = vscode.commands.registerCommand(
    "extension.openPreviewOnEditorShortcut",
    (resource) => {
      if (resource) {
        openViewer(resource.fsPath)
      }
    },
  )

  // Create tab rendering svg on click in svg file
  const openTextDocDisposable = vscode.workspace.onDidOpenTextDocument(
    async (document) => {
      const fileName: string = document.fileName

      if (isMatch(fileName)) {
        const selectedOption = !panel
          ? await vscode.window.showInformationMessage(
              "Open preview?",
              "Yes",
              "No",
            )
          : "Yes"

        if (selectedOption !== "Yes") {
          return
        }

        openViewer(fileName)
      }
    },
  )

  context.subscriptions.push(statusBarItem)
  context.subscriptions.push(openExtensionPageCommand)
  context.subscriptions.push(openPreviewOnFocusCommand)
  context.subscriptions.push(openPreviewMenuCommand)
  context.subscriptions.push(openPreviewOnEditorButton)
  context.subscriptions.push(openTextDocDisposable)
}

export function deactivate(): void {
  panel?.dispose()
  statusBarItem?.dispose()
}

module.exports = {
  activate,
  deactivate,
}
