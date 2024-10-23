import type { Rule } from "../type"
import fs from "fs"
import path from "path"
import AdmZip from "adm-zip"
import unrar from 'node-unrar-js'

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
    const buf = Uint8Array.from(fs.readFileSync(filePath)).buffer;
    const extractor = await unrar.createExtractorFromData({ data: buf });
    const fileList = extractor.getFileList();

    for(const entry of fileList.fileHeaders){
      list.push({
        name: entry.name,
        path: entry.name,
        mode: 0,
        time: new Date(entry.time),
        size: entry.unpSize,
        compressedSize: entry.packSize,
        isDirectory: entry.flags.directory
      })
    }
  } else if (filePath.endsWith(".7z")) {
  } else if (filePath.endsWith(".tar")) {
  } else if (filePath.endsWith(".gz")) {
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
    const list =await getInfo(filePath)
    const html = renderTree(list)
    return html
  },
}
