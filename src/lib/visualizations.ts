import fs from "fs";
import path from "path";

const VIZ_DIR = path.join(process.cwd(), "public/data");
const TITLES_FILE = path.join(process.cwd(), "content/data-visualizations.json");
const IMAGE_EXT = /\.(png|jpe?g|webp|gif|svg)$/i;

export interface Visualization {
  src: string;
  title: string;
  alt: string;
}

type TitleMap = Record<string, { title?: string }>;

function readTitles(): TitleMap {
  if (!fs.existsSync(TITLES_FILE)) return {};
  return JSON.parse(fs.readFileSync(TITLES_FILE, "utf-8"));
}

// Every image in public/data becomes an entry. Its title comes from
// content/data-visualizations.json, falling back to the filename.
export function getAllVisualizations(): Visualization[] {
  if (!fs.existsSync(VIZ_DIR)) return [];
  const titles = readTitles();

  return fs
    .readdirSync(VIZ_DIR)
    .filter((f) => IMAGE_EXT.test(f))
    .map((filename) => {
      const name = filename.replace(IMAGE_EXT, "");
      return {
        src: `/data/${encodeURIComponent(filename)}`,
        title: titles[filename]?.title || name,
        alt: name,
      };
    })
    .sort((a, b) => a.alt.localeCompare(b.alt));
}
