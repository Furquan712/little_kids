import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { Notification } from "@/models/Notification";
import { getEmailService } from "@/lib/email";
import { getSmsProvider } from "@/lib/sms";
import { renderEmailHtml } from "@/lib/email/template";
import { BRAND_NAME } from "@/lib/brand";

export type NotificationType =
  | "NANNY_PROFILE_APPROVED"
  | "NANNY_PROFILE_NEEDS_CORRECTION"
  | "NANNY_INTERVIEW_INVITATION"
  | "NANNY_INTERVIEW_CONFIRMED"
  | "NANNY_INTERVIEW_RESCHEDULED"
  | "NANNY_CONTRACT_READY"
  | "NANNY_CONTRACT_SIGNED"
  | "NANNY_PAYMENT_SCHEDULED"
  | "NANNY_PAYMENT_COMPLETED"
  | "FAMILY_REGISTRATION_CONFIRMED"
  | "FAMILY_NEW_RECOMMENDATIONS"
  | "FAMILY_PROCESS_UPDATE"
  | "FAMILY_CONTRACT_READY"
  | "FAMILY_CONTRACT_SIGNED_ALL"
  | "FAMILY_PAYMENT_REMINDER"
  | "FAMILY_PAYMENT_RECEIPT"
  | "ADMIN_NANNY_SUBMITTED"
  | "ADMIN_NEW_REQUEST"
  | "ADMIN_NEW_TICKET"
  | "TICKET_REPLY"
  | "TICKET_RESOLVED";

type NotificationData = Record<string, string | number | undefined>;

type NotificationContent = {
  title: string;
  body: string;
  link: string;
};

// SMS costs money in Angola (per the PRD's own caution) — reserved for
// events where a delay genuinely costs the recipient something, not every
// in-app/email notification.
const SMS_TYPES = new Set<NotificationType>([
  "NANNY_INTERVIEW_INVITATION",
  "NANNY_CONTRACT_READY",
  "FAMILY_PAYMENT_REMINDER",
]);

const TEMPLATES: Record<NotificationType, (data: NotificationData) => NotificationContent> = {
  NANNY_PROFILE_APPROVED: () => ({
    title: "Perfil aprovado",
    body: "O seu perfil foi aprovado. Já pode ser recomendada às famílias.",
    link: "/baba",
  }),
  NANNY_PROFILE_NEEDS_CORRECTION: (data) => ({
    title: "Correção necessária no seu perfil",
    body: `O administrador pediu uma correção: ${data.note ?? ""}`,
    link: "/baba/perfil/dados-pessoais",
  }),
  NANNY_INTERVIEW_INVITATION: () => ({
    title: "Novo convite para entrevista",
    body: "Uma família está interessada em si. Reveja o convite.",
    link: "/baba/convites",
  }),
  NANNY_INTERVIEW_CONFIRMED: (data) => ({
    title: "Entrevista confirmada",
    body: `A sua entrevista foi marcada para ${data.scheduledAt ?? ""}.`,
    link: "/baba/convites",
  }),
  NANNY_INTERVIEW_RESCHEDULED: (data) => ({
    title: "Entrevista reagendada",
    body: `A sua entrevista foi remarcada para ${data.scheduledAt ?? ""}.`,
    link: "/baba/convites",
  }),
  NANNY_CONTRACT_READY: () => ({
    title: "Contrato pronto para revisão",
    body: "O seu contrato está pronto para revisão e assinatura na plataforma.",
    link: "/baba/contratos",
  }),
  NANNY_CONTRACT_SIGNED: () => ({
    title: "Contrato assinado",
    body: "Confirmamos a assinatura do seu contrato de trabalho.",
    link: "/baba/contratos",
  }),
  NANNY_PAYMENT_SCHEDULED: (data) => ({
    title: "Pagamento agendado",
    body: `O seu pagamento referente a ${data.periodMonth ?? "este mês"} está agendado para breve.`,
    link: "/baba/pagamentos",
  }),
  NANNY_PAYMENT_COMPLETED: (data) => ({
    title: "Pagamento efetuado",
    body: `Recebeu um pagamento de ${data.amount ?? ""} AOA.`,
    link: "/baba/pagamentos",
  }),
  FAMILY_REGISTRATION_CONFIRMED: () => ({
    title: "Registo confirmado",
    body: `Bem-vindo(a) à ${BRAND_NAME}! O seu registo foi confirmado.`,
    link: "/familia",
  }),
  FAMILY_NEW_RECOMMENDATIONS: () => ({
    title: "Novas recomendações de babás",
    body: "Encontrámos babás adequadas ao seu pedido. Reveja as recomendações.",
    link: "/familia/pedidos",
  }),
  FAMILY_PROCESS_UPDATE: () => ({
    title: "Atualização do seu pedido",
    body: "O estado do seu pedido foi atualizado.",
    link: "/familia/pedidos",
  }),
  FAMILY_CONTRACT_READY: () => ({
    title: "Contrato pronto para revisão",
    body: "O seu contrato está pronto para revisão e assinatura na plataforma.",
    link: "/familia/contratos",
  }),
  FAMILY_CONTRACT_SIGNED_ALL: () => ({
    title: "Contrato assinado por todas as partes",
    body: "Ambas as partes assinaram o contrato. A colocação está agora ativa.",
    link: "/familia/contratos",
  }),
  FAMILY_PAYMENT_REMINDER: (data) => ({
    title: "Lembrete de pagamento",
    body: `Tem um pagamento referente a ${data.periodMonth ?? "este mês"} a vencer em breve.`,
    link: "/familia/pagamentos",
  }),
  FAMILY_PAYMENT_RECEIPT: (data) => ({
    title: "Recibo de pagamento",
    body: `Confirmamos o pagamento de ${data.amount ?? ""} AOA.`,
    link: "/familia/pagamentos",
  }),
  ADMIN_NANNY_SUBMITTED: (data) => ({
    title: "Nova babá submetida para revisão",
    body: `${data.nannyName ?? "Uma babá"} submeteu o perfil para revisão.`,
    link: "/admin/babas",
  }),
  ADMIN_NEW_REQUEST: (data) => ({
    title: "Novo pedido de família",
    body: `${data.familyName ?? "Uma família"} submeteu um novo pedido.`,
    link: "/admin/pedidos",
  }),
  ADMIN_NEW_TICKET: (data) => ({
    title: "Novo ticket de suporte",
    body: `Foi aberto um novo ticket${data.type ? ` (${data.type})` : ""}.`,
    link: "/admin/suporte",
  }),
  TICKET_REPLY: () => ({
    title: "Nova resposta no seu ticket",
    body: "O suporte respondeu ao seu ticket.",
    link: "/suporte",
  }),
  TICKET_RESOLVED: () => ({
    title: "Ticket resolvido",
    body: "O seu ticket foi marcado como resolvido.",
    link: "/suporte",
  }),
};

