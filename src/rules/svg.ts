import type { Rule } from "../type"
import fs from "fs"
import path from "path"

export const Svg: Rule = {
  id: "svg",
  match(filePath: string) {
    const fileExtension = path.extname(filePath)
    return [".svg"].includes(fileExtension)
  },
  async render(filePath: string) {
    const html = fs.readFileSync(filePath, "utf-8")
    return html
  },
}
