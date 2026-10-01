import { Suspense } from "react";
import { VerifyPhoneForm } from "@/features/auth/components/VerifyPhoneForm";

export default function VerifyPhonePage() {
  return (
    <Suspense>
      <VerifyPhoneForm />
    </Suspense>
  );
}