// Ticket pages live under a role-specific dashboard path (there is no
// role-agnostic "/suporte" route) — the recipient's role is already known
// here since notify() just loaded their User doc, so resolve the real link
// rather than leaving the TICKET_* templates' placeholder "/suporte" above.
const TICKET_NOTIFICATION_TYPES = new Set<NotificationType>(["TICKET_REPLY", "TICKET_RESOLVED"]);

function dashboardPathForRole(role: string): string {
  if (role === "NANNY") return "/baba";
  if (role === "FAMILY") return "/familia";
  return "/admin";
}

/**
 * Writes the in-app notification and best-effort dispatches email/SMS
 * through Brevo. Channel failures are swallowed (logged only) so a Brevo
 * outage never breaks the calling flow (contract signing, payment
 * recording, etc.) — the in-app record is the one channel that must land.
 */
export async function notify(userId: string, type: NotificationType, data: NotificationData = {}): Promise<void> {
  await connectToDatabase();
  const user = await User.findById(userId);
  if (!user) return;

  const content = TEMPLATES[type](data);
  let link = (data.link as string) || content.link;
  if (TICKET_NOTIFICATION_TYPES.has(type) && data.ticketId) {
    link = `${dashboardPathForRole(user.role)}/suporte/${data.ticketId}`;
  }
  const fullLink = `${process.env.APP_BASE_URL ?? ""}${link}`;

  const channelsSent: string[] = ["IN_APP"];

  if (user.email) {
    try {
      await getEmailService().send({
        to: user.email,
        toName: user.fullName,
        subject: `${content.title} — ${BRAND_NAME}`,
        html: renderEmailHtml({
          title: content.title,
          bodyHtml: `<p style="margin:0 0 8px;">Olá ${user.fullName},</p><p style="margin:0;">${content.body}</p>`,
          ctaLabel: "Ver na plataforma",
          ctaUrl: fullLink,
        }),
      });
      channelsSent.push("EMAIL");
    } catch (error) {
      console.error(`notify: email send failed for ${type}`, error);
    }
  }

  if (user.phone && SMS_TYPES.has(type)) {
    try {
      await getSmsProvider().send({
        to: user.phone,
        message: `${content.title}: ${content.body} ${fullLink}`,
      });
      channelsSent.push("SMS");
    } catch (error) {
      console.error(`notify: sms send failed for ${type}`, error);
    }
  }

  await Notification.create({
    userId,
    type,
    title: content.title,
    body: content.body,
    link,
    channelsSent,
  });
}

export async function notifyAdmins(type: NotificationType, data: NotificationData = {}): Promise<void> {
  await connectToDatabase();
  const admins = await User.find({ role: "ADMIN" });
  await Promise.all(admins.map((admin) => notify(admin._id.toString(), type, data)));
}
