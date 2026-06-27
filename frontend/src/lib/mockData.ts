import { AnnotationType } from "@/types";

export const ANNOTATION_TYPES: { value: AnnotationType; label: string; color: string }[] = [
  { value: "algorithm_update", label: "Algorithm Update", color: "#ef4444" },
  { value: "seo_campaign", label: "SEO Campaign", color: "#3b82f6" },
  { value: "migration", label: "Website Migration", color: "#f97316" },
  { value: "content_release", label: "Content Release", color: "#22c55e" },
  { value: "product_launch", label: "Product Launch", color: "#a855f7" },
  { value: "other", label: "Other", color: "#64748b" },
];
