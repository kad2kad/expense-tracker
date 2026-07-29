import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { formatIDR } from "./money";
import type { ExportRow } from "./export-data";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 9, color: "#111827" },
  h1: { fontSize: 16, fontWeight: 700, marginBottom: 2 },
  sub: { fontSize: 9, color: "#6b7280", marginBottom: 12 },
  summaryRow: { flexDirection: "row", gap: 16, marginBottom: 14 },
  summaryItem: { flexDirection: "column" },
  summaryLabel: { fontSize: 8, color: "#6b7280" },
  summaryValue: { fontSize: 11, fontWeight: 700 },
  thead: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#111827",
    paddingBottom: 4,
    marginBottom: 2,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 3,
  },
  cDate: { width: "16%" },
  cKind: { width: "14%" },
  cCat: { width: "18%" },
  cNote: { width: "30%" },
  cAmt: { width: "22%", textAlign: "right" },
  th: { fontWeight: 700, fontSize: 8, color: "#374151" },
  in: { color: "#059669" },
  out: { color: "#dc2626" },
  neutral: { color: "#6b7280" },
});

export function TransactionsPdf({
  rows,
  periodLabel,
}: {
  rows: ExportRow[];
  periodLabel: string;
}) {
  const income = rows.filter((r) => r.direction === "in").reduce((s, r) => s + r.amount, 0);
  const expense = rows.filter((r) => r.direction === "out").reduce((s, r) => s + r.amount, 0);
  const net = income - expense;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Transactions</Text>
        <Text style={styles.sub}>
          {periodLabel} · {rows.length} transaction{rows.length === 1 ? "" : "s"}
        </Text>

        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>In</Text>
            <Text style={[styles.summaryValue, styles.in]}>{formatIDR(income)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Out</Text>
            <Text style={[styles.summaryValue, styles.out]}>{formatIDR(expense)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Net</Text>
            <Text style={styles.summaryValue}>{formatIDR(net)}</Text>
          </View>
        </View>

        <View style={styles.thead}>
          <Text style={[styles.cDate, styles.th]}>Date</Text>
          <Text style={[styles.cKind, styles.th]}>Type</Text>
          <Text style={[styles.cCat, styles.th]}>Category</Text>
          <Text style={[styles.cNote, styles.th]}>Note</Text>
          <Text style={[styles.cAmt, styles.th]}>Amount</Text>
        </View>

        {rows.map((r, i) => {
          const sign = r.direction === "in" ? "+" : r.direction === "out" ? "-" : "";
          const amtStyle =
            r.direction === "in" ? styles.in : r.direction === "out" ? styles.out : styles.neutral;
          return (
            <View style={styles.row} key={i} wrap={false}>
              <Text style={styles.cDate}>{r.date}</Text>
              <Text style={styles.cKind}>{r.kind}</Text>
              <Text style={styles.cCat}>{r.category}</Text>
              <Text style={styles.cNote}>{r.note}</Text>
              <Text style={[styles.cAmt, amtStyle]}>
                {sign}
                {formatIDR(r.amount)}
              </Text>
            </View>
          );
        })}
      </Page>
    </Document>
  );
}
