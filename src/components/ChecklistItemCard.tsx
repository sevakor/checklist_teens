import type { ChecklistItem } from "../features/checklist/types";

type ChecklistItemCardProps = {
  item: ChecklistItem;
  selected: boolean;
  onToggle: () => void;
};

export function ChecklistItemCard({
  item,
  selected,
  onToggle,
}: ChecklistItemCardProps) {
  return (
    <div className="checklist-item-group">
      <label className={`checklist-item${selected ? " is-selected" : ""}`}>
        <input
          checked={selected}
          onChange={onToggle}
          type="checkbox"
        />
        <span>{item.text}</span>
      </label>
      {item.disclosure ? (
        <details className="disclosure">
          <summary>{item.disclosure.title}</summary>
          <p>{item.disclosure.text}</p>
        </details>
      ) : null}
    </div>
  );
}
