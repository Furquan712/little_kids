import mongoose from "mongoose";

let connected = false;

/**
 * E2E specs need direct DB access to set up fixtures (e.g. forcing a
 * seeded nanny into PENDING_REVIEW) and to assert on state that isn't
 * necessarily visible in the UI. Run with `node --env-file=.env.local`
 * (see package.json's test:e2e script) so MONGODB_URI is set.
 */
export async function connectTestDb() {
  if (connected) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set — run tests via `npm run test:e2e`");
  }
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000, socketTimeoutMS: 20_000 });
  connected = true;
}

export async function disconnectTestDb() {
  if (connected) {
    await mongoose.disconnect();
    connected = false;
  }
}

export const SEED_PASSWORD = "Password123!";
