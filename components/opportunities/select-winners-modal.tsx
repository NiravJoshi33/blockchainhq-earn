"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Trophy } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/lib/supabase/database.types";

type Opportunity = Database["public"]["Tables"]["opportunities"]["Row"];

interface SelectWinnersModalProps {
  open: boolean;
  onClose: () => void;
  submissions: any[];
  submissionUsers: Record<string, any>;
  opportunity: Opportunity;
  selectedWinners: Array<{ submissionId: number; rank: number; percentage: number }>;
  onSelectedWinnersChange: (winners: Array<{ submissionId: number; rank: number; percentage: number }>) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isSelectWinnersPending: boolean;
}

export function SelectWinnersModal({
  open,
  onClose,
  submissions,
  submissionUsers,
  opportunity,
  selectedWinners,
  onSelectedWinnersChange,
  onSubmit,
  isSubmitting,
  isSelectWinnersPending,
}: SelectWinnersModalProps) {
  if (!open) return null;

  const availableSubmissions = submissions.filter((s) => !s.isWinner);
  const totalPercentage = selectedWinners.reduce((sum, w) => sum + w.percentage, 0);

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
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-background"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Select Winners
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-sm text-muted-foreground">
            Select up to 3 winners and set prize distribution percentages. Total must equal 100%.
          </div>

          {/* Available Submissions */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Select Winners</Label>
            {availableSubmissions.map((submission, index) => {
              const isSelected = selectedWinners.some(w => w.submissionId === submission.id);
              const winnerIndex = selectedWinners.findIndex(w => w.submissionId === submission.id);
              
              return (
                <Card key={index} className={`border-2 ${isSelected ? 'border-primary' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            if (selectedWinners.length >= 3) {
                              toast.error("Maximum 3 winners allowed");
                              return;
                            }
                            // Get prize distribution from opportunity if available
                            const prizeDist = (opportunity as any)?.prize_distribution || 
                                             ((opportunity as any)?.prize_first && (opportunity as any)?.prize_second && (opportunity as any)?.prize_third ? {
                                               first: (opportunity as any).prize_first,
                                               second: (opportunity as any).prize_second,
                                               third: (opportunity as any).prize_third,
                                             } : null);
                            
                            let defaultPercentage = 0;
                            if (prizeDist) {
                              if (selectedWinners.length === 0) {
                                defaultPercentage = prizeDist.first || 50;
                              } else if (selectedWinners.length === 1) {
                                defaultPercentage = prizeDist.second || 30;
                              } else {
                                defaultPercentage = prizeDist.third || 20;
                              }
                            } else {
                              defaultPercentage = selectedWinners.length === 0 ? 50 : selectedWinners.length === 1 ? 30 : 20;
                            }
                            
                            onSelectedWinnersChange([...selectedWinners, {
                              submissionId: submission.id,
                              rank: selectedWinners.length + 1,
                              percentage: defaultPercentage,
                            }]);
                          } else {
                            onSelectedWinnersChange(selectedWinners.filter(w => w.submissionId !== submission.id));
                          }
                        }}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">Submission #{submission.id + 1}</Badge>
                          {submissionUsers[submission.submitter.toLowerCase()] && (
                            <>
                              {submissionUsers[submission.submitter.toLowerCase()].avatar_url && (
                                <img
                                  src={submissionUsers[submission.submitter.toLowerCase()].avatar_url}
                                  alt="Avatar"
                                  className="w-5 h-5 rounded-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = "none";
                                  }}
                                />
                              )}
                              <span className="text-sm font-medium">
                                {submissionUsers[submission.submitter.toLowerCase()].name || 
                                 (submissionUsers[submission.submitter.toLowerCase()].profile_data as any)?.username ||
                                 "Unknown User"}
                              </span>
                            </>
                          )}
                        </div>
                        {isSelected && (
                          <div className="grid grid-cols-2 gap-4 mt-3">
                            <div className="space-y-2">
                              <Label htmlFor={`rank-${submission.id}`}>Rank</Label>
                              <Select
                                value={String(selectedWinners[winnerIndex]?.rank || 1)}
                                onValueChange={(value) => {
                                  const updated = [...selectedWinners];
                                  updated[winnerIndex].rank = parseInt(value);
                                  onSelectedWinnersChange(updated);
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">1st Place</SelectItem>
                                  <SelectItem value="2">2nd Place</SelectItem>
                                  <SelectItem value="3">3rd Place</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`percentage-${submission.id}`}>Prize %</Label>
                              <Input
                                id={`percentage-${submission.id}`}
                                type="number"
                                min="0"
                                max="100"
                                value={selectedWinners[winnerIndex]?.percentage || 0}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value) || 0;
                                  const updated = [...selectedWinners];
                                  updated[winnerIndex].percentage = value;
                                  onSelectedWinnersChange(updated);
                                }}
                                placeholder="0"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Prize Distribution Summary */}
          {selectedWinners.length > 0 && (
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-base">Prize Distribution Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {selectedWinners.map((winner, index) => {
                  const submission = submissions.find(s => s.id === winner.submissionId);
                  const user = submission ? submissionUsers[submission.submitter.toLowerCase()] : null;
                  const prizeAmount = opportunity.amount * (winner.percentage / 100);
                  
                  return (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Rank {winner.rank}</Badge>
                        <span>
                          {user?.name || (user?.profile_data as any)?.username || `Submission #${winner.submissionId + 1}`}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{winner.percentage}%</div>
                        <div className="text-xs text-muted-foreground">
                          ${prizeAmount.toFixed(2)} {opportunity.currency}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <Separator className="my-2" />
                <div className="flex items-center justify-between font-semibold">
                  <span>Total:</span>
                  <span className={totalPercentage === 100 ? "text-green-600" : "text-red-600"}>
                    {totalPercentage}%
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onSubmit}
              disabled={
                isSubmitting || 
                isSelectWinnersPending || 
                selectedWinners.length === 0 ||
                totalPercentage !== 100
              }
              className="flex-1"
            >
              {isSubmitting || isSelectWinnersPending ? (
                "Processing..."
              ) : (
                <>
                  <Trophy className="h-4 w-4 mr-2" />
                  Select Winners & Distribute Prizes
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting || isSelectWinnersPending}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

