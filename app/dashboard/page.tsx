"use client";

import { useRole } from "@/contexts/role-context";
import { CandidateDashboard } from "@/components/dashboard/candidate-dashboard";
import { SponsorDashboard } from "@/components/dashboard/sponsor-dashboard";

export default function Dashboard() {
  const { role } = useRole();

  if (role === "sponsor") {
    return <SponsorDashboard />;
  }

  return <CandidateDashboard />;
}
