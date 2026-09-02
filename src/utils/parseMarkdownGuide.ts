export type MarkdownBlock =
  | { content: string; type: "paragraph" }
  | { items: string[]; type: "list" }
  | { paragraphs: string[]; type: "quote" };

export type MarkdownSection = {
  blocks: MarkdownBlock[];
  title: string;
};

export type MarkdownGuide = {
  intro: MarkdownBlock[];
  sections: MarkdownSection[];
  title: string;
};

function parseBlocks(lines: string[]): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  let paragraphLines: string[] = [];
  let listItems: string[] = [];
  let quoteParagraphLines: string[] = [];
  let quoteParagraphs: string[] = [];

  const flushParagraph = () => {
    if (paragraphLines.length === 0) return;
    blocks.push({ content: paragraphLines.join(" "), type: "paragraph" });
    paragraphLines = [];
  };

  const flushList = () => {
    if (listItems.length === 0) return;
    blocks.push({ items: listItems, type: "list" });
    listItems = [];
  };

  const flushQuoteParagraph = () => {
    if (quoteParagraphLines.length === 0) return;
    quoteParagraphs.push(quoteParagraphLines.join(" "));
    quoteParagraphLines = [];
  };

  const flushQuote = () => {
    flushQuoteParagraph();
    if (quoteParagraphs.length === 0) return;
    blocks.push({ paragraphs: quoteParagraphs, type: "quote" });
    quoteParagraphs = [];
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();

    if (line.startsWith(">")) {
      flushParagraph();
      flushList();
      const quoteLine = line.slice(1).trim();
      if (quoteLine) quoteParagraphLines.push(quoteLine);
      else flushQuoteParagraph();
      return;
    }

    if (!line) {
      flushParagraph();
      return;
    }

    flushQuote();

    if (line.startsWith("- ")) {
      flushParagraph();
      listItems.push(line.slice(2));
      return;
    }

    flushList();
    paragraphLines.push(line);
  });

  flushParagraph();
  flushList();
  flushQuote();
  return blocks;
}

export function parseMarkdownGuide(source: string): MarkdownGuide {
  const lines = source.trim().split(/\r?\n/);
  const title = lines[0].replace(/^#\s+/, "");
  const headingIndexes = lines.reduce<number[]>((indexes, line, index) => {
    if (line.startsWith("## ")) indexes.push(index);
    return indexes;
  }, []);
  const firstHeadingIndex = headingIndexes[0] ?? lines.length;
  const intro = parseBlocks(lines.slice(1, firstHeadingIndex));
  const sections = headingIndexes.map((headingIndex, index) => {
    const nextHeadingIndex = headingIndexes[index + 1] ?? lines.length;

    return {
      blocks: parseBlocks(lines.slice(headingIndex + 1, nextHeadingIndex)),
      title: lines[headingIndex].replace(/^##\s+/, ""),
    } satisfies MarkdownSection;
  });

  return { intro, sections, title };
}
