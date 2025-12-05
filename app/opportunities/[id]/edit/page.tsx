"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getOpportunityById, updateOpportunity } from "@/lib/supabase/services/opportunities";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useUser } from "@/contexts/user-context";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Database } from "@/lib/supabase/database.types";

type Opportunity = Database["public"]["Tables"]["opportunities"]["Row"];

export default function EditOpportunityPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    organization: "",
    amount: "",
    currency: "USDC" as const,
    deadline: "",
    category: "content" as string,
    location: "",
    submissionUrl: "",
    contactEmail: "",
    detailedDescription: "",
    submissionGuidelines: "",
    aboutOrganization: "",
  });
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState("");

  useEffect(() => {
    async function fetchOpportunity() {
      try {
        const id = params.id as string;
        const data = await getOpportunityById(id);
        
        if ((data as any).contract_bounty_id) {
          toast.error("On-chain bounties cannot be edited");
          router.push(`/opportunities/${id}`);
          return;
        }

        if (data.created_by !== user?.id) {
          toast.error("You can only edit your own opportunities");
          router.push(`/opportunities/${id}`);
          return;
        }

        setOpportunity(data);
        
        setFormData({
          title: data.title || "",
          description: data.description || "",
          organization: data.organization || "",
          amount: data.amount?.toString() || "",
          currency: (data.currency as "USDC") || "USDC",
          deadline: data.deadline ? new Date(data.deadline).toISOString().split('T')[0] : "",
          category: data.category || "content",
          location: data.location || "",
          submissionUrl: data.submission_url || "",
          contactEmail: data.contact_email || "",
          detailedDescription: data.detailed_description || "",
          submissionGuidelines: data.submission_guidelines || "",
          aboutOrganization: data.about_organization || "",
        });
        
        setTags(data.tags || []);
        setSkills(data.required_skills || []);
      } catch (error: any) {
        toast.error("Failed to load opportunity", {
          description: error.message || "Please try again",
        });
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    }

    if (params.id && user?.id) {
      fetchOpportunity();
    }
  }, [params.id, user?.id, router]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!opportunity) return;

    setSaving(true);

    try {
      await updateOpportunity(opportunity.id, {
        title: formData.title,
        description: formData.description,
        organization: formData.organization,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
        category: formData.category,
        location: formData.location || null,
        submission_url: formData.submissionUrl || null,
        contact_email: formData.contactEmail || null,
        detailed_description: formData.detailedDescription || null,
        submission_guidelines: formData.submissionGuidelines || null,
        about_organization: formData.aboutOrganization || null,
        tags: tags.length > 0 ? tags : null,
        required_skills: skills.length > 0 ? skills : null,
      });

      toast.success("Opportunity updated successfully");
      router.push(`/opportunities/${opportunity.id}`);
    } catch (error: any) {
      toast.error("Failed to update opportunity", {
        description: error.message || "Please try again",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 max-w-4xl">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="container mx-auto py-10 max-w-4xl">
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">Opportunity not found</p>
            <Button asChild className="mt-4">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <div className="mb-6">
        <Link href={`/opportunities/${opportunity.id}`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Opportunity
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit Opportunity</h1>
        <p className="text-muted-foreground mt-2">
          Update the details of your opportunity
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Update the basic details of your opportunity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="organization">Organization *</Label>
                <Input
                  id="organization"
                  value={formData.organization}
                  onChange={(e) =>
                    setFormData({ ...formData, organization: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="content">Content</SelectItem>
                    <SelectItem value="code">Code</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
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
                  onValueChange={(value: "USDC") =>
                    setFormData({ ...formData, currency: value })
                  }
                >
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USDC">USDC</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="ETH">ETH</SelectItem>
                    <SelectItem value="BNB">BNB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline *</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) =>
                  setFormData({ ...formData, deadline: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="Remote, San Francisco, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email *</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) =>
                  setFormData({ ...formData, contactEmail: e.target.value })
                }
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Details</CardTitle>
            <CardDescription>
              Add more information about your opportunity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="detailedDescription">Detailed Description</Label>
              <Textarea
                id="detailedDescription"
                value={formData.detailedDescription}
                onChange={(e) =>
                  setFormData({ ...formData, detailedDescription: e.target.value })
                }
                rows={6}
                placeholder="Provide more details about the opportunity..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="submissionGuidelines">Submission Guidelines</Label>
              <Textarea
                id="submissionGuidelines"
                value={formData.submissionGuidelines}
                onChange={(e) =>
                  setFormData({ ...formData, submissionGuidelines: e.target.value })
                }
                rows={4}
                placeholder="How should applicants submit their work?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aboutOrganization">About Organization</Label>
              <Textarea
                id="aboutOrganization"
                value={formData.aboutOrganization}
                onChange={(e) =>
                  setFormData({ ...formData, aboutOrganization: e.target.value })
                }
                rows={4}
                placeholder="Tell applicants about your organization..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="submissionUrl">Submission URL</Label>
              <Input
                id="submissionUrl"
                type="url"
                value={formData.submissionUrl}
                onChange={(e) =>
                  setFormData({ ...formData, submissionUrl: e.target.value })
                }
                placeholder="https://..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tags & Skills</CardTitle>
            <CardDescription>
              Add tags and required skills for this opportunity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Add a tag"
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-destructive"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Required Skills</Label>
              <div className="flex gap-2">
                <Input
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="Add a skill"
                />
                <Button type="button" onClick={handleAddSkill} variant="outline">
                  Add
                </Button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm flex items-center gap-1"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-destructive"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

