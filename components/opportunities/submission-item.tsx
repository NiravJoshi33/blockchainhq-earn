import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Github, Twitter, Youtube, Link as LinkIcon, ExternalLink } from "lucide-react";
import Link from "next/link";

interface SubmissionItemProps {
  submission: {
    id: number;
    submitter: string;
    submissionTime: bigint | number;
    isWinner: boolean;
    rank: number | bigint;
    submissionLink?: string;
    githubLink?: string;
    twitterLink?: string;
    videoLink?: string;
    indieFunLink?: string;
    tweetLink?: string;
    projectLink?: string;
  };
  submitterUser?: {
    id: string;
    name?: string | null;
    avatar_url?: string | null;
    profile_data?: any;
  } | null;
}

export function SubmissionItem({ submission, submitterUser }: SubmissionItemProps) {
  const submissionTime = typeof submission.submissionTime === 'bigint' 
    ? Number(submission.submissionTime) 
    : submission.submissionTime;

  return (
    <Card className="border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              Submission #{submission.id + 1}
            </Badge>
            {submission.isWinner && (
              <Badge variant="default">
                Winner - Rank {Number(submission.rank)}
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {new Date(submissionTime * 1000).toLocaleDateString()}
          </div>
        </div>
        <div className="text-sm text-muted-foreground mt-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">Submitted by:</span>
            {submitterUser ? (
              <>
                {submitterUser.avatar_url && (
                  <img
                    src={submitterUser.avatar_url}
                    alt="Avatar"
                    className="w-6 h-6 rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
                <Link
                  href={`/profile/${submitterUser.id}`}
                  className="font-semibold text-foreground hover:text-primary hover:underline cursor-pointer"
                >
                  {submitterUser.name || 
                   (submitterUser.profile_data as any)?.username ||
                   "Unknown User"}
                </Link>
                <span className="text-xs text-muted-foreground">•</span>
                <a
                  href={`https://testnet.bscscan.com/address/${submission.submitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {submission.submitter.slice(0, 6)}...{submission.submitter.slice(-4)}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </>
            ) : (
              <a
                href={`https://testnet.bscscan.com/address/${submission.submitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                {submission.submitter.slice(0, 6)}...{submission.submitter.slice(-4)}
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {submission.submissionLink && (
            <a
              href={submission.submissionLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline cursor-pointer"
            >
              <LinkIcon className="h-4 w-4" />
              Submission Link
            </a>
          )}
          {submission.githubLink && (
            <a
              href={submission.githubLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline cursor-pointer"
            >
              <Github className="h-4 w-4" />
              GitHub Repository
            </a>
          )}
          {submission.twitterLink && (
            <a
              href={submission.twitterLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline cursor-pointer"
            >
              <Twitter className="h-4 w-4" />
              Project Twitter
            </a>
          )}
          {submission.videoLink && (
            <a
              href={submission.videoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline cursor-pointer"
            >
              <Youtube className="h-4 w-4" />
              Video Trailer
            </a>
          )}
          {submission.indieFunLink && (
            <a
              href={submission.indieFunLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline cursor-pointer"
            >
              <LinkIcon className="h-4 w-4" />
              Indie.fun Page
            </a>
          )}
          {submission.tweetLink && (
            <a
              href={submission.tweetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline cursor-pointer"
            >
              <Twitter className="h-4 w-4" />
              Tweet Link
            </a>
          )}
          {submission.projectLink && (
            <a
              href={submission.projectLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline cursor-pointer"
            >
              <LinkIcon className="h-4 w-4" />
              Live Project
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

