import { notFound } from "next/navigation";
import { loadReceipt } from "@/lib/receipts";
import { ReceiptClient } from "./client";

export const dynamic = "force-dynamic";

export default async function ReceiptPage({ params }: { params: Promise<{ type: string; id: string }> }) {
  const { type, id } = await params;
  const receipt = await loadReceipt(type, id);
  if (!receipt) notFound();
  return <ReceiptClient receipt={receipt} />;
}
