import { test, expect, type Page } from "@playwright/test";
import { connectTestDb, disconnectTestDb, SEED_PASSWORD } from "./helpers/db";
import { loginAs } from "./helpers/auth";
import { User } from "@/models/User";
import { NannyRequest } from "@/models/NannyRequest";
import { Contract } from "@/models/Contract";

const ADMIN_EMAIL = "admin@nannyplatform.ao";

function futureDateInput(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

async function drawSignature(page: Page) {
  // SignaturePad listens for React's onPointerDown/onPointerMove/onPointerUp.
  // page.mouse's synthesized input doesn't reliably surface as PointerEvents
  // in all Chromium versions, so dispatch real PointerEvents directly.
  const canvas = page.locator("canvas");
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Signature canvas not found");

  const points = [
    { x: box.x + 20, y: box.y + 20 },
    { x: box.x + 100, y: box.y + 60 },
    { x: box.x + 180, y: box.y + 20 },
  ];

  const common = { pointerId: 1, isPrimary: true, button: 0, bubbles: true, pressure: 0.5 };
  await canvas.dispatchEvent("pointerdown", { ...common, clientX: points[0].x, clientY: points[0].y });
  for (const p of points.slice(1)) {
    await canvas.dispatchEvent("pointermove", { ...common, clientX: p.x, clientY: p.y });
  }
  await canvas.dispatchEvent("pointerup", { ...common, clientX: points.at(-1)!.x, clientY: points.at(-1)!.y });
}

async function signOnline(page: Page, path: string, typedName: string) {
  await page.goto(path);
  await page.locator("#typedName").fill(typedName);
  await drawSignature(page);
  await page.getByRole("checkbox").click();
  await page.getByRole("button", { name: "Assinar contrato", exact: true }).click();
  await expect(page.getByText("Contrato assinado com sucesso")).toBeVisible({ timeout: 10_000 });
}

test.describe("Contract signing", () => {
  test.beforeAll(async () => {
    await connectTestDb();
  });

  test.afterAll(async () => {
    await disconnectTestDb();
  });

  test("admin creates a contract, both parties sign, placement becomes active", async ({ page }) => {
    const family = await User.findOne({ role: "FAMILY" });
    const nanny = await User.findOne({ role: "NANNY", email: { $ne: null } });
    if (!family?.email || !nanny?.email) throw new Error("Seed data missing a family/nanny with an email");

    // An APPROVED request with a target nanny is the contract builder's
    // precondition — the matching UI flow that produces one is already
    // covered end-to-end by the family-request-recommendation spec, so this
    // test creates that state directly and focuses on contracts.
    const request = await NannyRequest.create({
      familyId: family._id,
      targetNannyId: nanny._id,
      childrenAges: [5],
      needs: "Contrato E2E de teste",
      liveIn: "LIVE_OUT",
      startDate: new Date(),
      budgetMin: 0,
      budgetMax: 200000,
      status: "APPROVED",
    });

    await loginAs(page, ADMIN_EMAIL, SEED_PASSWORD);
    await page.goto(`/admin/contratos/novo?requestId=${request._id.toString()}`);

    await page.locator("#startDate").fill(futureDateInput(7));
    await page.locator("#duties").fill("Cuidados infantis (teste E2E)");
    await page.locator("#scheduleText").fill("Seg-Sex, 08h-17h");
    await page.locator("#paymentSchedule").fill("Mensal, até ao dia 5");
    await page.locator("#nannySalary").fill("60000");
    await page.locator("#terminationTerms").fill("Aviso prévio de 30 dias");
    await page.getByRole("button", { name: "Criar contrato", exact: true }).click();

    await page.waitForURL(/\/admin\/contratos\/[a-f0-9]+$/, { timeout: 15_000 });
    const placementId = page.url().split("/admin/contratos/")[1];

    // Send both contracts for signature (family card renders first).
    await page.getByRole("button", { name: "Enviar para assinatura" }).first().click();
    await expect(page.getByRole("button", { name: "Enviar para assinatura" })).toHaveCount(1, { timeout: 10_000 });
    await page.getByRole("button", { name: "Enviar para assinatura" }).click();
    await expect(page.getByRole("button", { name: "Enviar para assinatura" })).toHaveCount(0, { timeout: 10_000 });

    const familyContract = await Contract.findOne({ placementId, party: "FAMILY" });
    const nannyContract = await Contract.findOne({ placementId, party: "NANNY" });
    if (!familyContract || !nannyContract) throw new Error("Contracts not found after sending");

    // Nanny signs first — the family contract is still unsigned, so
    // checkAndActivatePlacement's "both SIGNED" guard should hold it back.
    await loginAs(page, nanny.email, SEED_PASSWORD);
    await signOnline(page, `/baba/contratos/${nannyContract._id.toString()}`, nanny.fullName);

    let contracts = await Contract.find({ placementId });
    expect(contracts.find((c) => c.party === "NANNY")?.status).toBe("SIGNED");
    expect(contracts.find((c) => c.party === "FAMILY")?.status).toBe("SENT");

    // Family signs second — both are now SIGNED, which activates them both
    // and moves the request to CONTRACTED.
    await loginAs(page, family.email, SEED_PASSWORD);
    await signOnline(page, `/familia/contratos/${familyContract._id.toString()}`, family.fullName);

    contracts = await Contract.find({ placementId });
    expect(contracts.every((c) => c.status === "ACTIVE")).toBe(true);

    const updatedRequest = await NannyRequest.findById(request._id);
    expect(updatedRequest?.status).toBe("CONTRACTED");
  });
});
