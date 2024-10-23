import type { Rule } from "../type"
import fs from "fs"
import path from "path"

function renderTree() {}

export const Zip: Rule = {
  id: "zip",
  match(filePath: string) {
    const fileExtension = path.extname(filePath)
    return [".zip", ".rar", ".7z", ".tar", ".gz"].includes(fileExtension)
  },
  async render(path: string) {
    const html = fs.readFileSync(path, "utf-8")
    return html
  },
}
