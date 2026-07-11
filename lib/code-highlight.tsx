const CODE_KEYWORDS = new Set([
  "async",
  "await",
  "break",
  "case",
  "catch",
  "class",
  "const",
  "default",
  "else",
  "export",
  "extends",
  "false",
  "finally",
  "fn",
  "for",
  "from",
  "function",
  "if",
  "import",
  "in",
  "interface",
  "let",
  "match",
  "mut",
  "new",
  "null",
  "return",
  "self",
  "switch",
  "true",
  "try",
  "type",
  "undefined"
]);

export function getCodeLanguage(title: string) {
  const normalized = title.toLowerCase();

  if (normalized.includes("frontmatter") || normalized.endsWith(".yml") || normalized.endsWith(".yaml")) {
    return "yaml";
  }

  if (normalized.endsWith(".tsx")) {
    return "tsx";
  }

  if (normalized.endsWith(".ts")) {
    return "ts";
  }

  if (normalized.endsWith(".css")) {
    return "css";
  }

  if (normalized.endsWith(".rs")) {
    return "rust";
  }

  return "text";
}

export function getLanguageLabel(language: string) {
  if (language === "tsx") {
    return "TSX";
  }

  if (language === "ts") {
    return "TypeScript";
  }

  if (language === "css") {
    return "CSS";
  }

  if (language === "yaml") {
    return "YAML";
  }

  if (language === "rust") {
    return "Rust";
  }

  return "Text";
}

function getTokenClass(token: string, language: string) {
  if (/^\/\/|^\/\*/.test(token)) {
    return "comment";
  }

  if (/^["'`]/.test(token)) {
    return "string";
  }

  if (/^\d/.test(token)) {
    return "number";
  }

  if (language === "css" && /^[-a-zA-Z]+$/.test(token)) {
    return "property";
  }

  if (CODE_KEYWORDS.has(token)) {
    return "keyword";
  }

  if (/^[{}()[\].,;:=>-]+$/.test(token)) {
    return "punctuation";
  }

  return null;
}

export function highlightCodeLine(line: string, language: string, lineIndex: number) {
  const matcher =
    language === "css"
      ? /(\/\*.*?\*\/|#[0-9a-fA-F]{3,8}\b|[-a-zA-Z]+(?=\s*:)|["'][^"']*["']|\b\d+(?:\.\d+)?(?:px|rem|em|%|vw|vh)?\b|[{}()[\].,;:=>-])/g
      : /(\/\/.*|["'`][^"'`]*["'`]|\b\d+(?:\.\d+)?\b|\b[A-Za-z_$][\w$]*\b|[{}()[\].,;:=>-])/g;
  const nodes = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = matcher.exec(line)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(line.slice(lastIndex, match.index));
    }

    const token = match[0];
    const tokenClass = getTokenClass(token, language);
    nodes.push(
      tokenClass ? (
        <span className={`code-token ${tokenClass}`} key={`${lineIndex}-${match.index}`}>
          {token}
        </span>
      ) : (
        token
      )
    );
    lastIndex = matcher.lastIndex;
  }

  if (lastIndex < line.length) {
    nodes.push(line.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : "\u00A0";
}
