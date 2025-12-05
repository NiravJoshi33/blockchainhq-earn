"use client";

import { useState, useEffect, useRef } from "react";
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
import { createOpportunity, updateOpportunity } from "@/lib/supabase/services/opportunities";
import type { Database } from "@/lib/supabase/database.types";
import { usePrivy } from "@privy-io/react-auth";
import { toast } from "sonner";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import {
  blockchainBountyAddress,
  blockchainBountyAbi,
} from "@/components/providers/contract-abi";
import {
  mapFormCategoryToContract,
  convertToWei,
  getBountyIdFromReceipt,
  type ContractBountyCategory,
} from "@/lib/contract/contract-utils";
import { useNetworkSwitch } from "@/lib/contract/use-network-switch";

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
    prizeFirst: "50",
    prizeSecond: "30",
    prizeThird: "20",
  });

  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState("");

  const { user, loading: userLoading } = useUser();
  const { authenticated } = usePrivy();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const processedTxHash = useRef<string | null>(null);
  
  const { ensureCorrectNetwork, isSwitching, isCorrectNetwork } = useNetworkSwitch();
  const { writeContract, data: hash, isPending: isContractPending, error: contractError } = useWriteContract();
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    data: receipt,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: !!hash,
    },
  });

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

  const handleContractSuccess = async (txHash: `0x${string}`, receipt: any) => {
    try {
      if (!user?.id) {
        throw new Error("User not found. Please refresh and try again.");
      }
      
      const contractBountyId = getBountyIdFromReceipt(receipt);
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
          
          ...(opportunityType === "bounty" && { 
            category: formData.category,
          }),
          ...(opportunityType === "job" && {
            job_type: formData.jobType,
            location: formData.location,
          }),
          ...(opportunityType === "project" && { duration: formData.duration }),
        };

      const savedOpportunity = await createOpportunity(opportunityData);
      
      const updateData: any = {};
      
      if (contractBountyId !== null && contractBountyId !== undefined) {
        updateData.contract_bounty_id = String(contractBountyId);
      }
      updateData.transaction_hash = txHash;
      
      if (opportunityType === "bounty" && formData.prizeFirst && formData.prizeSecond && formData.prizeThird) {
        updateData.prize_distribution = {
          first: parseFloat(formData.prizeFirst),
          second: parseFloat(formData.prizeSecond),
          third: parseFloat(formData.prizeThird),
        };
        updateData.prize_first = parseFloat(formData.prizeFirst);
        updateData.prize_second = parseFloat(formData.prizeSecond);
        updateData.prize_third = parseFloat(formData.prizeThird);
      }
      
      try {
        await updateOpportunity(savedOpportunity.id, updateData);
      } catch (updateError) {
      }

      toast.success("Opportunity created successfully! 🎉", {
        description: `Your opportunity is now live on-chain. Transaction: ${txHash.slice(0, 10)}...`,
      });
      onSuccess?.();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Please try again.";
      toast.error("Contract transaction succeeded but failed to save to database", {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isConfirmed && receipt && hash && processedTxHash.current !== hash) {
      processedTxHash.current = hash;
      toast.dismiss("create-bounty");
      handleContractSuccess(hash, receipt);
    }
  }, [isConfirmed, receipt, hash]);
  
  useEffect(() => {
    if (hash && !isConfirmed && !isConfirming && !receiptError) {
      const timeout = setTimeout(() => {
        if (processedTxHash.current === hash) {
          return;
        }
        
        toast.info("Transaction may be confirmed. Checking status...", {
          id: "tx-timeout",
          duration: 10000,
        });
      }, 30000);
      
      return () => clearTimeout(timeout);
    }
  }, [hash, isConfirmed, isConfirming, receiptError]);
  
  useEffect(() => {
    if (contractError) {
      toast.dismiss("create-bounty");
      toast.error("Transaction failed", {
        description: contractError.message || "Please try again",
      });
      setIsSubmitting(false);
    }
  }, [contractError]);
  
  useEffect(() => {
    if (receiptError) {
      toast.dismiss("create-bounty");
      toast.warning("Transaction may have succeeded but receipt could not be fetched", {
        description: "Please check the transaction on BSCScan and manually verify",
      });
      setIsSubmitting(false);
    }
  }, [receiptError]);

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
      const isOnCorrectNetwork = await ensureCorrectNetwork();
      
      if (!isOnCorrectNetwork) {
        setIsSubmitting(false);
        toast.error("Please switch to BNB Testnet to continue");
        return;
      }

      const contractDescription = `${formData.title}\n\n${formData.description}`;
      const deadlineTimestamp = Math.floor(new Date(formData.deadline).getTime() / 1000);
      const contractCategory = mapFormCategoryToContract(
        formData.category,
        opportunityType
      );
      const stakeAmount = convertToWei(parseFloat(formData.amount), formData.currency);

      toast.loading("Preparing transaction...", { id: "create-bounty" });

      writeContract({
        address: blockchainBountyAddress as `0x${string}`,
        abi: blockchainBountyAbi,
        functionName: "createBounty",
        args: [
          contractDescription,
          BigInt(deadlineTimestamp),
          contractCategory,
        ],
        value: stakeAmount,
        chainId: 97,
      });

      toast.loading("Waiting for transaction confirmation...", { id: "create-bounty" });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Please try again.";
      toast.error("Failed to create bounty on contract", {
        description: errorMessage,
        id: "create-bounty",
      });
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (contractError) {
      toast.error("Transaction failed", {
        description: contractError.message || "Please try again.",
        id: "create-bounty",
      });
      setIsSubmitting(false);
    }
  }, [contractError]);

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

            {/* Prize Distribution - Only for Bounty type */}
            {opportunityType === "bounty" && (
              <div className="space-y-4 pt-4 border-t">
                <div>
                  <h4 className="text-base font-semibold mb-2">Prize Distribution</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Set the percentage of the total prize pool for each winner position. Total must equal 100%.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prizeFirst">
                      1st Place (%) *
                    </Label>
                    <Input
                      id="prizeFirst"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="50"
                      value={formData.prizeFirst}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData({ ...formData, prizeFirst: value });
                      }}
                      required
                    />
                    {formData.amount && (
                      <p className="text-xs text-muted-foreground">
                        ${(parseFloat(formData.amount) * (parseFloat(formData.prizeFirst) || 0) / 100).toFixed(2)} {formData.currency}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prizeSecond">
                      2nd Place (%) *
                    </Label>
                    <Input
                      id="prizeSecond"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="30"
                      value={formData.prizeSecond}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData({ ...formData, prizeSecond: value });
                      }}
                      required
                    />
                    {formData.amount && (
                      <p className="text-xs text-muted-foreground">
                        ${(parseFloat(formData.amount) * (parseFloat(formData.prizeSecond) || 0) / 100).toFixed(2)} {formData.currency}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prizeThird">
                      3rd Place (%) *
                    </Label>
                    <Input
                      id="prizeThird"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="20"
                      value={formData.prizeThird}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData({ ...formData, prizeThird: value });
                      }}
                      required
                    />
                    {formData.amount && (
                      <p className="text-xs text-muted-foreground">
                        ${(parseFloat(formData.amount) * (parseFloat(formData.prizeThird) || 0) / 100).toFixed(2)} {formData.currency}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Total:</span>
                  <span className={(
                    parseFloat(formData.prizeFirst || "0") +
                    parseFloat(formData.prizeSecond || "0") +
                    parseFloat(formData.prizeThird || "0")
                  ) === 100 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                    {(
                      parseFloat(formData.prizeFirst || "0") +
                      parseFloat(formData.prizeSecond || "0") +
                      parseFloat(formData.prizeThird || "0")
                    ).toFixed(1)}%
                  </span>
                  {(
                    parseFloat(formData.prizeFirst || "0") +
                    parseFloat(formData.prizeSecond || "0") +
                    parseFloat(formData.prizeThird || "0")
                  ) !== 100 && (
                    <span className="text-xs text-red-600">(Must equal 100%)</span>
                  )}
                </div>
              </div>
            )}
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
          disabled={isSubmitting || isContractPending || isConfirming || userLoading || !authenticated}
        >
          {isSubmitting || isContractPending || isConfirming
            ? isContractPending
              ? "Confirming transaction..."
              : isConfirming
              ? "Waiting for confirmation..."
              : "Creating..."
            : userLoading
            ? "Loading..."
            : "Create Opportunity"}
        </Button>
      </div>
    </form>
  );
}
