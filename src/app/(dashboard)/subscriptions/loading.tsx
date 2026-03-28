import { TablePageSkeleton } from "@/components/loading-skeletons";

export default function Loading() {
  return <TablePageSkeleton statCards={4} tableCols={6} />;
}
