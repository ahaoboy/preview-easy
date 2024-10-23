import type { Rule } from "../type"
import fs from "fs"
import path from "path"
import { exec } from "child_process"
import MD5 from "crypto-js/md5"
import os from "os"
import { renderToHtml } from "../share"

async function getMp3(filePath: string): Promise<string | undefined> {
  const hash = MD5(filePath).toString()
  const tempDir = os.tmpdir()
  const mp3FilePath = path.join(tempDir, `${hash}.mp3`)
  const cmd = `vgmstream-cli "${filePath}" -o "${mp3FilePath}"`
  if (!fs.existsSync(mp3FilePath)) {
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

  return mp3FilePath
}

export const Wem: Rule = {
  id: "wem",
  match(filePath: string) {
    const fileExtension = path.extname(filePath)
    return [".wem"].includes(fileExtension)
  },
  async render(filePath: string) {
    const mp3 = await getMp3(filePath)
    if (!mp3) {
      return
    }
    const BASE64_AUDIO_DATA = fs.readFileSync(mp3).toString("base64")
    return renderToHtml(`
<style>
body {
  display: grid;
  place-items: center;
  height: 100vh;
  margin: 0;
}
</style>
<audio controls>
<source src="data:audio/mp3;base64,${BASE64_AUDIO_DATA}" type="audio/mp3">
</audio>
`)
  },
}
