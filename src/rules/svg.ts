import type { Rule } from "../type"
import fs from "node:fs"
import { to_html, Theme } from "ansi2"
import path from "path"

export const Svg: Rule = {
  id: "svg",
  match(filePath: string) {
    const fileExtension = path.extname(filePath)
    return [".svg"].includes(fileExtension)
  },
  async render(path: string) {
    const html = fs.readFileSync(path, "utf-8")
    return html
  },
}
