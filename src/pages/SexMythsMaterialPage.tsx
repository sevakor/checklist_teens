import { type KeyboardEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import sexMythsGuide from "../../sex-myths-guide.md?raw";
import { AppMenu } from "../components/AppMenu";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

type MarkdownBlock =
  | { content: string; type: "paragraph" }
  | { items: string[]; type: "list" };

type GuideSection = {
  blocks: MarkdownBlock[];
  title: string;
};

type MythCategoryId =
  | "expectations"
  | "consent-signals"
  | "body-first-time"
  | "protection"
  | "pleasure";

type MythCategory = {
  end: number;
  id: MythCategoryId;
  label: string;
  start: number;
};

const mythCategories: MythCategory[] = [
  {
    end: 6,
    id: "expectations",
    label: "Очікування й стереотипи",
    start: 1,
  },
  { end: 10, id: "consent-signals", label: "Згода й сигнали", start: 7 },
  {
    end: 16,
    id: "body-first-time",
    label: "Тіло й перший секс",
    start: 11,
  },
  { end: 19, id: "protection", label: "Захист", start: 17 },
  { end: 22, id: "pleasure", label: "Задоволення", start: 20 },
];

function parseBlocks(lines: string[]): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  let paragraphLines: string[] = [];
  let listItems: string[] = [];

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

  lines.forEach((rawLine) => {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      return;
    }

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
  return blocks;
}

function parseGuide(source: string) {
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
    } satisfies GuideSection;
  });

  return { intro, sections, title };
}

const guide = parseGuide(sexMythsGuide);
const mythSections = guide.sections.filter((section) =>
  section.title.startsWith("Міф "),
);
const importantSection = guide.sections.find(
  (section) => section.title === "Що справді важливо",
);
const sourcesSection = guide.sections.find(
  (section) => section.title === "Джерела",
);

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

function MarkdownBlocks({ blocks }: { blocks: MarkdownBlock[] }) {
  return blocks.map((block, index) => {
    if (block.type === "list") {
      return (
        <ul key={`list-${index}`}>
          {block.items.map((item) => (
            <li key={item}>{renderInlineMarkdown(item)}</li>
          ))}
        </ul>
      );
    }

    return (
      <p key={`paragraph-${index}`}>{renderInlineMarkdown(block.content)}</p>
    );
  });
}

type MythCardProps = {
  index: number;
  onToggle: () => void;
  open: boolean;
  section: GuideSection;
};

function MythCard({ index, onToggle, open, section }: MythCardProps) {
  const cardId = `sex-myth-${index}`;
  const headingId = `${cardId}-heading`;
  const panelId = `${cardId}-panel`;

  return (
    <section className="myth-card" id={cardId}>
      <h3 id={headingId}>
        <button
          aria-controls={panelId}
          aria-expanded={open}
          onClick={onToggle}
          type="button"
        >
          <span>{section.title}</span>
          <span aria-hidden="true" className="myth-card-arrow">
            ↓
          </span>
        </button>
      </h3>
      <div
        aria-labelledby={headingId}
        className="myth-card-panel material-prose"
        hidden={!open}
        id={panelId}
        role="region"
      >
        <MarkdownBlocks blocks={section.blocks} />
      </div>
    </section>
  );
}

export function SexMythsMaterialPage() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const categoryButtonRefs = useRef<Record<MythCategoryId, HTMLButtonElement | null>>({
    "body-first-time": null,
    "consent-signals": null,
    expectations: null,
    pleasure: null,
    protection: null,
  });
  const prefersReducedMotion = usePrefersReducedMotion();
  const [activeCategoryId, setActiveCategoryId] =
    useState<MythCategoryId>("expectations");
  const [openMythIndex, setOpenMythIndex] = useState<number | null>(null);

  useEffect(() => {
    document.title = "Міфи про секс — корисні матеріали";
    window.scrollTo({ top: 0, behavior: "instant" });
    titleRef.current?.focus({ preventScroll: true });
  }, []);

  const activeCategory =
    mythCategories.find((category) => category.id === activeCategoryId) ??
    mythCategories[0];
  const activeMyths = mythSections.slice(
    activeCategory.start - 1,
    activeCategory.end,
  );

  const selectCategory = (categoryId: MythCategoryId) => {
    setActiveCategoryId(categoryId);
    setOpenMythIndex(null);
  };

  const handleCategoryKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    categoryIndex: number,
  ) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex =
      (categoryIndex + direction + mythCategories.length) % mythCategories.length;
    const nextCategory = mythCategories[nextIndex];
    selectCategory(nextCategory.id);
    categoryButtonRefs.current[nextCategory.id]?.focus();
  };

  const toggleMyth = (mythIndex: number) => {
    if (openMythIndex === mythIndex) {
      setOpenMythIndex(null);
      return;
    }

    setOpenMythIndex(mythIndex);
    window.requestAnimationFrame(() => {
      const card = document.getElementById(`sex-myth-${mythIndex}`);
      const trigger = card?.querySelector("button");
      if (!card || !(trigger instanceof HTMLButtonElement)) return;

      card.scrollIntoView?.({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
      trigger.focus({ preventScroll: true });
    });
  };

  return (
    <div className="material-article-shell">
      <header className="checklist-header material-article-header">
        <Link className="back-link" to="/materials">
          <span aria-hidden="true">←</span> Усі матеріали
        </Link>
        <AppMenu />
      </header>

      <main className="material-article-page sex-myths-page">
        <article>
          <header className="material-article-intro">
            <h1 ref={titleRef} tabIndex={-1}>
              {guide.title}
            </h1>
            <div className="material-lead">
              <MarkdownBlocks blocks={guide.intro} />
            </div>
          </header>

          <div
            aria-label="Групи міфів"
            className="myth-category-picker"
            role="group"
          >
            {mythCategories.map((category, categoryIndex) => (
              <button
                aria-pressed={activeCategoryId === category.id}
                key={category.id}
                onClick={() => selectCategory(category.id)}
                onKeyDown={(event) =>
                  handleCategoryKeyDown(event, categoryIndex)
                }
                ref={(button) => {
                  categoryButtonRefs.current[category.id] = button;
                }}
                type="button"
              >
                {category.label}
              </button>
            ))}
          </div>

          <section
            aria-labelledby={`${activeCategory.id}-heading`}
            className="myth-category-section"
          >
            <h2 id={`${activeCategory.id}-heading`}>{activeCategory.label}</h2>
            <div className="myth-card-list">
              {activeMyths.map((section, relativeIndex) => {
                const mythIndex = activeCategory.start + relativeIndex;

                return (
                  <MythCard
                    index={mythIndex}
                    key={section.title}
                    onToggle={() => toggleMyth(mythIndex)}
                    open={openMythIndex === mythIndex}
                    section={section}
                  />
                );
              })}
            </div>
          </section>

          {importantSection ? (
            <section className="material-section myths-summary-section">
              <h2>{importantSection.title}</h2>
              <div className="material-prose myths-summary-card">
                <MarkdownBlocks blocks={importantSection.blocks} />
              </div>
            </section>
          ) : null}

          {sourcesSection ? (
            <section className="material-section myths-sources-section">
              <h2>{sourcesSection.title}</h2>
              <div className="material-prose myths-sources-list">
                <MarkdownBlocks blocks={sourcesSection.blocks} />
              </div>
            </section>
          ) : null}
        </article>
      </main>
    </div>
  );
}
