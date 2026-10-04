const { Resvg } = require("@resvg/resvg-js");
const fs = require("fs");
const path = require("path");
const dir = ".preview";
const files = process.argv.slice(2).length ? process.argv.slice(2) : fs.readdirSync(dir).filter(f => f.endsWith(".svg"));
for (const f of files) {
  const name = path.basename(f, ".svg");
  const svg = fs.readFileSync(path.join(dir, name + ".svg"), "utf8");
  const r = new Resvg(svg, { background: "#09090b", fitTo: { mode: "width", value: 760 } });
  fs.writeFileSync(path.join(dir, name + ".png"), r.render().asPng());
}
console.log("rasterized", files.length);
