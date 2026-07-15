import { DashboardApp } from "@/components/dashboard-app";
export default async function PublicReportPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <DashboardApp publicToken={token} />;
}
