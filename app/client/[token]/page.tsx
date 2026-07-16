import { DashboardApp } from "@/components/dashboard-app";

export default function ClientDashboardPage({ params }: { params: { token: string } }) {
  return <DashboardApp clientToken={params.token} />;
}
