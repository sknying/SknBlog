export type ArticleBlock =
  | { type: "heading"; text: string; level: 2 | 3 | 4 }
  | { type: "paragraph"; text: string }
  | { type: "quote"; text: string; cite?: string }
  | { type: "code"; title: string; language?: string; code: string }
  | { type: "list"; title?: string; items: string[]; ordered?: boolean }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "table"; title?: string; headers: string[]; rows: string[][] }
  | { type: "math"; formula: string; caption?: string };

export type Post = {
  slug: string;
  title: string;
  tags: string[];
  column: string;
  publishedAt: string;
  date: string;
  read: string;
  wordCount: number;
  summary: string;
  image: string;
  mood: string;
  intro: string;
  blocks: ArticleBlock[];
};
