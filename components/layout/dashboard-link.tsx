"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRole } from "@/contexts/role-context";
import { LayoutDashboard } from "lucide-react";

export default function DashboardLink() {
  const { role } = useRole();

  const dashboardPath =
    role === "sponsor" ? "/sponsor/dashboard" : "/dashboard";
  const dashboardLabel =
    role === "sponsor" ? "Sponsor Dashboard" : "My Dashboard";

  return (
    <Link href={dashboardPath}>
      <Button variant="ghost" size="sm" className="gap-2">
        <LayoutDashboard className="w-4 h-4" />
        <span className="hidden lg:inline">{dashboardLabel}</span>
      </Button>
    </Link>
  );
}
