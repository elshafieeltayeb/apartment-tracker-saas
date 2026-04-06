export const FREE_MAX_APPLICATIONS = 20;

export const APPLICATION_STATUSES = [
  "interested",
  "applied",
  "viewing",
  "offer",
  "rejected",
  "ghosted",
  "withdrawn",
] as const;

export type ApplicationStatusValue = (typeof APPLICATION_STATUSES)[number];

export const STATUS_LABELS_DE: Record<ApplicationStatusValue, string> = {
  interested: "Interessiert",
  applied: "Beworben",
  viewing: "Besichtigung",
  offer: "Angebot",
  rejected: "Absage",
  ghosted: "Keine Antwort",
  withdrawn: "Zurückgezogen",
};

export const TEMPLATE_CATEGORIES = [
  { id: "first_message", label: "Erste Nachricht" },
  { id: "follow_up", label: "Follow-up" },
  { id: "viewing", label: "Besichtigung" },
] as const;
