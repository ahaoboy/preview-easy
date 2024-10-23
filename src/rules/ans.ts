import type { Rule } from "../type"
import fs from "fs"
import path from "path"
import { to_html, Theme } from "ansi2"

export const Ans: Rule = {
  id: "ans",
  match(filePath: string) {
    const fileExtension = path.extname(filePath)
    return [".ans", ".ansi"].includes(fileExtension)
  },
  async render(filePath: string) {
    const s = fs.readFileSync(filePath, "utf-8")

    // FIXME: html looks better than svg?
    const html = to_html(s, Theme.Vscode)
    // panel.webview.html = to_svg(s, Theme.Vscode)
    return html
  },
}
