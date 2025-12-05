"use client";

import { useRole } from "@/contexts/role-context";
import { TargetIcon, BriefcaseIcon } from "lucide-react";

export default function RoleBadge() {
  const { role } = useRole();

  const config = {
    hunter: {
      label: "Candidate Mode",
      icon: TargetIcon,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    sponsor: {
      label: "Sponsor Mode",
      icon: BriefcaseIcon,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
  };

  const current = config[role];
  const Icon = current.icon;

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${current.bgColor} border ${current.borderColor}`}
    >
      <Icon className={`w-3.5 h-3.5 ${current.color}`} />
      <span className={`text-xs font-medium ${current.color}`}>
        {current.label}
      </span>
    </div>
  );
}
