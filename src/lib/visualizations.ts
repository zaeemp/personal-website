import fs from "fs";
import path from "path";

const VIZ_DIR = path.join(process.cwd(), "public/data");
const META_FILE = path.join(process.cwd(), "content/data-visualizations.json");
const IMAGE_EXT = /\.(png|jpe?g|webp|gif|svg)$/i;

export interface Visualization {
  src: string;
  title: string;
  alt: string;
  date: string; // YYYY-MM-DD, or "" if not set
  tags: string[];
  width: number;
  height: number;
}

// Reads pixel size from a PNG or JPEG header so the page can reserve the right
// space before the image loads. Other formats fall back to a 4:5 portrait.
function imageSize(file: string): { width: number; height: number } {
  const buf = fs.readFileSync(file);
  if (buf.readUInt32BE(0) === 0x89504e47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length) {
      const marker = buf[i + 1];
      const len = buf.readUInt16BE(i + 2);
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5) };
      }
      i += 2 + len;
    }
  }
  return { width: 1600, height: 2000 };
}

type MetaMap = Record<string, { title?: string; date?: string; tags?: string[] }>;

function readMeta(): MetaMap {
  if (!fs.existsSync(META_FILE)) return {};
  return JSON.parse(fs.readFileSync(META_FILE, "utf-8"));
}

// Every image in public/data becomes an entry. Its title, date and tags come
// from content/data-visualizations.json; the title falls back to the filename.
// Newest first.
export function getAllVisualizations(): Visualization[] {
  if (!fs.existsSync(VIZ_DIR)) return [];
  const meta = readMeta();

  return fs
    .readdirSync(VIZ_DIR)
    .filter((f) => IMAGE_EXT.test(f))
    .map((filename) => {
      const name = filename.replace(IMAGE_EXT, "");
      const m = meta[filename] ?? {};
      return {
        src: `/data/${encodeURIComponent(filename)}`,
        title: m.title || name,
        alt: name,
        date: m.date ?? "",
        tags: (m.tags ?? []).map((t) => t.toLowerCase()),
        ...imageSize(path.join(VIZ_DIR, filename)),
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date) || a.alt.localeCompare(b.alt));
}
