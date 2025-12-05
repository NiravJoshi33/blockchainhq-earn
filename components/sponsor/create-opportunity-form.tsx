"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type {
  OpportunityType,
  BountyCategory,
  JobType,
  ProjectDuration,
  DifficultyLevel,
} from "@/lib/types/opportunities";
import { useUser } from "@/contexts/user-context";
import { createOpportunity } from "@/lib/supabase/services/opportunities";
import type { Database } from "@/lib/supabase/database.types";
import { usePrivy } from "@privy-io/react-auth";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

type OpportunityInsert =
  Database["public"]["Tables"]["opportunities"]["Insert"];

interface CreateOpportunityFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateOpportunityForm({
  onSuccess,
  onCancel,
}: CreateOpportunityFormProps) {
  const [opportunityType, setOpportunityType] =
    useState<OpportunityType>("bounty");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    organization: "",
    amount: "",
    currency: "USDC" as const,
    deadline: "",
    difficultyLevel: "intermediate" as DifficultyLevel,
    category: "content" as BountyCategory,
    jobType: "full-time" as JobType,
    duration: "medium-term" as ProjectDuration,
    location: "",
    submissionUrl: "",
    contactEmail: "",
    detailedDescription: "",
    submissionGuidelines: "",
    aboutOrganization: "",
    sendDmToSuitableCandidates: false,
  });

  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState("");

  const { user, loading: userLoading } = useUser();
  const { authenticated } = usePrivy();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleAddSkill = () => {
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Better check using Privy auth + user loading state
    if (!authenticated) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (userLoading) {
      toast.info("Setting up your account, please wait...");
      return;
    }

    if (!user?.id) {
      toast.error("User profile not found. Please refresh and try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const opportunityData: Database["public"]["Tables"]["opportunities"]["Insert"] =
        {
          type: opportunityType,
          title: formData.title,
          description: formData.description,
          organization: formData.organization,
          sponsor_id: user.id,
          amount: parseFloat(formData.amount),
          currency: formData.currency,
          deadline: new Date(formData.deadline).toISOString(),
          difficulty_level: formData.difficultyLevel,
          tags,
          required_skills: skills,
          contact_email: formData.contactEmail,
          submission_url: formData.submissionUrl || null,
          detailed_description: formData.detailedDescription || null,
          submission_guidelines: formData.submissionGuidelines || null,
          about_organization: formData.aboutOrganization || null,

          ...(opportunityType === "bounty" && { category: formData.category }),
          ...(opportunityType === "job" && {
            job_type: formData.jobType,
            location: formData.location,
          }),
          ...(opportunityType === "project" && { duration: formData.duration }),
        };

      await createOpportunity(opportunityData);
      toast.success("Opportunity created successfully! 🎉", {
        description: "Your opportunity is now live and accepting applications.",
      });
      onSuccess?.();

      // Initiate AI agent to find and send DM to suitable candidates (if enabled)
      if (formData.sendDmToSuitableCandidates) {
        toast.info("🤖 Finding matching candidates...", {
          description: "Our AI is searching for the best talent for this role.",
        });

        fetch("/api/match-candidates", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            opportunityData,
            options: {
              minMatchScore: 70,
              maxCandidates: 20,
              sendNotifications: true,
            },
          }),
        })
          .then((res) => res.json())
          .then((result) => {
            if (result.success) {
              const { matchedCandidates, notificationsSent } = result.data;

              if (matchedCandidates.length > 0) {
                toast.success(
                  `✅ Found ${matchedCandidates.length} matching candidates!`,
                  {
                    description: `Sent ${notificationsSent} Telegram notifications to top matches.`,
                  }
                );
              } else {
                toast.info("No matching candidates found yet", {
                  description:
                    "We'll notify you when candidates with the right skills join.",
                });
              }

              console.log(
                `✅ Matched ${matchedCandidates.length} candidates, sent ${notificationsSent} notifications`
              );
            } else {
              toast.warning(
                "Candidate matching is taking longer than expected",
                {
                  description: "We're still searching in the background.",
                }
              );
            }
          })
          .catch((error) => {
            console.error("Background matching failed:", error);
            toast.warning("Could not match candidates automatically", {
              description:
                "Don't worry, your opportunity is still live and visible.",
            });
          });
      }
    } catch (error: unknown) {
      console.error("Error creating opportunity:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Please try again.";
      toast.error("Failed to create opportunity", {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {userLoading && (
        <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm">
          Setting up your account...
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Create New Opportunity</CardTitle>
          <CardDescription>
            Fill out the form below to post a new opportunity for the community
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* AI Matching Feature */}
          <Card className="bg-gradient-to-br from-purple-500/5 to-blue-500/5 border-purple-500/20">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="sendDmToSuitableCandidates"
                      className="text-base font-semibold"
                    >
                      🤖 AI-Powered Candidate Matching
                    </Label>
                    <Badge variant="secondary" className="text-xs">
                      NEW
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Let our AI find and notify candidates whose skills match
                    your opportunity. They&apos;ll receive personalized Telegram
                    messages with your job details.
                  </p>
                </div>
                <Switch
                  id="sendDmToSuitableCandidates"
                  checked={formData.sendDmToSuitableCandidates}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      sendDmToSuitableCandidates: checked as boolean,
                    })
                  }
                />
              </div>
              {formData.sendDmToSuitableCandidates && (
                <div className="mt-4 p-3 bg-background/50 rounded-lg border border-purple-500/20">
                  <p className="text-xs text-muted-foreground">
                    ✨ <strong>How it works:</strong> After creating your
                    opportunity, our AI will analyze candidate profiles, match
                    them based on skills and experience, and send personalized
                    notifications to the top 20 matches via Telegram.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Opportunity Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Opportunity Type *</Label>
            <Select
              value={opportunityType}
              onValueChange={(value) =>
                setOpportunityType(value as OpportunityType)
              }
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bounty">Bounty</SelectItem>
                <SelectItem value="job">Job</SelectItem>
                <SelectItem value="project">Project</SelectItem>
                <SelectItem value="grant">Grant</SelectItem>
                <SelectItem value="hackathon">Hackathon</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Create a tutorial video about..."
                value={formData.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Provide a detailed description of the opportunity..."
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={6}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="organization">Organization *</Label>
                <Input
                  id="organization"
                  placeholder="Your company/project name"
                  value={formData.organization}
                  onChange={(e) =>
                    setFormData({ ...formData, organization: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="contact@company.com"
                  value={formData.contactEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, contactEmail: e.target.value })
                  }
                  required
                />
              </div>
            </div>
          </div>

          {/* Type-Specific Fields */}
          {opportunityType === "bounty" && (
            <div className="space-y-2">
              <Label htmlFor="category">Bounty Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    category: value as BountyCategory,
                  })
                }
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="content">Content Creation</SelectItem>
                  <SelectItem value="code">Code/Development</SelectItem>
                  <SelectItem value="ux">UX/UI Design</SelectItem>
                  <SelectItem value="graphic-design">Graphic Design</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="research">Research</SelectItem>
                  <SelectItem value="video">Video Production</SelectItem>
                  <SelectItem value="community">
                    Community Management
                  </SelectItem>
                  <SelectItem value="translation">Translation</SelectItem>
                  <SelectItem value="testing">Testing/QA</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {opportunityType === "job" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jobType">Job Type *</Label>
                <Select
                  value={formData.jobType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, jobType: value as JobType })
                  }
                >
                  <SelectTrigger id="jobType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="Remote, San Francisco, etc."
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  required
                />
              </div>
            </div>
          )}

          {opportunityType === "project" && (
            <div className="space-y-2">
              <Label htmlFor="duration">Project Duration *</Label>
              <Select
                value={formData.duration}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    duration: value as ProjectDuration,
                  })
                }
              >
                <SelectTrigger id="duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short-term">
                    Short-term ({"<"} 1 month)
                  </SelectItem>
                  <SelectItem value="medium-term">
                    Medium-term (1-3 months)
                  </SelectItem>
                  <SelectItem value="long-term">
                    Long-term ({"> "}3 months)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Compensation */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Compensation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">
                  {opportunityType === "job" ? "Salary" : "Reward Amount"} *
                </Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="1000"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency *</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      currency: value as typeof formData.currency,
                    })
                  }
                >
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USDC">USDC</SelectItem>
                    <SelectItem value="SOL">SOL</SelectItem>
                    <SelectItem value="BNB">BNB</SelectItem>
                    <SelectItem value="ETH">ETH</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline *</Label>
            <Input
              id="deadline"
              type="datetime-local"
              value={formData.deadline}
              onChange={(e) =>
                setFormData({ ...formData, deadline: e.target.value })
              }
              required
            />
          </div>

          {/* Difficulty Level */}
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty Level *</Label>
            <Select
              value={formData.difficultyLevel}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  difficultyLevel: value as DifficultyLevel,
                })
              }
            >
              <SelectTrigger id="difficulty">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="Add tags (e.g., web3, design, solana)"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Required Skills */}
          <div className="space-y-2">
            <Label htmlFor="skills">Required Skills</Label>
            <div className="flex gap-2">
              <Input
                id="skills"
                placeholder="Add required skills (e.g., React, Figma)"
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
              />
              <Button type="button" onClick={handleAddSkill} variant="outline">
                Add
              </Button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="gap-1">
                    {skill}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveSkill(skill)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Submission URL */}
          <div className="space-y-2">
            <Label htmlFor="submissionUrl">Submission URL (Optional)</Label>
            <Input
              id="submissionUrl"
              type="url"
              placeholder="https://..."
              value={formData.submissionUrl}
              onChange={(e) =>
                setFormData({ ...formData, submissionUrl: e.target.value })
              }
            />
          </div>

          {/* Detailed Description */}
          <div className="space-y-2">
            <Label htmlFor="detailedDescription">
              Detailed Description (Markdown supported)
            </Label>
            <Textarea
              id="detailedDescription"
              placeholder="## Mission&#10;Describe your opportunity in detail...&#10;&#10;## What You'll Build&#10;- Feature 1&#10;- Feature 2"
              value={formData.detailedDescription}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData({
                  ...formData,
                  detailedDescription: e.target.value,
                })
              }
              rows={12}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Supports Markdown: **bold**, *italic*, [links](url), ## headers, -
              lists
            </p>
          </div>

          {/* Submission Guidelines */}
          <div className="space-y-2">
            <Label htmlFor="submissionGuidelines">
              Submission Guidelines (Markdown supported)
            </Label>
            <Textarea
              id="submissionGuidelines"
              placeholder="## How to Submit&#10;1. Create your project&#10;2. Submit via [this form](url)&#10;3. Include required materials"
              value={formData.submissionGuidelines}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData({
                  ...formData,
                  submissionGuidelines: e.target.value,
                })
              }
              rows={8}
              className="font-mono text-sm"
            />
          </div>

          {/* About Organization */}
          <div className="space-y-2">
            <Label htmlFor="aboutOrganization">
              About Your Organization (Optional)
            </Label>
            <Textarea
              id="aboutOrganization"
              placeholder="Tell applicants about your company or project..."
              value={formData.aboutOrganization}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData({ ...formData, aboutOrganization: e.target.value })
              }
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="default"
          disabled={isSubmitting || userLoading || !authenticated}
        >
          {isSubmitting
            ? "Creating..."
            : userLoading
            ? "Loading..."
            : "Create Opportunity"}
        </Button>
      </div>
    </form>
  );
}
