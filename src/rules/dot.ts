import type { Rule } from "../type"
import fs from "fs"
import path from "path"
import { exec } from "child_process"
import MD5 from "crypto-js/md5"
import os from "os"

async function getSvg(filePath: string): Promise<string | undefined> {
  const hash = MD5(filePath).toString()
  const tempDir = os.tmpdir()
  const svgFilePath = path.join(tempDir, `${hash}.svg`)

  const cmd = `dot -Tsvg "${filePath}" -o "${svgFilePath}"`
  if (!fs.existsSync(svgFilePath)) {
    await new Promise((resolve, reject) =>
      exec(cmd, (error, stdout, stderr) => {
        if (error || stderr) {
          reject(error || stderr)
        } else {
          resolve(stdout)
        }
      }),
    )
  }

  return svgFilePath
}

export const Dot: Rule = {
  id: "dot",
  match(filePath: string) {
    const fileExtension = path.extname(filePath)
    return [".dot"].includes(fileExtension)
  },
  async render(filePath: string) {
    const svg = await getSvg(filePath)
    if (!svg) {
      return
    }
    return fs.readFileSync(svg, "utf8")
  },
}
