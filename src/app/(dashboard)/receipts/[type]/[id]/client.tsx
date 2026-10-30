"use client";

import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, FileText, MessageCircle, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate, formatMoney } from "@/lib/format";
import { useT } from "@/lib/i18n/client";
import type { ReceiptData } from "@/lib/receipts";

type Receipt = ReceiptData & {
  mahalluName: string;
  mahalluAddress: string | null;
  mahalluPhone: string | null;
};

function whatsappUrl(receipt: Receipt) {
  const text = [
    receipt.mahalluName,
    `${receipt.title} ${receipt.number}`,
    `${formatDate(receipt.date)}`,
    `${receipt.partyLabel}: ${receipt.party}`,
    receipt.subject,
    ...receipt.lines.map((l) => `${l.label}: ${formatMoney(l.amount)}`),
    `Total: ${formatMoney(receipt.total)}`,
    receipt.via ? `Via: ${receipt.via}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  const digits = (receipt.phone ?? "").replace(/\D/g, "");
  const phone = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function ReceiptClient({ receipt }: { receipt: Receipt }) {
  const t = useT();
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <div className="no-print flex flex-wrap gap-2">
        <Button variant="outline" render={<Link href={receipt.backHref} />}>
          <ArrowLeft className="size-4" />
          {t("Back")}
        </Button>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="size-4" />
          {t("Print")}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            toast.info(t('In the print window, choose "Save as PDF".'));
            window.setTimeout(() => window.print(), 300);
          }}
        >
          <FileText className="size-4" />
          PDF
        </Button>
        <Button render={<a href={whatsappUrl(receipt)} target="_blank" rel="noreferrer" />}>
          <MessageCircle className="size-4" />
          WhatsApp
        </Button>
      </div>

      <div data-slot="card" className="glass rounded-2xl p-6 sm:p-8">
        <div className="border-b pb-4 text-center">
          <p className="font-heading text-2xl font-semibold">{receipt.mahalluName}</p>
          {receipt.mahalluAddress && <p className="text-muted-foreground text-sm">{receipt.mahalluAddress}</p>}
          {receipt.mahalluPhone && <p className="text-muted-foreground text-sm">{receipt.mahalluPhone}</p>}
          <p className="text-primary mt-2 text-sm font-semibold tracking-wide uppercase">{t(receipt.title)}</p>
        </div>
        <div className="flex justify-between gap-4 py-4 text-sm">
          <span>
            {t("No.")} <strong>{receipt.number}</strong>
          </span>
          <span>
            {t("Date")}: <strong>{formatDate(receipt.date)}</strong>
          </span>
        </div>
        <div className="flex flex-col gap-1 text-sm">
          <p>
            {t(receipt.partyLabel)}: <strong>{receipt.party}</strong>
          </p>
          {receipt.subject && <p className="text-muted-foreground">{receipt.subject}</p>}
        </div>
        <table className="mt-4 w-full text-sm">
          <tbody>
            {receipt.lines.map((line) => (
              <tr key={line.label} className="border-b">
                <td className="py-2">{t(line.label)}</td>
                <td className="py-2 text-right tabular-nums">{formatMoney(line.amount)}</td>
              </tr>
            ))}
            <tr>
              <td className="py-2 font-semibold">{t("Total")}</td>
              <td className="font-heading py-2 text-right text-lg font-semibold tabular-nums">{formatMoney(receipt.total)}</td>
            </tr>
          </tbody>
        </table>
        {receipt.via && (
          <p className="text-muted-foreground mt-2 text-sm">
            {t(receipt.kind === "slip" ? "Paid via" : "Received via")}: {receipt.via}
          </p>
        )}
        {receipt.note && <p className="text-muted-foreground text-sm">{receipt.note}</p>}
        <div className="mt-10 flex justify-end text-sm">
          <span className="border-t px-6 pt-1">{t("Signature")}</span>
        </div>
      </div>
    </div>
  );
}
