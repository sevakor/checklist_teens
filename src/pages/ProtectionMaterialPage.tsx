import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import protectionGuideSource from "../../sex-and-protection-guide.md?raw";
import { AppMenu } from "../components/AppMenu";
import { MarkdownBlocks } from "../components/MarkdownContent";
import { MaterialSourcesDisclosure } from "../components/MaterialSourcesDisclosure";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { parseMarkdownGuide } from "../utils/parseMarkdownGuide";

const protectionSectionIds = [
  "cycle-fertility-pregnancy",
  "choosing-storing-condoms",
  "using-condoms",
  "lubricant-compatibility",
  "stis-contraception",
  "when-protection-fails",
] as const;

type ProtectionSectionId = (typeof protectionSectionIds)[number];

const guide = parseMarkdownGuide(protectionGuideSource);
const contentSections = guide.sections.filter(
  (section) => section.title !== "Джерела",
);
const sourcesSection = guide.sections.find(
  (section) => section.title === "Джерела",
);

export function ProtectionMaterialPage() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [openSection, setOpenSection] =
    useState<ProtectionSectionId | null>(null);

  useEffect(() => {
    document.title = "Секс і захист — корисні матеріали";
    window.scrollTo({ top: 0, behavior: "instant" });
    titleRef.current?.focus({ preventScroll: true });
  }, []);

  const toggleSection = (id: ProtectionSectionId) => {
    if (openSection === id) {
      setOpenSection(null);
      return;
    }

    setOpenSection(id);
    window.requestAnimationFrame(() => {
      const section = document.getElementById(id);
      const trigger = section?.querySelector("button");
      if (!section || !(trigger instanceof HTMLButtonElement)) return;

      section.scrollIntoView?.({
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

      <main className="material-article-page protection-material-page">
        <article>
          <header className="material-article-intro">
            <h1 ref={titleRef} tabIndex={-1}>
              {guide.title}
            </h1>
            <div className="material-lead">
              <MarkdownBlocks blocks={guide.intro} />
            </div>
          </header>

          {contentSections.map((section, index) => {
            const id = protectionSectionIds[index];
            if (!id) return null;
            const headingId = `${id}-heading`;
            const panelId = `${id}-panel`;
            const open = openSection === id;

            return (
              <section
                className="material-section material-disclosure-section protection-disclosure-section"
                id={id}
                key={section.title}
              >
                <h2 id={headingId}>
                  <button
                    aria-controls={panelId}
                    aria-expanded={open}
                    onClick={() => toggleSection(id)}
                    type="button"
                  >
                    <span>{section.title}</span>
                    <span
                      aria-hidden="true"
                      className="material-disclosure-arrow"
                    >
                      ↓
                    </span>
                  </button>
                </h2>
                <div
                  aria-labelledby={headingId}
                  className="material-disclosure-panel protection-section-panel"
                  hidden={!open}
                  id={panelId}
                  role="region"
                >
                  <MarkdownBlocks
                    blocks={section.blocks}
                    listClassName="protection-point-list"
                    quoteClassName="protection-emergency-callout"
                  />
                </div>
              </section>
            );
          })}

          {sourcesSection ? (
            <MaterialSourcesDisclosure
              blocks={sourcesSection.blocks}
              idPrefix="protection"
              title={sourcesSection.title}
            />
          ) : null}
        </article>
      </main>
    </div>
  );
}
