"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import { updateUserProfile } from "@/lib/supabase/services/users";
import { uploadProfileImage } from "@/lib/supabase/services/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Upload,
  X,
  Plus,
  Twitter,
  Github,
  Linkedin,
  Globe,
  Loader2,
} from "lucide-react";

// Available skills list
const ALL_SKILLS = [
  "Frontend",
  "React",
  "Vue",
  "Svelte",
  "Angular",
  "SolidJS",
  "Redux",
  "Blockchain",
  "Rust",
  "Solidity",
  "Move",
  "Backend",
  "Javascript",
  "Typescript",
  "Node.js",
  "MySQL",
  "Postgres",
  "MongoDB",
  "UI/UX Design",
];

// Web3 areas
const WEB3_AREAS = [
  "DeFi",
  "NFTs",
  "Gaming",
  "DAOs",
  "Infrastructure",
  "Security",
  "Developer Tools",
  "Social",
  "Identity",
  "Other",
];

// Experience levels
const EXPERIENCE_LEVELS = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert",
];

// Work preferences
const WORK_PREFERENCES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Freelance",
  "Bounty",
  "Grant",
];

// Countries (simplified list)
const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Singapore",
  "Japan",
  "Brazil",
  "Other",
];

export default function ProfileEditPage() {
  const router = useRouter();
  const { user, loading, refreshUser } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null
  );

  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    oneLineBio: "",
    twitter: "",
    github: "",
    linkedin: "",
    website: "",
    web3Areas: "",
    workExperience: "",
    location: "",
    workPreference: "",
    proofOfWork: [] as string[],
    skills: [] as string[],
  });

  useEffect(() => {
    if (user) {
      // Parse user data and populate form
      const nameParts = (user.name || "").split(" ");
      // Get profile_data from user (it's a JSONB field)
      const profileData = (user as any).profile_data as {
        username?: string;
        linkedin?: string;
        web3Areas?: string;
        workExperience?: string;
        location?: string;
        workPreference?: string;
        proofOfWork?: string[];
      } | null;
      
      // Extract LinkedIn from profile_data or from linkedin URL
      let linkedinHandle = "";
      if (profileData?.linkedin) {
        linkedinHandle = profileData.linkedin
          .replace("https://linkedin.com/in/", "")
          .replace("linkedin.com/in/", "")
          .replace("/", "");
      }
      
      setFormData({
        username: profileData?.username || user.name?.toLowerCase().replace(/\s+/g, "-") || "",
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: user.email || "",
        oneLineBio: user.bio || "",
        twitter: user.twitter_url?.replace("https://x.com/", "").replace("https://twitter.com/", "") || "",
        github: user.github_url?.replace("https://github.com/", "").replace("/", "") || "",
        linkedin: linkedinHandle,
        website: user.portfolio_url || "",
        web3Areas: profileData?.web3Areas || "",
        workExperience: profileData?.workExperience || "",
        location: profileData?.location || "",
        workPreference: profileData?.workPreference || "",
        proofOfWork: profileData?.proofOfWork || [],
        skills: user.skills || [],
      });
      
      // Debug: Log the loaded data
      console.log("Profile data loaded:", {
        web3Areas: profileData?.web3Areas,
        workExperience: profileData?.workExperience,
        location: profileData?.location,
        workPreference: profileData?.workPreference,
      });
      if (user.avatar_url) {
        setProfileImagePreview(user.avatar_url);
      }
    }
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5 MB");
        return;
      }
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSkill = (skill: string) => {
    if (!formData.skills.includes(skill)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skill],
      }));
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const handleAddProject = () => {
    const project = prompt("Enter project URL:");
    if (project && project.trim()) {
      setFormData((prev) => ({
        ...prev,
        proofOfWork: [...prev.proofOfWork, project.trim()],
      }));
    }
  };

  const handleRemoveProject = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      proofOfWork: prev.proofOfWork.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!formData.firstName || !formData.lastName || !formData.username || !formData.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.skills.length === 0) {
      toast.error("Please select at least one skill");
      return;
    }

    setIsSubmitting(true);

    try {
      // Build social URLs
      const socialData = {
        twitter: formData.twitter
          ? `https://x.com/${formData.twitter.replace("x.com/", "").replace("@", "")}`
          : null,
        github: formData.github
          ? `https://github.com/${formData.github.replace("github.com/", "").replace("/", "")}`
          : null,
        linkedin: formData.linkedin
          ? `https://linkedin.com/in/${formData.linkedin.replace("linkedin.com/in/", "").replace("/", "")}`
          : null,
        website: formData.website
          ? (formData.website.startsWith("http")
              ? formData.website
              : `https://${formData.website}`)
          : null,
      };

      // Upload profile image if changed
      let avatarUrl = user.avatar_url;
      if (profileImage) {
        try {
          toast.loading("Uploading profile image...", { id: "upload-image" });
          avatarUrl = await uploadProfileImage(profileImage, user.id);
          toast.success("Image uploaded successfully", { id: "upload-image" });
        } catch (error: any) {
          toast.error("Failed to upload image", {
            description: error.message || "Please try again",
            id: "upload-image",
          });
          // Continue with existing avatar URL if upload fails
        }
      }

      // Prepare additional profile data to store in JSON field
      const additionalProfileData = {
        username: formData.username,
        linkedin: socialData.linkedin,
        web3Areas: formData.web3Areas,
        workExperience: formData.workExperience,
        location: formData.location,
        workPreference: formData.workPreference,
        proofOfWork: formData.proofOfWork,
      };

      await updateUserProfile(user.id, {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        bio: formData.oneLineBio,
        github_url: socialData.github,
        twitter_url: socialData.twitter,
        portfolio_url: socialData.website,
        avatar_url: avatarUrl,
        skills: formData.skills,
        // Store additional fields in JSON column
        // NOTE: You need to add a 'profile_data' JSONB column to your Supabase users table
        // Run this SQL in Supabase SQL Editor:
        // ALTER TABLE users ADD COLUMN profile_data JSONB;
        profile_data: additionalProfileData,
      });

      toast.success("Profile updated successfully! 🎉");
      await refreshUser();
      // Redirect to profile page after successful update
      router.push("/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Please connect your wallet to view your profile
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const availableSkills = ALL_SKILLS.filter(
    (skill) => !formData.skills.includes(skill)
  );

  return (
    <div className="container mx-auto py-8 max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Edit Profile</h1>
        <p className="text-muted-foreground mt-1">
          Update your profile information to help sponsors find you
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* PERSONAL INFO */}
        <Card>
          <CardHeader>
            <CardTitle>PERSONAL INFO</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Picture */}
            <div className="space-y-2">
              <Label>Profile Picture</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <input
                  type="file"
                  id="profile-image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="profile-image"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  {profileImagePreview ? (
                    <img
                      src={profileImagePreview}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover mx-auto mb-2"
                    />
                  ) : (
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                  )}
                  <span className="text-sm font-medium">
                    Choose or drag and drop media
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Maximum size 5 MB
                  </span>
                </label>
              </div>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">
                Username <span className="text-destructive">*</span>
              </Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                placeholder="username"
              />
            </div>

            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName">
                First Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                placeholder="Jaydip"
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName">
                Last Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                placeholder="patel"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="your.email@example.com"
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="oneLineBio">Bio</Label>
              <Textarea
                id="oneLineBio"
                name="oneLineBio"
                value={formData.oneLineBio}
                onChange={handleInputChange}
                maxLength={200}
                placeholder="One line bio"
                rows={2}
              />
              <p className="text-xs text-muted-foreground">
                {200 - formData.oneLineBio.length} characters left
              </p>
            </div>
          </CardContent>
        </Card>

        {/* SOCIALS */}
        <Card>
          <CardHeader>
            <CardTitle>SOCIALS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="twitter" className="flex items-center gap-2">
                <Twitter className="h-4 w-4" />
                X (Twitter)
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">x.com/</span>
                <Input
                  id="twitter"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleInputChange}
                  placeholder="johncena"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="github" className="flex items-center gap-2">
                <Github className="h-4 w-4" />
                GitHub
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  github.com/
                </span>
                <Input
                  id="github"
                  name="github"
                  value={formData.github}
                  onChange={handleInputChange}
                  placeholder="jaydippatel83"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin" className="flex items-center gap-2">
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  linkedin.com/in/
                </span>
                <Input
                  id="linkedin"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  placeholder="johncena"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Website
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">https://</span>
                <Input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="starkindustries.com"
                  className="flex-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* WORK */}
        <Card>
          <CardHeader>
            <CardTitle>WORK</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="web3Areas">
                What areas of Web3 are you most interested in?
              </Label>
              <Select
                key={`web3Areas-${formData.web3Areas}`}
                value={formData.web3Areas || undefined}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, web3Areas: value }))
                }
              >
                <SelectTrigger id="web3Areas">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {WEB3_AREAS.map((area) => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="workExperience">Work Experience</Label>
              <Select
                key={`workExperience-${formData.workExperience}`}
                value={formData.workExperience || undefined}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, workExperience: value }))
                }
              >
                <SelectTrigger id="workExperience">
                  <SelectValue placeholder="Pick Your Experience" />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select
                key={`location-${formData.location}`}
                value={formData.location || undefined}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, location: value }))
                }
              >
                <SelectTrigger id="location">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="workPreference">Work Preference</Label>
              <Select
                key={`workPreference-${formData.workPreference}`}
                value={formData.workPreference || undefined}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, workPreference: value }))
                }
              >
                <SelectTrigger id="workPreference">
                  <SelectValue placeholder="Type of Work" />
                </SelectTrigger>
                <SelectContent>
                  {WORK_PREFERENCES.map((pref) => (
                    <SelectItem key={pref} value={pref}>
                      {pref}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* PROOF OF WORK */}
        <Card>
          <CardHeader>
            <CardTitle>Proof of Work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Add project URL"
                readOnly
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddProject}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            </div>
            {formData.proofOfWork.length > 0 && (
              <div className="space-y-2">
                {formData.proofOfWork.map((project, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 border rounded-lg"
                  >
                    <span className="text-sm truncate flex-1">{project}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveProject(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* SKILLS */}
        <Card>
          <CardHeader>
            <CardTitle>
              Skills Needed{" "}
              <span className="text-destructive text-base">*</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground font-normal">
              We will send email notifications of new listings for your selected
              skills
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            {availableSkills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {availableSkills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => handleAddSkill(skill)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {skill}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* SUBMIT BUTTON */}
        <div className="flex justify-end">
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="min-w-[200px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Profile"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

