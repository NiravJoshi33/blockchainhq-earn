"use client";

import * as React from "react";
import Image from "next/image";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  DollarSign,
  MapPin,
  Search,
  Tag,
  Users,
  Clock,
  Bookmark,
} from "lucide-react";
import { useRole } from "@/contexts/role-context";
import Link from "next/link";
import { ApplicantCount } from "./applicant-count";
import { formatTimeAgo } from "@/lib/utils";

interface OpportunitiesListingTableProps {
  opportunities: any[];
}

const getTokenLogo = (currency: "USDC" | "SOL" | "BNB" | "ETH") => {
  switch (currency) {
    case "USDC":
      return "usdc.svg";

    case "SOL":
      return "sol.png";

    case "BNB":
      return "bnb.svg";

    case "ETH":
      return "eth.png";

    default:
      return null;
  }
};

function OpportunityCard({ opportunity }: { opportunity: any }) {
  const { role } = useRole();
  const [isFavorite, setIsFavorite] = React.useState(false);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "bounty":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
      case "job":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
      case "project":
        return "bg-green-500/10 text-green-600 dark:text-green-400";
      case "grant":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      case "hackathon":
        return "bg-pink-500/10 text-pink-600 dark:text-pink-400";
      default:
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400";
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-500/10 text-green-600 dark:text-green-400";
      case "intermediate":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
      case "advanced":
        return "bg-orange-500/10 text-orange-600 dark:text-orange-400";
      case "expert":
        return "bg-red-500/10 text-red-600 dark:text-red-400";
      default:
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400";
    }
  };

  const formatDeadline = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: "Expired", urgent: true };
    } else if (diffDays === 0) {
      return { text: "Ends today", urgent: true };
    } else if (diffDays === 1) {
      return { text: "1 day left", urgent: true };
    } else if (diffDays <= 7) {
      return { text: `${diffDays} days left`, urgent: true };
    } else {
      return { text: `${diffDays} days left`, urgent: false };
    }
  };

  const deadline = formatDeadline(opportunity.deadline);

  // Get category text based on opportunity type
  const getCategoryText = () => {
    if (opportunity.type === "bounty") {
      return opportunity.category;
    } else if (opportunity.type === "job") {
      return opportunity.jobType;
    } else if (opportunity.type === "project") {
      return opportunity.duration;
    }
    return opportunity.type;
  };

  return (
    <Link href={`/opportunities/${opportunity.id}`} className="block">
      <div className="flex items-start gap-6 px-6 py-2 hover:bg-accent/50 transition-colors rounded-md group cursor-pointer">
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
              {opportunity.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Briefcase className="h-3.5 w-3.5" />
              <span>{opportunity.organization}</span>
              {opportunity.type === "job" && "location" in opportunity && (
                <>
                  <span>•</span>
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{opportunity.location}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={getTypeColor(opportunity.type)}>
              <Tag className="h-3 w-3 mr-1" />
              {opportunity.type.charAt(0).toUpperCase() +
                opportunity.type.slice(1)}
            </Badge>
            <Badge
              variant="outline"
              className={getDifficultyColor(opportunity.difficultyLevel)}
            >
              {opportunity.difficultyLevel}
            </Badge>
            {getCategoryText() && (
              <Badge variant="secondary" className="text-xs">
                {getCategoryText()}
              </Badge>
            )}
            {opportunity.tags && opportunity.tags.length > 0 && (
              <>
                {opportunity.tags?.slice(0, 3).map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {opportunity.tags && opportunity.tags.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{opportunity.tags.length - 3} more
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex items-start gap-8 shrink-0">
          <div className="text-center min-w-[100px]">
            <div className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
              <DollarSign className="h-3 w-3" />
              Reward
            </div>
            <div className="flex items-center flex-row gap-2">
              <div className="text-lg font-bold">
                {opportunity.amount >= 1000
                  ? `$${(opportunity.amount / 1000).toFixed(1)}k`
                  : `$${opportunity.amount}`}
              </div>
              <div className="text-xs text-muted-foreground">
                {getTokenLogo(opportunity.currency) ? (
                  <Image
                    src={getTokenLogo(opportunity.currency) || ""}
                    alt={opportunity.currency}
                    className="w-6 object-contain h-6"
                    width={24}
                    height={24}
                  />
                ) : (
                  opportunity.currency
                )}
              </div>
            </div>
          </div>

          <div className="text-center min-w-[100px]">
            <div className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
              <Users className="h-3 w-3" />
              Applicants
            </div>
            <div className="text-lg font-bold">
              <ApplicantCount opportunity={opportunity} />
            </div>
            <div className="text-xs text-muted-foreground">total </div>
          </div>

          <div className="text-center min-w-[100px]">
            <div className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
              <Clock className="h-3 w-3" />
              Deadline
            </div>
            <div
              className={`text-lg font-bold ${
                deadline.urgent ? "text-orange-500" : ""
              }`}
            >
              {deadline.text.split(" ")[0]}
            </div>
            <div className="text-xs text-muted-foreground">
              {deadline.text.includes("day") && !deadline.text.includes("today")
                ? "days"
                : deadline.text.split(" ")[1] || ""}
            </div>
          </div>

          <div className="flex flex-col items-center justify-between h-full min-w-[120px]">
            <div className="text-xs text-muted-foreground">
              {formatTimeAgo(opportunity.created_at || opportunity.createdAt)}
            </div>
            {role === "hunter" && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setIsFavorite(!isFavorite)}
                className="mt-2"
              >
                <Bookmark
                  className={`h-5 w-5 ${
                    isFavorite ? "fill-brand text-brand" : ""
                  }`}
                />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export function OpportunitiesListingTable({
  opportunities,
}: OpportunitiesListingTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = React.useState("");

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "title",
      header: "Opportunity",
      cell: ({ row }) => <OpportunityCard opportunity={row.original} />,
      enableSorting: true,
    },
    {
      accessorKey: "amount",
      header: "Amount",
      enableSorting: true,
    },
    {
      accessorKey: "deadline",
      header: "Deadline",
      enableSorting: true,
    },
    {
      accessorKey: "applicants",
      header: "Applicants",
      enableSorting: true,
    },
    {
      accessorKey: "difficultyLevel",
      header: "Difficulty",
      enableSorting: true,
    },
  ];

  const table = useReactTable({
    data: opportunities,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search opportunities..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <Select
          value={
            (table.getColumn("difficultyLevel")?.getFilterValue() as string) ??
            "all"
          }
          onValueChange={(value) =>
            table
              .getColumn("difficultyLevel")
              ?.setFilterValue(value === "all" ? "" : value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
            <SelectItem value="expert">Expert</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={sorting[0]?.id ?? "deadline"}
          onValueChange={(value) => {
            setSorting([
              { id: value, desc: value === "amount" || value === "applicants" },
            ]);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="deadline">Deadline (Soon)</SelectItem>
            <SelectItem value="amount">Reward (High)</SelectItem>
            <SelectItem value="applicants">Applicants</SelectItem>
            <SelectItem value="title">Title (A-Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader className="sr-only">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-b last:border-0"
                >
                  <TableCell colSpan={columns.length} className="p-0">
                    {flexRender(
                      row.getVisibleCells()[0].column.columnDef.cell,
                      {
                        ...row.getVisibleCells()[0].getContext(),
                      }
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No opportunities found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          Showing{" "}
          {table.getState().pagination.pageIndex *
            table.getState().pagination.pageSize +
            1}
          -
          {Math.min(
            (table.getState().pagination.pageIndex + 1) *
              table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{" "}
          of {table.getFilteredRowModel().rows.length} opportunities
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <div className="text-sm">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
