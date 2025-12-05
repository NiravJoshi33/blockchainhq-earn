"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AwardIcon,
  BriefcaseIcon,
  ComputerIcon,
  GitBranchIcon,
  ChevronDownIcon,
  Lightbulb,
  Trophy,
} from "lucide-react";
import { useRouter } from "next/navigation";

const OpportunitiesDropdown = () => {
  const router = useRouter();
  const handleClick = (
    e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>,
    path: string
  ) => {
    e.preventDefault();
    router.push(path);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="hover:bg-transparent! hover:text-brand! cursor-pointer focus:outline-none! focus:ring-0!"
        >
          <BriefcaseIcon className="w-4 h-4" />
          Opportunities
          <ChevronDownIcon className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>Browse Opportunities</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="flex flex-row items-center justify-start gap-2 hover:bg-accent! hover:text-brand! cursor-pointer"
            onClick={(e) => handleClick(e, "/opportunities")}
          >
            <ComputerIcon className="w-4 h-4" />
            All Opportunities
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex flex-row items-center justify-start gap-2 hover:bg-accent! hover:text-brand! cursor-pointer"
            onClick={(e) => handleClick(e, "/opportunities?type=bounty")}
          >
            <AwardIcon className="w-4 h-4" />
            Bounties
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex flex-row items-center justify-start gap-2 hover:bg-accent! hover:text-brand! cursor-pointer"
            onClick={(e) => handleClick(e, "/opportunities?type=job")}
          >
            <BriefcaseIcon className="w-4 h-4" />
            Jobs
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex flex-row items-center justify-start gap-2 hover:bg-accent! hover:text-brand! cursor-pointer"
            onClick={(e) => handleClick(e, "/opportunities?type=project")}
          >
            <GitBranchIcon className="w-4 h-4" />
            Projects
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex flex-row items-center justify-start gap-2 hover:bg-accent! hover:text-brand! cursor-pointer"
            onClick={(e) => handleClick(e, "/opportunities?type=grant")}
          >
            <Lightbulb className="w-4 h-4" />
            Grants
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex flex-row items-center justify-start gap-2 hover:bg-accent! hover:text-brand! cursor-pointer"
            onClick={(e) => handleClick(e, "/opportunities?type=hackathon")}
          >
            <Trophy className="w-4 h-4" />
            Hackathons
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default OpportunitiesDropdown;
