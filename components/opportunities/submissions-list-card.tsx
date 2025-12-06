import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Trophy, Loader2 } from "lucide-react";
import { SubmissionItem } from "./submission-item";

interface SubmissionsListCardProps {
  submissions: any[];
  loading: boolean;
  isCreator: boolean;
  isDeadlinePassed: boolean;
  isBountyClosed: boolean;
  submissionUsers: Record<string, any>;
  isSubmitting: boolean;
  isSelectWinnersPending: boolean;
  onSelectWinnersClick: () => void;
}

export function SubmissionsListCard({
  submissions,
  loading,
  isCreator,
  isDeadlinePassed,
  isBountyClosed,
  submissionUsers,
  isSubmitting,
  isSelectWinnersPending,
  onSelectWinnersClick,
}: SubmissionsListCardProps) {
  if (!isCreator) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Submissions ({submissions.length})
          </CardTitle>
          {isDeadlinePassed && submissions.length > 0 && !isBountyClosed && (
            <Button
              onClick={onSelectWinnersClick}
              disabled={isSubmitting || isSelectWinnersPending}
            >
              <Trophy className="h-4 w-4 mr-2" />
              Select Winners
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            Loading submissions...
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No submissions yet
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission, index) => (
              <SubmissionItem
                key={index}
                submission={submission}
                submitterUser={submissionUsers[submission.submitter.toLowerCase()]}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

