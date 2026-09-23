import { requireRole } from "@/lib/rbac";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { AccountSettingsForm } from "@/features/auth/components/AccountSettingsForm";

export default async function FamilySettingsPage() {
  const auth = await requireRole("FAMILY");
  if (!auth.ok) return null;

  await connectToDatabase();
  const user = await User.findById(auth.user.id);
  if (!user) return null;

  return (
    <AccountSettingsForm
      initial={{
        fullName: user.fullName,
        email: user.email ?? "",
        phone: user.phone ?? "",
        whatsapp: user.whatsapp ?? "",
        province: user.province as never,
        city: user.city,
      }}
    />
  );
}
