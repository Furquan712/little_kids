import { Document, Page, View, Text, StyleSheet, Svg, Path, renderToBuffer } from "@react-pdf/renderer";

const COLORS = {
  primary: "#E58F89",
  ink: "#3F312D",
  inkMuted: "#826758",
  border: "#EADBD0",
};

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, color: COLORS.ink, backgroundColor: "#FFFFFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    paddingBottom: 10,
    marginBottom: 16,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  brand: { fontSize: 16, fontWeight: 700, color: COLORS.ink },
  brandSub: { fontSize: 8, color: COLORS.inkMuted, marginTop: 2 },
  title: { fontSize: 13, fontWeight: 700, marginBottom: 4 },
  meta: { fontSize: 8, color: COLORS.inkMuted, marginBottom: 14 },
  section: { marginBottom: 12 },
  sectionTitle: { fontSize: 10, fontWeight: 700, marginBottom: 4, color: COLORS.ink, textTransform: "uppercase" },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  label: { color: COLORS.inkMuted },
  value: { fontWeight: 700 },
  divider: { borderBottomWidth: 1, borderBottomColor: COLORS.border, marginVertical: 12 },
  amountBox: {
    marginTop: 8,
    borderRadius: 6,
    backgroundColor: "#F9E1DD",
    padding: 14,
    alignItems: "center",
  },
  amountLabel: { fontSize: 9, color: COLORS.inkMuted, marginBottom: 4 },
  amountValue: { fontSize: 20, fontWeight: 700, color: COLORS.ink },
  footer: { position: "absolute", bottom: 24, left: 40, right: 40, fontSize: 7, color: COLORS.inkMuted },
});

function LogoMark() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path
        d="M12 21s-7.5-4.6-10-9.3C.4 8.1 2.2 4.5 5.7 4c2-.3 3.9.7 4.3 2.4C10.4 4.7 12.3 3.7 14.3 4c3.5.5 5.3 4.1 3.7 7.7C15.5 16.4 12 21 12 21Z"
        fill={COLORS.primary}
      />
    </Svg>
  );
}

const METHOD_LABELS: Record<string, string> = {
  BANK_TRANSFER: "Transferência bancária",
  MULTICAIXA_EXPRESS: "Multicaixa Express",
  MOBILE_MONEY: "Mobile money",
  CASH: "Numerário",
};

export type ReceiptPdfData = {
  receiptNumber: string;
  direction: "IN_FROM_FAMILY" | "OUT_TO_NANNY";
  periodMonth: string;
  amount: number;
  method: string | null;
  reference: string | null;
  paidAt: string;
  familyName: string;
  nannyName: string;
};

function money(value: number) {
  return `${value.toLocaleString("pt-AO")} AOA`;
}

export function ReceiptDocument({ data }: { data: ReceiptPdfData }) {
  const isFamily = data.direction === "IN_FROM_FAMILY";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <LogoMark />
            <View>
              <Text style={styles.brand}>Nanny Platform</Text>
              <Text style={styles.brandSub}>Plataforma de babás de confiança — Angola</Text>
            </View>
          </View>
          <Text style={styles.brandSub}>Recibo #{data.receiptNumber}</Text>
        </View>

        <Text style={styles.title}>{isFamily ? "Recibo de pagamento" : "Comprovativo de pagamento à babá"}</Text>
        <Text style={styles.meta}>
          {isFamily
            ? "Confirma o pagamento recebido da família pela Nanny Platform."
            : "Confirma o pagamento efetuado à babá pela Nanny Platform."}
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Colocação</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Família</Text>
            <Text style={styles.value}>{data.familyName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Babá</Text>
            <Text style={styles.value}>{data.nannyName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Período</Text>
            <Text style={styles.value}>{data.periodMonth}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalhes do pagamento</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Data</Text>
            <Text style={styles.value}>{data.paidAt}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Método</Text>
            <Text style={styles.value}>{data.method ? METHOD_LABELS[data.method] ?? data.method : "—"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Referência</Text>
            <Text style={styles.value}>{data.reference || "—"}</Text>
          </View>
        </View>

        <View style={styles.amountBox}>
          <Text style={styles.amountLabel}>Valor pago</Text>
          <Text style={styles.amountValue}>{money(data.amount)}</Text>
        </View>

        <Text style={styles.footer}>
          Documento gerado automaticamente pela Nanny Platform. Este recibo comprova o pagamento acima descrito.
        </Text>
      </Page>
    </Document>
  );
}

export async function renderReceiptPdf(data: ReceiptPdfData): Promise<Buffer> {
  return renderToBuffer(<ReceiptDocument data={data} />);
}
