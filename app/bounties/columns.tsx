"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import Link from "next/link";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Bounty = {
  id: string;
  title: string;
  organization: string;
  amount: number;
  deadline: number;
  url: string;
};

const titleComponent = ({ row }: { row: Row<Bounty> }) => {
  return (
    <div className="flex flex-col gap-1 px-2">
      <Link href={row.original.url} className="hover:underline">
        <h3 className="text-lg font-bold">{row.original.title}</h3>
        <p className="text-sm text-muted-foreground">
          {row.original.organization}
        </p>
      </Link>
    </div>
  );
};

const deadlineComponent = ({ row }: { row: Row<Bounty> }) => {
  // calculate the difference between the deadline and the current date
  const deadline = new Date(row.original.deadline);
  const currentDate = new Date();
  const difference = deadline.getTime() - currentDate.getTime();
  const days = Math.ceil(difference / (1000 * 60 * 60 * 24));
  return (
    <div className="text-sm text-muted-foreground px-2">{days} days left</div>
  );
};

const amountComponent = ({ row }: { row: Row<Bounty> }) => {
  return (
    <div className="text-sm text-muted-foreground px-2">
      {row.original.amount} USDC
    </div>
  );
};

export const columns: ColumnDef<Bounty>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => titleComponent({ row }),
  },
  {
    accessorKey: "deadline",
    header: "Ends In",
    cell: ({ row }) => deadlineComponent({ row }),
  },

  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => amountComponent({ row }),
  },
];
