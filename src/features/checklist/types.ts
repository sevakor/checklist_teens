export type ChecklistDisclosure = {
  title: string;
  text: string;
};

export type ChecklistItem = {
  id: string;
  text: string;
  disclosure?: ChecklistDisclosure;
};

export type ChecklistSection = {
  id: string;
  slug: string;
  title: string;
  intro: string;
  items: ChecklistItem[];
};

export type StoredChecklistState = {
  schemaVersion: 1;
  selectedItemIds: string[];
  lastStep: number;
  hiddenAt: number | null;
};
