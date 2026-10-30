import { getBuildingTree } from "@/lib/queries/rent";
import { RoomsClient } from "./client";

export const dynamic = "force-dynamic";

export default async function RoomsPage() {
  const tree = await getBuildingTree();
  return <RoomsClient tree={tree} />;
}
