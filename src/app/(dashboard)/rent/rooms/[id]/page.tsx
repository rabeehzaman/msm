import { notFound } from "next/navigation";
import { getActiveAccounts } from "@/lib/queries/accounts";
import { getRoomDetail, monthCell } from "@/lib/queries/rent";
import { currentYearMonth } from "@/lib/format";
import { RoomClient } from "./client";

export const dynamic = "force-dynamic";

export default async function RoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ year?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [room, accounts] = await Promise.all([getRoomDetail(id), getActiveAccounts()]);
  if (!room) notFound();
  const now = currentYearMonth();
  const year = Number(query.year) >= 2000 && Number(query.year) <= 2100 ? Number(query.year) : now.year;
  const months = Array.from({ length: 12 }, (_, i) => monthCell(room, year, i + 1, now));
  return <RoomClient room={room} months={months} year={year} currentYear={now.year} accounts={accounts} />;
}
