"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TelegramConnect } from "@/components/profile/telegram-connect";
import { useUser } from "@/contexts/user-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  User,
  Briefcase,
  Link as LinkIcon,
  Github,
  Twitter,
  Linkedin,
} from "lucide-react";

export default function ProfilePage() {
  const { user } = useUser();

  if (!user) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Please connect your wallet to view your profile.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Your personal details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Your name"
              defaultValue={user.name || ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              defaultValue={user.email || ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell us about yourself..."
              defaultValue={user.bio || ""}
              rows={4}
            />
          </div>

          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Skills
          </CardTitle>
          <CardDescription>
            Add skills to get better opportunity matches
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {user.skills && user.skills.length > 0 ? (
              user.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No skills added yet. Add skills to receive better job matches!
              </p>
            )}
          </div>
          <Button variant="outline">Manage Skills</Button>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Social Links
          </CardTitle>
          <CardDescription>Connect your social profiles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="portfolio" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Portfolio
            </Label>
            <Input
              id="portfolio"
              type="url"
              placeholder="https://yourportfolio.com"
              defaultValue={user.portfolio_url || ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="github" className="flex items-center gap-2">
              <Github className="h-4 w-4" />
              GitHub
            </Label>
            <Input
              id="github"
              type="url"
              placeholder="https://github.com/yourusername"
              defaultValue={user.github_url || ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitter" className="flex items-center gap-2">
              <Twitter className="h-4 w-4" />
              Twitter
            </Label>
            <Input
              id="twitter"
              type="url"
              placeholder="https://twitter.com/yourusername"
              defaultValue={user.twitter_url || ""}
            />
          </div>

          <Button>Save Links</Button>
        </CardContent>
      </Card>

      {/* Telegram Connection */}
      <TelegramConnect />

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your blockchain account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-sm text-muted-foreground">
              Wallet Address
            </Label>
            <p className="text-sm font-mono bg-muted px-3 py-2 rounded mt-1 break-all">
              {user.wallet_address}
            </p>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Role</Label>
            <div className="mt-1">
              <Badge variant={user.role === "hunter" ? "default" : "secondary"}>
                {user.role === "hunter" ? "Hunter (Candidate)" : "Sponsor"}
              </Badge>
            </div>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">
              Member Since
            </Label>
            <p className="text-sm mt-1">
              {user.created_at
                ? new Date(user.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Unknown"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
