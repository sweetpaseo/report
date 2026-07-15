import { FullDataView } from "@/components/full-data-view";

export default async function ReportDataPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <FullDataView token={token} />;
}
