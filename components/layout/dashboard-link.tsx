"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";

export default function DashboardLink() {
  return (
    <Link href="/dashboard">
      <Button variant="ghost" size="sm" className="gap-2">
        <LayoutDashboard className="w-4 h-4" />
        <span className="hidden lg:inline">Dashboard</span>
      </Button>
    </Link>
  );
}
