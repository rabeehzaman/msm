export type ReportColumn = {
  key: string;
  label: string;
  kind?: "text" | "money" | "date";
  wrap?: boolean;
  translate?: boolean;
};

export type ReportFilter = {
  name: string;
  label: string;
  type: "date" | "month" | "select";
  value: string;
  options?: { value: string; label: string }[];
};

export type ReportRow = Record<string, string | number | null | undefined>;

export type ReportResult = {
  slug: string;
  title: string;
  subtitle?: string;
  filters: ReportFilter[];
  columns: ReportColumn[];
  rows: ReportRow[];
  totals?: ReportRow;
  summary?: { label: string; value: number | string }[];
};

export type ReportParams = Record<string, string | undefined>;
export type ReportDefinition = {
  slug: string;
  title: string;
  description: string;
  group: string;
  build: (params: ReportParams) => Promise<ReportResult | null>;
};
