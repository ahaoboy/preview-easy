import type { Rule } from "../type"
import fs from "fs"
import { renderToHtml } from "../share"
export const RawImage: Rule = {
  id: "raw-image",
  match(filePath: string) {
    return [".bgra"].some((i) => filePath.endsWith(i))
  },
  async render(filePath: string) {
    const name = filePath.split("/").at(-1)!
    const list = name.split(".")
    const buf = fs.readFileSync(filePath)
    const c = 4
    const w = +list.at(-2)!
    const h = buf.length / w / c
    for (let i = 0; i < w * h * c; i += 4) {
      const b = buf[i]
      const r = buf[i + 2]
      buf[i] = r
      buf[i + 2] = b
    }
    const bufStr = JSON.stringify(Array.from(buf))
    const html = renderToHtml(`
<style>
body {
  display: grid;
  place-items: center;
  height: 100vh;
  margin: 0;
}
</style>
<script>
const b = new Uint8ClampedArray(${bufStr});
const canvas = document.createElement("canvas");
const h = b.length/${w}/${c}
canvas.width = ${w};
canvas.height = h;
const ctx = canvas.getContext("2d");
const imageData = new ImageData(b, ${w}, h);
ctx.putImageData(imageData, 0, 0);
document.body.append(canvas);
</script>
`)
    return html
  },
}
