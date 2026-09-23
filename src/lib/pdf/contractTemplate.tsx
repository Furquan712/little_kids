import { Document, Page, View, Text, StyleSheet, Image, renderToBuffer } from "@react-pdf/renderer";

const COLORS = {
  primary: "#E58F89",
  ink: "#3F312D",
  inkMuted: "#826758",
  border: "#EADBD0",
  bg: "#FDF6EF",
};

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, color: COLORS.ink, backgroundColor: "#FFFFFF" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    paddingBottom: 10,
    marginBottom: 16,
  },
  brand: { fontSize: 16, fontWeight: 700, color: COLORS.ink },
  brandSub: { fontSize: 8, color: COLORS.inkMuted, marginTop: 2 },
  title: { fontSize: 13, fontWeight: 700, marginBottom: 4 },
  meta: { fontSize: 8, color: COLORS.inkMuted, marginBottom: 14 },
  section: { marginBottom: 12 },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 4,
    color: COLORS.ink,
    textTransform: "uppercase",
  },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  label: { color: COLORS.inkMuted },
  value: { fontWeight: 700 },
  paragraph: { marginBottom: 6, lineHeight: 1.5 },
  divider: { borderBottomWidth: 1, borderBottomColor: COLORS.border, marginVertical: 12 },
  signatureBox: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
  },
  signatureImage: { width: 160, height: 60, marginVertical: 6 },
  footer: { position: "absolute", bottom: 24, left: 40, right: 40, fontSize: 7, color: COLORS.inkMuted },
});

export type ContractPdfData = {
  party: "FAMILY" | "NANNY";
  version: number;
  createdAt: string;
  familyName: string;
  familyLocation: string;
  nannyName: string;
  nannyLocation: string;
  startDate: string;
  duties: string;
  scheduleText: string;
  noticePeriodDays: number;
  terminationTerms: string;
  nannySalary: number;
  commissionType: "PERCENTAGE" | "FIXED";
  commissionValue: number;
  commissionAmount: number;
  familyTotal: number;
  signature?: {
    typedName: string;
    imageDataUrl?: string;
    signedAt: string;
    method: "ONLINE" | "IN_PERSON";
  };
};

function money(value: number) {
  return `${value.toLocaleString("pt-AO")} AOA`;
}

export function ContractDocument({ data }: { data: ContractPdfData }) {
  const isFamily = data.party === "FAMILY";
  const title = isFamily ? "Contrato de Serviço com a Família" : "Contrato de Trabalho da Babá";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Nanny Platform</Text>
            <Text style={styles.brandSub}>Plataforma de babás de confiança — Angola</Text>
          </View>
          <Text style={styles.brandSub}>v{data.version}</Text>
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.meta}>Emitido em {data.createdAt}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Partes</Text>
          <Text style={styles.paragraph}>
            A Nanny Platform atua como empregadora/mediadora entre a família e a babá. Este documento rege a
            relação {isFamily ? "entre a família e a plataforma" : "de trabalho entre a babá e a plataforma"}{" "}
            para a colocação abaixo descrita.
          </Text>
          <View style={styles.row}>
            <Text style={styles.label}>Família</Text>
            <Text style={styles.value}>
              {data.familyName} — {data.familyLocation}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Babá</Text>
            <Text style={styles.value}>
              {data.nannyName} — {data.nannyLocation}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Termos da colocação</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Data de início</Text>
            <Text style={styles.value}>{data.startDate}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Funções</Text>
            <Text style={styles.value}>{data.duties || "—"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Horário</Text>
            <Text style={styles.value}>{data.scheduleText || "—"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Período de aviso prévio</Text>
            <Text style={styles.value}>{data.noticePeriodDays} dias</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Condições de rescisão</Text>
            <Text style={styles.value}>{data.terminationTerms || "—"}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Valores {isFamily ? "" : "(informação de referência)"}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Salário da babá</Text>
            <Text style={styles.value}>{money(data.nannySalary)} / mês</Text>
          </View>
          {isFamily && (
            <>
              <View style={styles.row}>
                <Text style={styles.label}>Comissão da plataforma</Text>
                <Text style={styles.value}>
                  {data.commissionType === "PERCENTAGE" ? `${data.commissionValue}%` : money(data.commissionValue)} ={" "}
                  {money(data.commissionAmount)}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Total mensal a pagar</Text>
                <Text style={styles.value}>{money(data.familyTotal)} / mês</Text>
              </View>
              <Text style={{ ...styles.meta, marginTop: 4 }}>
                Pagamento processado através da Nanny Platform, conforme calendário mensal.
              </Text>
            </>
          )}
        </View>

        {data.signature && (
          <View style={styles.signatureBox}>
            <Text style={styles.sectionTitle}>Assinatura</Text>
            <Text style={styles.paragraph}>
              {data.signature.typedName} confirmou ter lido e aceite este contrato
              {data.signature.method === "IN_PERSON" ? " (assinatura em papel, digitalizada)" : " eletronicamente"} em{" "}
              {data.signature.signedAt}.
            </Text>
            {data.signature.imageDataUrl && (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={data.signature.imageDataUrl} style={styles.signatureImage} />
            )}
          </View>
        )}

        <Text style={styles.footer}>
          Documento gerado pela Nanny Platform · Este contrato é regido pela lei angolana.
        </Text>
      </Page>
    </Document>
  );
}

export async function renderContractPdf(data: ContractPdfData): Promise<Buffer> {
  return renderToBuffer(<ContractDocument data={data} />);
}
