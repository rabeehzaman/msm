import { getCertificates } from "@/lib/queries/lifecycle";
import { CertificatesClient } from "./client";

export const dynamic = "force-dynamic";

export default async function CertificatesPage() {
  const certificates = await getCertificates();

  return <CertificatesClient certificates={certificates} />;
}
