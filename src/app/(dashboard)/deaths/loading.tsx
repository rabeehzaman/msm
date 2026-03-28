import { TablePageSkeleton } from "@/components/loading-skeletons";

export default function Loading() {
  return <TablePageSkeleton statCards={3} tableCols={6} />;
}
