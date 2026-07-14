import katex from "katex";

type MathFormulaProps = {
  formula: string;
  displayMode?: boolean;
  className?: string;
};

export function MathFormula({ formula, displayMode = false, className = "" }: MathFormulaProps) {
  const Tag = displayMode ? "div" : "span";

  try {
    const html = katex.renderToString(formula, {
      displayMode,
      output: "htmlAndMathml",
      strict: "warn",
      throwOnError: true,
      trust: false
    });

    return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />;
  } catch {
    return <Tag className={`${className} math-formula-error`.trim()} title="LaTeX 公式解析失败"><code>{formula}</code></Tag>;
  }
}
