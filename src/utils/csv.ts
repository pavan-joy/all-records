import Papa from "papaparse";

export function sanitizeCsvValue(value: unknown) {
  if (typeof value !== "string") return value;
  return value.trim().replace(/[<>]/g, "");
}

export function parseCsv<T = Record<string, string>>(fileText: string) {
  return Papa.parse<T>(fileText, {
    header: true,
    skipEmptyLines: true,
    transform: (value) => sanitizeCsvValue(value) as string,
  });
}

export function unparseCsv(data: Record<string, unknown>[]) {
  return Papa.unparse(data);
}
