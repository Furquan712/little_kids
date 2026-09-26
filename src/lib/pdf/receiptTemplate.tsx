import { Document, Page, View, Text, StyleSheet, Image, renderToBuffer } from "@react-pdf/renderer";
import { BRAND_NAME } from "@/lib/brand";
import { getPdfLogoBuffer } from "@/lib/pdf/logo";

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
  logo: { width: 30, height: 30, borderRadius: 15 },
});

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

export function ReceiptDocument({ data, logoBuffer }: { data: ReceiptPdfData; logoBuffer: Buffer }) {
  const isFamily = data.direction === "IN_FROM_FAMILY";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.brandRow}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={logoBuffer} style={styles.logo} />
            <View>
              <Text style={styles.brand}>{BRAND_NAME}</Text>
              <Text style={styles.brandSub}>Babysitting & Nanny Services — Angola</Text>
            </View>
          </View>
          <Text style={styles.brandSub}>Recibo #{data.receiptNumber}</Text>
        </View>

        <Text style={styles.title}>{isFamily ? "Recibo de pagamento" : "Comprovativo de pagamento à babá"}</Text>
        <Text style={styles.meta}>
          {isFamily
            ? `Confirma o pagamento recebido da família pela ${BRAND_NAME}.`
            : `Confirma o pagamento efetuado à babá pela ${BRAND_NAME}.`}
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
          Documento gerado automaticamente pela {BRAND_NAME}. Este recibo comprova o pagamento acima descrito.
        </Text>
      </Page>
    </Document>
  );
}

export async function renderReceiptPdf(data: ReceiptPdfData): Promise<Buffer> {
  const logoBuffer = await getPdfLogoBuffer();
  return renderToBuffer(<ReceiptDocument data={data} logoBuffer={logoBuffer} />);
}
