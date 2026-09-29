import { test, expect } from "@playwright/test";
import { connectTestDb, disconnectTestDb, SEED_PASSWORD } from "./helpers/db";
import { loginAs } from "./helpers/auth";
import { Placement } from "@/models/Placement";
import { Payment } from "@/models/Payment";

const ADMIN_EMAIL = "admin@nannyplatform.ao";

function todayInput(): string {
  return new Date().toISOString().slice(0, 10);
}

function currentPeriodInput(): string {
  return new Date().toISOString().slice(0, 7);
}

test.describe("Payment recording", () => {
  test.beforeAll(async () => {
    await connectTestDb();
  });

  test.afterAll(async () => {
    await disconnectTestDb();
  });

  test("admin records a family payment and it's reflected in the billing schedule", async ({ page }) => {
    const placement = await Placement.findOne({ status: "ACTIVE" });
    if (!placement) throw new Error("No ACTIVE placement found — run `npm run seed` first");

    const placementId = placement._id.toString();
    const before = await Payment.countDocuments({ placementId, direction: "IN_FROM_FAMILY" });

    await loginAs(page, ADMIN_EMAIL, SEED_PASSWORD);
    await page.goto(`/admin/pagamentos/${placementId}`);

    await page.getByRole("button", { name: "Registar pagamento" }).click();
    await page.locator("#periodMonth").fill(currentPeriodInput());
    await page.locator("#amount").fill("15000");
    await page.locator("#paidAt").fill(todayInput());
    await page.getByRole("button", { name: "Guardar pagamento" }).click();

    // The dialog closes only on a successful save.
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 10_000 });

    const after = await Payment.countDocuments({ placementId, direction: "IN_FROM_FAMILY" });
    expect(after).toBe(before + 1);

    const latestPayment = await Payment.findOne({ placementId, direction: "IN_FROM_FAMILY" }).sort({
      createdAt: -1,
    });
    expect(latestPayment?.amount).toBe(15000);
  });
});
