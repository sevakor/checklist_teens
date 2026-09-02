import { useState } from "react";
import { type MarkdownBlock } from "../utils/parseMarkdownGuide";
import { MarkdownBlocks } from "./MarkdownContent";

type MaterialSourcesDisclosureProps = {
  blocks: MarkdownBlock[];
  idPrefix: string;
  title: string;
};

export function MaterialSourcesDisclosure({
  blocks,
  idPrefix,
  title,
}: MaterialSourcesDisclosureProps) {
  const [open, setOpen] = useState(false);
  const headingId = `${idPrefix}-sources-heading`;
  const panelId = `${idPrefix}-sources-panel`;

  return (
    <section className="material-section material-sources-disclosure">
      <h2 id={headingId}>
        <button
          aria-controls={panelId}
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          type="button"
        >
          <span>{title}</span>
          <span aria-hidden="true" className="material-sources-arrow">
            ↓
          </span>
        </button>
      </h2>
      <div
        aria-labelledby={headingId}
        className="material-prose material-sources-list"
        hidden={!open}
        id={panelId}
        role="region"
      >
        <MarkdownBlocks blocks={blocks} />
      </div>
    </section>
  );
}
