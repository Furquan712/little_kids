import {
  UserPlus,
  ClipboardList,
  Search,
  ShieldCheck,
  Mail,
  CheckCircle2,
  FileSignature,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type FlowStepData = {
  key: string;
  icon: LucideIcon;
  image: string;
};

export const PARENT_STEPS: FlowStepData[] = [
  { key: "register", icon: UserPlus, image: "/images/book-nanny.png" },
  { key: "describeNeeds", icon: ClipboardList, image: "/images/happy-family.png" },
  { key: "match", icon: Search, image: "/images/varified-nanny.png" },
  { key: "approve", icon: CheckCircle2, image: "/images/parents-nanny.png" },
  { key: "sign", icon: FileSignature, image: "/images/parent-work.png" },
  { key: "relax", icon: Wallet, image: "/images/sleep-nanny-peace.png" },
];

export const NANNY_STEPS: FlowStepData[] = [
  { key: "register", icon: UserPlus, image: "/images/nanny-group.png" },
  { key: "buildProfile", icon: ClipboardList, image: "/images/nanny-baby-sleep.png" },
  { key: "getVerified", icon: ShieldCheck, image: "/images/varified-nanny.png" },
  { key: "invitations", icon: Mail, image: "/images/parent-work.png" },
  { key: "signContract", icon: FileSignature, image: "/images/parents-nanny.png" },
  { key: "getPaid", icon: Wallet, image: "/images/nanny-playing.png" },
];
