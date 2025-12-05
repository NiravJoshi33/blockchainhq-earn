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
          Browse Opportunities
          <ChevronDownIcon className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>Browse Opportunities</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="flex flex-row items-center justify-start gap-2 hover:bg-accent! hover:text-brand! cursor-pointer"
            onClick={(e) => handleClick(e, "/hackathons")}
          >
            <ComputerIcon className="w-4 h-4" />
            Hackathons
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex flex-row items-center justify-start gap-2 hover:bg-accent! hover:text-brand! cursor-pointer"
            onClick={(e) => handleClick(e, "/bounties")}
          >
            <AwardIcon className="w-4 h-4" />
            Bounties
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex flex-row items-center justify-start gap-2 hover:bg-accent! hover:text-brand! cursor-pointer"
            onClick={(e) => handleClick(e, "/jobs")}
          >
            <BriefcaseIcon className="w-4 h-4" />
            Jobs
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex flex-row items-center justify-start gap-2 hover:bg-accent! hover:text-brand! cursor-pointer"
            onClick={(e) => handleClick(e, "/projects-and-gigs")}
          >
            <GitBranchIcon className="w-4 h-4" />
            Projects & Gigs
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default OpportunitiesDropdown;
