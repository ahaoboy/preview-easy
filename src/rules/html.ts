import type { Rule } from "../type"
import fs from "fs"
import path from "path"

export const Html: Rule = {
  id: "html",
  match(filePath: string) {
    const fileExtension = path.extname(filePath)
    return [".html"].includes(fileExtension)
  },
  render(filePath: string) {
    const html = fs.readFileSync(filePath, "utf-8")
    return html
  },
}
