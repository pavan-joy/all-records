import { unparseCsv } from "@/utils/csv";

export function makeCsvResponse(filename: string, rows: Record<string, unknown>[]) {
  const csvText = unparseCsv(rows);
  return new Response(csvText, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=\"${filename}\"`,
    },
  });
}
