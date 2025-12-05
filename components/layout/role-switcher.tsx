"use client";

import { useRole, UserRole } from "@/contexts/role-context";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  TargetIcon,
  BriefcaseIcon,
  CheckIcon,
  ShieldCheckIcon,
} from "lucide-react";

const roleConfig = {
  hunter: {
    label: "Candidate Mode",
    description: "Find and complete bounties",
    icon: TargetIcon,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  sponsor: {
    label: "Sponsor Mode",
    description: "Post bounties and hire talent",
    icon: BriefcaseIcon,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
};

export default function RoleSwitcher() {
  const { role, setRole } = useRole();

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
  };

  const currentRole = roleConfig[role];
  const CurrentIcon = currentRole.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`font-medium ${currentRole.bgColor} hover:${currentRole.bgColor} border-2`}
        >
          <CurrentIcon className={`w-4 h-4 ${currentRole.color}`} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {(Object.keys(roleConfig) as UserRole[]).map((roleKey) => {
          const config = roleConfig[roleKey];
          const Icon = config.icon;
          const isActive = role === roleKey;

          return (
            <DropdownMenuItem
              key={roleKey}
              onClick={() => handleRoleChange(roleKey)}
              className={`cursor-pointer py-3 ${isActive ? "bg-accent" : ""}`}
            >
              <div className="flex items-start gap-3 w-full">
                <div className={`${config.bgColor} p-2 rounded-lg`}>
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{config.label}</span>
                    {isActive && <CheckIcon className="w-4 h-4 text-brand" />}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {config.description}
                  </p>
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />

        <div className="px-2 py-2">
          <p className="text-xs text-muted-foreground">
            Switch between roles to access different features
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
