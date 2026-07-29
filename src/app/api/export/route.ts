import { createElement } from "react";
import ExcelJS from "exceljs";
import { renderToBuffer } from "@react-pdf/renderer";
import { auth } from "@/auth";
import { getExportData, type ExportRow } from "@/lib/export-data";
import { isView, parseAnchor } from "@/lib/history";
import { TransactionsPdf } from "@/lib/pdf-document";

export const runtime = "nodejs";

const CSV_HEADERS = [
  "Date",
  "Type",
  "Category",
  "Note",
  "Amount",
  "Direction",
  "Counterparty",
  "Location",
  "With who",
];

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(req.url);
  const format = url.searchParams.get("format") ?? "csv";
  const viewParam = url.searchParams.get("view") ?? undefined;
  const view = isView(viewParam) ? viewParam : "monthly";
  const anchor = parseAnchor(url.searchParams.get("anchor") ?? undefined);

  const { rows, periodLabel, filenameBase } = await getExportData(
    session.user.id,
    view,
    anchor,
  );

  if (format === "csv") {
    const body = toCsv(rows);
    return fileResponse(body, `${filenameBase}.csv`, "text/csv; charset=utf-8");
  }

  if (format === "xlsx") {
    const buf = await toXlsx(rows, periodLabel);
    return fileResponse(
      buf,
      `${filenameBase}.xlsx`,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
  }

  if (format === "pdf") {
    const element = createElement(TransactionsPdf, {
      rows,
      periodLabel,
    }) as Parameters<typeof renderToBuffer>[0];
    const buf = await renderToBuffer(element);
    return fileResponse(buf, `${filenameBase}.pdf`, "application/pdf");
  }

  return new Response("Unsupported format", { status: 400 });
}

// ---- helpers ----

function csvCell(value: string | number): string {
  const s = String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(rows: ExportRow[]): string {
  const lines = [CSV_HEADERS.map(csvCell).join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.date,
        r.kind,
        r.category,
        r.note,
        r.amount,
        r.direction,
        r.counterparty,
        r.location,
        r.withWhom,
      ]
        .map(csvCell)
        .join(","),
    );
  }
  // BOM so Excel opens UTF-8 correctly.
  return "﻿" + lines.join("\r\n");
}

async function toXlsx(rows: ExportRow[], periodLabel: string): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Cashflow";
  const ws = wb.addWorksheet("Transactions");

  ws.addRow([`Transactions — ${periodLabel}`]);
  ws.getRow(1).font = { bold: true, size: 14 };
  ws.addRow([]);

  const header = ws.addRow(CSV_HEADERS);
  header.font = { bold: true };
  header.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF3F4F6" },
    };
  });

  for (const r of rows) {
    ws.addRow([
      r.date,
      r.kind,
      r.category,
      r.note,
      r.amount,
      r.direction,
      r.counterparty,
      r.location,
      r.withWhom,
    ]);
  }

  // Amount column formatting (column E = 5).
  ws.getColumn(5).numFmt = '"Rp"#,##0';
  ws.columns.forEach((col) => {
    let max = 10;
    col.eachCell?.({ includeEmpty: false }, (cell) => {
      max = Math.max(max, String(cell.value ?? "").length + 2);
    });
    col.width = Math.min(max, 40);
  });

  const out = await wb.xlsx.writeBuffer();
  return Buffer.from(out);
}

function fileResponse(
  body: string | Buffer,
  filename: string,
  contentType: string,
): Response {
  return new Response(body as BodyInit, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
