import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type AboutContent = {
  title: string;
  lead: string;
  sections: Array<{
    heading: string;
    paragraphs: string[];
  }>;
};

function parseSections(content: string) {
  return content
    .trim()
    .split(/^##\s+/m)
    .filter(Boolean)
    .map((section) => {
      const [heading = "", ...body] = section.split("\n");
      return {
        heading: heading.trim(),
        paragraphs: body.join("\n").trim().split(/\n\s*\n/).map((paragraph) => paragraph.replace(/\n/g, " ").trim()).filter(Boolean)
      };
    });
}

export function getAboutContent(): AboutContent {
  const filePath = path.join(process.cwd(), "content", "about.md");
  const { data, content } = matter(fs.readFileSync(filePath, "utf8"));

  return {
    title: typeof data.title === "string" ? data.title : "关于 SknBlog",
    lead: typeof data.lead === "string" ? data.lead : "记录技术，也记录过程。",
    sections: parseSections(content)
  };
}
