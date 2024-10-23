import type { Rule } from "../type"
import path from "path"
import AdmZip from "adm-zip"
import { createExtractorFromFile } from "node-unrar-js/esm"
import rarWasmBase64 from "node-unrar-js/esm/js/unrar.wasm"
import * as tar from "tar"
import fs from "fs"
import _7z from "7zip-min"

type Info = {
  name: string
  path: string
  mode: number
  time: Date
  size: number
  isDirectory: boolean
  compressedSize: number
}

function renderTree(list: Info[]): string {
  const header = ["path", "compressedSize", "size", "time"]
    .map((i) => `<th>${i}</th>`)
    .join("")

  const rows = list
    .map(
      (i) => `<tr>
    <td>${i.path}</td>
    <td>${i.compressedSize}</td>
    <td>${i.size}</td>
    <td>${i.time}</td>
    </tr>`,
    )
    .join("")

  return `
<table>
<thead>
    <tr>
        ${header}
    </tr>
</thead>
<tbody>
    ${rows}
</tbody>
</table>
`
}

async function getInfo(filePath: string): Promise<Info[]> {
  const list: Info[] = []
  if (filePath.endsWith(".zip")) {
    const zip = new AdmZip(filePath)
    for (const entry of zip.getEntries()) {
      list.push({
        name: entry.name,
        path: entry.entryName,
        mode: entry.header.made,
        time: entry.header.time,
        size: entry.header.size,
        compressedSize: entry.header.compressedSize,
        isDirectory: entry.isDirectory,
      })
    }
  } else if (filePath.endsWith(".rar")) {
    const wasmBinary = Buffer.from(rarWasmBase64, "base64")
    const extractor = await createExtractorFromFile({
      wasmBinary,
      filepath: filePath,
    })
    const fileList = extractor.getFileList()
    for (const entry of [...fileList.fileHeaders]) {
      list.push({
        name: entry.name,
        path: entry.name,
        mode: 0,
        time: new Date(entry.time),
        size: entry.unpSize,
        compressedSize: entry.packSize,
        isDirectory: entry.flags.directory,
      })
    }
  } else if (filePath.endsWith(".7z")) {
    _7z.list("./test.7z", (err, result) => {
      if (err) {
        return []
      }
      for (const entry of result) {
        list.push({
          name: entry.name,
          path: entry.name,
          mode: 0,
          time: new Date(entry.time),
          size: +entry.size,
          compressedSize: +entry.compressed,
          isDirectory: false,
        })
      }
    })
  } else if (filePath.endsWith(".tar") || filePath.endsWith(".gz")) {
    return await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(tar.t())
        .on("entry", (entry) => {
          list.push({
            name: entry.path,
            size: entry.size,
            path: entry.path,
            mode: 0,
            time: new Date(0),
            compressedSize: 0,
            isDirectory: entry.type === "Directory",
          })
        })
        .on("finish", () => {
          resolve(list)
        })
        .on("error", (error) => {
          reject(`Error: ${error.message}`)
        })
    })
  }
  return list
}

export const Zip: Rule = {
  id: "zip",
  match(filePath: string) {
    const fileExtension = path.extname(filePath)
    return [".zip", ".rar", ".7z", ".tar", ".gz"].includes(fileExtension)
  },
  async render(filePath: string) {
    const list = await getInfo(filePath)
    const html = renderTree(list)
    return html
  },
}
