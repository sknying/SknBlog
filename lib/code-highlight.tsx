import Prism from "prismjs";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-batch";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-dart";
import "prismjs/components/prism-docker";
import "prismjs/components/prism-elixir";
import "prismjs/components/prism-go";
import "prismjs/components/prism-graphql";
import "prismjs/components/prism-haskell";
import "prismjs/components/prism-hcl";
import "prismjs/components/prism-ini";
import "prismjs/components/prism-java";
import "prismjs/components/prism-json";
import "prismjs/components/prism-json5";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-kotlin";
import "prismjs/components/prism-less";
import "prismjs/components/prism-lua";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-nginx";
import "prismjs/components/prism-objectivec";
import "prismjs/components/prism-perl";
import "prismjs/components/prism-markup-templating";
import "prismjs/components/prism-php";
import "prismjs/components/prism-powershell";
import "prismjs/components/prism-properties";
import "prismjs/components/prism-python";
import "prismjs/components/prism-r";
import "prismjs/components/prism-ruby";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-sass";
import "prismjs/components/prism-scala";
import "prismjs/components/prism-scss";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-swift";
import "prismjs/components/prism-toml";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-yaml";

// Article code is rendered by React, so Prism must not mutate it after hydration.
Prism.manual = true;

const LANGUAGE_ALIASES: Record<string, string> = {
  "c#": "csharp",
  "c++": "cpp",
  bash: "bash",
  bat: "batch",
  batch: "batch",
  c: "c",
  cc: "cpp",
  cfg: "ini",
  conf: "ini",
  config: "ini",
  cpp: "cpp",
  csharp: "csharp",
  cs: "csharp",
  css: "css",
  dart: "dart",
  docker: "docker",
  dockerfile: "docker",
  dotenv: "properties",
  elixir: "elixir",
  env: "properties",
  fish: "bash",
  go: "go",
  golang: "go",
  gql: "graphql",
  graphql: "graphql",
  h: "c",
  hcl: "hcl",
  haskell: "haskell",
  hpp: "cpp",
  html: "markup",
  htm: "markup",
  ini: "ini",
  java: "java",
  javascript: "javascript",
  js: "javascript",
  json: "json",
  json5: "json5",
  jsonc: "json5",
  jsx: "jsx",
  kotlin: "kotlin",
  kt: "kotlin",
  latex: "markup",
  less: "less",
  lua: "lua",
  markdown: "markdown",
  md: "markdown",
  markup: "markup",
  nginx: "nginx",
  objc: "objectivec",
  objectivec: "objectivec",
  perl: "perl",
  php: "php",
  plain: "text",
  plaintext: "text",
  powershell: "powershell",
  properties: "properties",
  ps1: "powershell",
  py: "python",
  python: "python",
  r: "r",
  rb: "ruby",
  rs: "rust",
  ruby: "ruby",
  rust: "rust",
  sass: "sass",
  scala: "scala",
  scss: "scss",
  sh: "bash",
  shell: "bash",
  sql: "sql",
  swift: "swift",
  text: "text",
  toml: "toml",
  ts: "typescript",
  tsx: "tsx",
  typescript: "typescript",
  xml: "markup",
  yaml: "yaml",
  yml: "yaml",
  zsh: "bash"
};

const LANGUAGE_LABELS: Record<string, string> = {
  bash: "Bash",
  batch: "Batch",
  c: "C",
  cpp: "C++",
  csharp: "C#",
  css: "CSS",
  dart: "Dart",
  docker: "Dockerfile",
  elixir: "Elixir",
  go: "Go",
  graphql: "GraphQL",
  haskell: "Haskell",
  hcl: "HCL",
  ini: "INI",
  java: "Java",
  javascript: "JavaScript",
  json: "JSON",
  json5: "JSON5",
  jsx: "JSX",
  kotlin: "Kotlin",
  less: "Less",
  lua: "Lua",
  markdown: "Markdown",
  markup: "HTML",
  nginx: "Nginx",
  objectivec: "Objective-C",
  perl: "Perl",
  php: "PHP",
  powershell: "PowerShell",
  properties: "Properties",
  python: "Python",
  r: "R",
  ruby: "Ruby",
  rust: "Rust",
  sass: "Sass",
  scala: "Scala",
  scss: "SCSS",
  sql: "SQL",
  swift: "Swift",
  text: "Text",
  toml: "TOML",
  tsx: "TSX",
  typescript: "TypeScript",
  yaml: "YAML"
};

function resolveLanguage(value?: string) {
  if (!value) return undefined;

  const normalized = value
    .trim()
    .toLocaleLowerCase("en-US")
    .replace(/^language-/, "")
    .split(/\s+/)[0]
    .replace(/^\./, "");
  const extension = normalized.split(/[\\/]/).pop()?.split(".").pop();

  return LANGUAGE_ALIASES[normalized] ?? (extension ? LANGUAGE_ALIASES[extension] : undefined);
}

export function getCodeLanguage(language?: string, fallback?: string) {
  return resolveLanguage(language) ?? resolveLanguage(fallback) ?? "text";
}

export function getLanguageLabel(language: string) {
  return LANGUAGE_LABELS[language] ?? language.toUpperCase();
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function commentHtml(value: string) {
  return `<span class="token comment">${escapeHtml(value)}</span>`;
}

function highlightLine(line: string, language: string) {
  if (language === "text") return escapeHtml(line);
  const grammar = Prism.languages[language];
  return grammar ? Prism.highlight(line, grammar, language) : escapeHtml(line);
}

function hasBlockComments(language: string) {
  return !["bash", "batch", "ini", "powershell", "properties", "python", "ruby", "toml", "yaml"].includes(language);
}

export function highlightCodeLines(code: string, language: string) {
  let insideBlockComment = false;

  return code.split("\n").map((line) => {
    if (!hasBlockComments(language)) return highlightLine(line, language) || "&nbsp;";

    if (insideBlockComment) {
      const closeIndex = line.indexOf("*/");
      if (closeIndex === -1) return commentHtml(line) || "&nbsp;";

      insideBlockComment = false;
      return `${commentHtml(line.slice(0, closeIndex + 2))}${highlightLine(line.slice(closeIndex + 2), language)}` || "&nbsp;";
    }

    const openIndex = line.indexOf("/*");
    const closeIndex = openIndex === -1 ? -1 : line.indexOf("*/", openIndex + 2);
    if (openIndex !== -1 && closeIndex === -1) {
      insideBlockComment = true;
      return `${highlightLine(line.slice(0, openIndex), language)}${commentHtml(line.slice(openIndex))}` || "&nbsp;";
    }

    return highlightLine(line, language) || "&nbsp;";
  });
}
