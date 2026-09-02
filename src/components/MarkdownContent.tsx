import { type ReactNode } from "react";
import { type MarkdownBlock } from "../utils/parseMarkdownGuide";

function renderInlineMarkdown(content: string): ReactNode[] {
  const tokenPattern = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;

  return content
    .split(tokenPattern)
    .filter(Boolean)
    .map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
      }

      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        return (
          <a
            href={linkMatch[2]}
            key={`${linkMatch[2]}-${index}`}
            rel="noreferrer"
            target="_blank"
          >
            {linkMatch[1]}
          </a>
        );
      }

      return part;
    });
}

type MarkdownBlocksProps = {
  blocks: MarkdownBlock[];
  boldFirstSentenceInListItems?: boolean;
  listClassName?: string;
  quoteClassName?: string;
};

function renderListItem(content: string, boldFirstSentence: boolean) {
  if (!boldFirstSentence) return renderInlineMarkdown(content);

  const firstSentenceMatch = content.match(/^(.+?[.!?])(?=\s|$)/);
  const firstSentence = firstSentenceMatch?.[1] ?? content;
  const remainder = content.slice(firstSentence.length);

  return (
    <>
      <strong>{renderInlineMarkdown(firstSentence)}</strong>
      {renderInlineMarkdown(remainder)}
    </>
  );
}

export function MarkdownBlocks({
  blocks,
  boldFirstSentenceInListItems = false,
  listClassName,
  quoteClassName,
}: MarkdownBlocksProps) {
  return blocks.map((block, index) => {
    if (block.type === "list") {
      return (
        <ul className={listClassName} key={`list-${index}`}>
          {block.items.map((item) => (
            <li key={item}>
              {renderListItem(item, boldFirstSentenceInListItems)}
            </li>
          ))}
        </ul>
      );
    }

    if (block.type === "quote") {
      return (
        <blockquote className={quoteClassName} key={`quote-${index}`}>
          {block.paragraphs.map((paragraph) => (
            <p key={paragraph}>{renderInlineMarkdown(paragraph)}</p>
          ))}
        </blockquote>
      );
    }

    return (
      <p key={`paragraph-${index}`}>{renderInlineMarkdown(block.content)}</p>
    );
  });
}
