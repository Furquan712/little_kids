import { test, expect } from "@playwright/test";
import { connectTestDb, disconnectTestDb, SEED_PASSWORD } from "./helpers/db";
import { loginAs } from "./helpers/auth";
import { User } from "@/models/User";
import { NannyProfile } from "@/models/NannyProfile";
import { NannyRequest } from "@/models/NannyRequest";

const ADMIN_EMAIL = "admin@nannyplatform.ao";

function futureDateInput(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

test.describe("Family request, recommendation and approval", () => {
  test.beforeAll(async () => {
    await connectTestDb();
  });

  test.afterAll(async () => {
    await disconnectTestDb();
  });

  test("a family's request gets a recommendation they can approve", async ({ page }) => {
    const family = await User.findOne({ role: "FAMILY" });
    if (!family?.email) throw new Error("No seeded family with an email found — run `npm run seed` first");

    // Force a seeded nanny's profile into a state that's guaranteed to
    // satisfy the admin's candidate search below, rather than relying on
    // some pre-existing seeded profile to coincidentally match — repeated
    // runs otherwise leave nannies stuck in IN_NEGOTIATION/PLACED from a
    // prior run's matching flow, permanently starving the search.
    const nanny = await User.findOne({ role: "NANNY" });
    if (!nanny) throw new Error("No seeded nanny found — run `npm run seed` first");
    await NannyProfile.findOneAndUpdate(
      { userId: nanny._id },
      { status: "APPROVED", liveIn: "LIVE_OUT", ageGroups: ["INFANT"], salaryMin: 0, salaryMax: 200_000 },
    );

    // --- Family submits a request ---
    await loginAs(page, family.email, SEED_PASSWORD);
    await page.goto("/familia/pedidos/novo");

    await page.locator("#needs").fill("Preciso de apoio (teste E2E) para a minha filha de 5 anos.");
    await page.getByText("Externa", { exact: true }).click();
    await page.locator("#startDate").fill(futureDateInput(14));
    await page.locator("#budgetMin").fill("0");
    await page.locator("#budgetMax").fill("200000");
    await page.locator('form button[type="submit"]').click();

    await page.waitForURL("**/familia", { timeout: 15_000 });

    const request = await NannyRequest.findOne({ familyId: family._id }).sort({ createdAt: -1 });
    if (!request) throw new Error("Request was not created");
    const requestId = request._id.toString();

    // --- Admin matches and recommends a nanny ---
    await loginAs(page, ADMIN_EMAIL, SEED_PASSWORD);
    await page.goto(`/admin/pedidos/${requestId}`);

    await page.getByRole("button", { name: "Procurar candidatas" }).click();
    const addButton = page.getByRole("button", { name: "Adicionar como candidata" }).first();
    await expect(addButton).toBeVisible({ timeout: 10_000 });
    await addButton.click();

    await expect(page.getByRole("checkbox").first()).toBeVisible({ timeout: 10_000 });
    await page.getByRole("checkbox").first().click();
    await page.getByRole("button", { name: /Enviar recomendação/ }).click();
    // The recommended-candidate badge only renders after the server action
    // completes and the page refreshes — waiting for it confirms the async
    // recommendToFamilyAction has actually finished before we move on.
    await expect(page.getByText("★")).toBeVisible({ timeout: 10_000 });

    // --- Family approves the recommendation ---
    await loginAs(page, family.email, SEED_PASSWORD);
    await page.goto(`/familia/pedidos/${requestId}`);

    await page.getByRole("button", { name: "Aprovar esta babá" }).click();
    await expect(page.getByText("Pedido aprovado")).toBeVisible({ timeout: 10_000 });

    const updated = await NannyRequest.findById(requestId);
    expect(updated?.status).toBe("APPROVED");
    expect(updated?.targetNannyId).toBeTruthy();
  });
});
