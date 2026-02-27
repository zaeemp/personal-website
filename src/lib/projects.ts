import fs from "fs";
import path from "path";
import matter from "gray-matter";

const PROJECTS_DIR = path.join(process.cwd(), "content/projects");

export interface Project {
  slug: string;
  title: string;
  description: string;
  url: string;
  content: string;
}

export function getAllProjects(): Project[] {
  if (!fs.existsSync(PROJECTS_DIR)) return [];

  const files = fs.readdirSync(PROJECTS_DIR).filter((f) => f.endsWith(".md"));

  return files.map((filename) => {
    const slug = filename.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(PROJECTS_DIR, filename), "utf-8");
    const { data, content } = matter(raw);

    return {
      slug,
      title: data.title || slug,
      description: data.description || "",
      url: data.url || "",
      content,
    };
  });
}

export function getProjectBySlug(slug: string): Project | undefined {
  const filepath = path.join(PROJECTS_DIR, `${slug}.md`);
  if (!fs.existsSync(filepath)) return undefined;

  const raw = fs.readFileSync(filepath, "utf-8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: data.title || slug,
    description: data.description || "",
    url: data.url || "",
    content,
  };
}
