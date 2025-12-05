"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRole, UserRole } from "@/contexts/role-context";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface RoleGuardProps {
  allowedRole: UserRole;
  children: React.ReactNode;
}

export function RoleGuard({ allowedRole, children }: RoleGuardProps) {
  const { role } = useRole();
  const router = useRouter();

  if (role !== allowedRole) {
    return (
      <div className="container mx-auto py-16 max-w-2xl">
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          <div className="bg-destructive/10 p-4 rounded-full">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Access Denied</h1>
            <p className="text-muted-foreground">
              This page is only accessible to{" "}
              {allowedRole === "sponsor" ? "sponsors" : "candidates"}.
              {role === "hunter"
                ? " You're currently in candidate mode."
                : " You're currently in sponsor mode."}
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href={role === "sponsor" ? "/sponsor/dashboard" : "/dashboard"}
            >
              <Button>Go to Your Dashboard</Button>
            </Link>
            <Link href="/opportunities">
              <Button variant="outline">Browse Opportunities</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
