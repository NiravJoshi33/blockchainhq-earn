"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Opportunity } from "@/lib/types/opportunities";
import { MoreHorizontal, Eye, Edit, Pause, Play, Trash2 } from "lucide-react";

interface OpportunitiesTableProps {
  opportunities: Opportunity[];
}

export function OpportunitiesTable({ opportunities }: OpportunitiesTableProps) {
  const data = opportunities;

  const getStatusVariant = (
    status: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "active":
        return "default";
      case "draft":
        return "secondary";
      case "paused":
        return "secondary";
      case "completed":
        return "outline";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "bounty":
        return "bg-purple-500/10 text-purple-500";
      case "job":
        return "bg-blue-500/10 text-blue-500";
      case "project":
        return "bg-green-500/10 text-green-500";
      case "grant":
        return "bg-yellow-500/10 text-yellow-600";
      case "hackathon":
        return "bg-pink-500/10 text-pink-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  const formatDeadline = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return <span className="text-red-500">Expired</span>;
    } else if (diffDays === 0) {
      return <span className="text-orange-500">Today</span>;
    } else if (diffDays === 1) {
      return <span className="text-orange-500">Tomorrow</span>;
    } else if (diffDays <= 7) {
      return <span className="text-yellow-500">{diffDays} days</span>;
    } else {
      return <span>{diffDays} days</span>;
    }
  };

  const handleAction = (action: string, opportunityId: string) => {
    console.log(`Action: ${action} on opportunity ${opportunityId}`);
    // TODO: Implement actual actions
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No opportunities found</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Applicants</TableHead>
            <TableHead>Reward</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((opportunity) => (
            <TableRow key={opportunity.id}>
              <TableCell className="font-medium max-w-md">
                <div>
                  <p className="truncate">{opportunity.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {opportunity.organization}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={getTypeColor(opportunity.type)}
                >
                  {opportunity.type.charAt(0).toUpperCase() +
                    opportunity.type.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(opportunity.status)}>
                  {opportunity.status.charAt(0).toUpperCase() +
                    opportunity.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <span className="font-medium">
                    {opportunity.applicants || 0}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    applicants
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">
                  {opportunity.amount.toLocaleString()} {opportunity.currency}
                </div>
              </TableCell>
              <TableCell>{formatDeadline(opportunity.deadline)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleAction("view", opportunity.id)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleAction("edit", opportunity.id)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleAction(
                          opportunity.status === "active"
                            ? "pause"
                            : "activate",
                          opportunity.id
                        )
                      }
                    >
                      {opportunity.status === "active" ? (
                        <>
                          <Pause className="mr-2 h-4 w-4" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Activate
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleAction("delete", opportunity.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
