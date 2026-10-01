import { test, expect } from "@playwright/test";
import { connectTestDb, disconnectTestDb, SEED_PASSWORD } from "./helpers/db";
import { loginAs, selectRadixOption } from "./helpers/auth";
import { User } from "@/models/User";
import { NannyProfile } from "@/models/NannyProfile";

const ADMIN_EMAIL = "admin@nannyplatform.ao";

test.describe("Nanny registration and approval", () => {
  test.beforeAll(async () => {
    await connectTestDb();
  });

  test.afterAll(async () => {
    await disconnectTestDb();
  });

  test("a new nanny can register, and an admin can approve a pending profile", async ({ page }) => {
    // --- Registration half: drive the real UI form, fresh account ---
    const unique = Date.now();
    await page.goto("/registrar/baba");

    await page.locator("#fullName").fill(`Nanny E2E ${unique}`);
    await page.locator("#email").fill(`nanny.e2e.${unique}@example.com`);
    await page.locator("#password").fill("SenhaForte123!");
    await page.locator("#confirmPassword").fill("SenhaForte123!");

    await selectRadixOption(page, 0, "Luanda");
    await selectRadixOption(page, 1, "Luanda");

    await page.locator("#consent").click();
    await page.locator('form button[type="submit"]').click();

    await expect(page.getByText("Registo efetuado")).toBeVisible({ timeout: 10_000 });

    // --- Approval half: use a seeded nanny forced into PENDING_REVIEW, ---
    // since the fresh account above is email/OTP-gated and can't log in
    // without a verification backdoor.
    const seededNanny = await User.findOne({ role: "NANNY" });
    if (!seededNanny) throw new Error("No seeded nanny found — run `npm run seed` first");

    await NannyProfile.findOneAndUpdate({ userId: seededNanny._id }, { status: "PENDING_REVIEW" });

    await loginAs(page, ADMIN_EMAIL, SEED_PASSWORD);
    await page.goto(`/admin/babas/${seededNanny._id.toString()}`);
    await expect(page.getByText("PENDING_REVIEW")).toBeVisible();

    await page.getByRole("button", { name: "Aprovar", exact: true }).click();
    await expect(page.getByText("APPROVED")).toBeVisible({ timeout: 10_000 });

    const updated = await NannyProfile.findOne({ userId: seededNanny._id });
    expect(updated?.status).toBe("APPROVED");

    // --- The nanny actually sees the resulting notification ---
    if (!seededNanny.email) throw new Error("Seeded nanny has no email to log in with");
    await loginAs(page, seededNanny.email, SEED_PASSWORD);
    await page.goto("/baba/notificacoes");
    await expect(page.getByText("Perfil aprovado").first()).toBeVisible();
  });
});
