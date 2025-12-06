"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

type SubmissionData = {
  submissionLink: string;
  tweetLink: string;
  githubLink: string;
  twitterLink: string;
  videoLink: string;
  indieFunLink: string;
  projectLink: string;
};

interface SubmitWorkModalProps {
  open: boolean;
  onClose: () => void;
  submissionData: SubmissionData;
  onSubmissionDataChange: (data: SubmissionData) => void;
  onSubmit: (e?: React.FormEvent) => void;
  isSubmitting: boolean;
  isSubmitPending: boolean;
}

export function SubmitWorkModal({
  open,
  onClose,
  submissionData,
  onSubmissionDataChange,
  onSubmit,
  isSubmitting,
  isSubmitPending,
}: SubmitWorkModalProps) {
  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <Card 
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-background"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Submit Your Work</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="submissionLink">
              Submission Link <span className="text-destructive">*</span>
            </Label>
            <Input
              id="submissionLink"
              placeholder="https://..."
              value={submissionData.submissionLink}
              onChange={(e) =>
                onSubmissionDataChange({ ...submissionData, submissionLink: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="githubLink">
              GitHub Repository <span className="text-destructive">*</span>
            </Label>
            <Input
              id="githubLink"
              placeholder="https://github.com/..."
              value={submissionData.githubLink}
              onChange={(e) =>
                onSubmissionDataChange({ ...submissionData, githubLink: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitterLink">
              Project Twitter <span className="text-destructive">*</span>
            </Label>
            <Input
              id="twitterLink"
              placeholder="https://twitter.com/... or https://x.com/..."
              value={submissionData.twitterLink}
              onChange={(e) =>
                onSubmissionDataChange({ ...submissionData, twitterLink: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="videoLink">
              Video Trailer <span className="text-destructive">*</span>
            </Label>
            <Input
              id="videoLink"
              placeholder="https://youtube.com/... or https://vimeo.com/..."
              value={submissionData.videoLink}
              onChange={(e) =>
                onSubmissionDataChange({ ...submissionData, videoLink: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="indieFunLink">
              Indie.fun Page <span className="text-destructive">*</span>
            </Label>
            <Input
              id="indieFunLink"
              placeholder="https://indie.fun/..."
              value={submissionData.indieFunLink}
              onChange={(e) =>
                onSubmissionDataChange({ ...submissionData, indieFunLink: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tweetLink">Tweet Link (Optional)</Label>
            <Input
              id="tweetLink"
              placeholder="https://twitter.com/.../status/..."
              value={submissionData.tweetLink}
              onChange={(e) =>
                onSubmissionDataChange({ ...submissionData, tweetLink: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectLink">Live Project Link (Optional)</Label>
            <Input
              id="projectLink"
              placeholder="https://..."
              value={submissionData.projectLink}
              onChange={(e) =>
                onSubmissionDataChange({ ...submissionData, projectLink: e.target.value })
              }
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={(e) => {
                e.preventDefault();
                onSubmit(e);
              }}
              disabled={isSubmitting || isSubmitPending}
              className="flex-1"
            >
              {isSubmitting || isSubmitPending ? "Submitting..." : "Submit Work"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting || isSubmitPending}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

