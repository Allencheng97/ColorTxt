import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const MdictMod = require("mdict-js");
const Mdict = MdictMod.default || MdictMod.Mdict || MdictMod;

const mdx =
  "c:\\Users\\NG\\Downloads\\词典\\恶魔的奶爸推荐词典+1.6G资源\\[MDict电子词典资源合辑].CALD3_v1.4.mdx";
const dict = new Mdict(mdx);

const editor = dict.lookup("editor");
const html = editor?.definition || "";
const hrefs = [...html.matchAll(/href=(["'])([^"']+)\1/gi)].map((m) => m[2]);
const entryHrefs = hrefs.filter((h) => /^(?:entry|bword):\/\//i.test(h));
const otherInteresting = hrefs
  .filter((h) => !/^(?:sound|entry|bword|https?:|data:|#)/i.test(h))
  .slice(0, 30);

const target =
  entryHrefs.find((h) => /publishing/i.test(h)) ||
  entryHrefs.find((h) => /People/i.test(h)) ||
  entryHrefs[0];

let targetKey = target ? target.replace(/^(?:entry|bword):\/\//i, "") : "";
try {
  targetKey = decodeURIComponent(targetKey);
} catch {}
targetKey = targetKey.replace(/&amp;/gi, "&");

const sub = targetKey ? dict.lookup(targetKey) : null;
const subHtml = sub?.definition || "";
const subHrefs = [...subHtml.matchAll(/href=(["'])([^"']+)\1/gi)]
  .map((m) => m[2])
  .slice(0, 40);

writeFileSync(
  "tmp-entry-links.json",
  JSON.stringify(
    {
      entryHrefs: entryHrefs.slice(0, 20),
      otherInteresting,
      target,
      targetKey,
      subKey: sub?.keyText,
      subLen: subHtml.length,
      subHead: subHtml.slice(0, 500),
      subHrefs,
    },
    null,
    2,
  ),
  "utf8",
);
console.log(
  JSON.stringify(
    {
      entrySample: entryHrefs.slice(0, 8),
      target,
      targetKey,
      subOk: !!(subHtml && subHtml.length > 10),
      subHrefs: subHrefs.slice(0, 15),
    },
    null,
    2,
  ),
);
