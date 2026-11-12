import { notFound } from "next/navigation";
import { getActiveAccounts } from "@/lib/queries/accounts";
import { getRoomDetail } from "@/lib/queries/rent";
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
  return <RoomClient room={room} initialYear={year} now={now} accounts={accounts} />;
}
