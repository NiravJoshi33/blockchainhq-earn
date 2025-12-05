"use client";

import { useUser } from "@/contexts/user-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Edit, Twitter, Github, Linkedin, Globe, MapPin, Briefcase } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ProfilePage() {
  const { user, loading } = useUser();

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

  const nameParts = (user.name || "").split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";
  const username = user.name?.toLowerCase().replace(/\s+/g, "-") || "";
  const twitterHandle = user.twitter_url?.replace("https://x.com/", "").replace("https://twitter.com/", "") || "";
  const githubHandle = user.github_url?.replace("https://github.com/", "").replace("/", "") || "";

  return (
    <div className="container mx-auto py-8 max-w-4xl space-y-8">
      {/* Header with Edit Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground mt-1">
            Your public profile information
          </p>
        </div>
        <Link href="/profile/edit">
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </Link>
      </div>

      {/* PERSONAL INFO */}
      <Card>
        <CardHeader>
          <CardTitle>PERSONAL INFO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Picture */}
          <div className="flex items-center gap-6">
            {user.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt="Profile"
                width={96}
                height={96}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                <span className="text-2xl font-semibold text-muted-foreground">
                  {firstName.charAt(0).toUpperCase()}
                  {lastName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold">
                {user.name || "No name set"}
              </h2>
              <p className="text-muted-foreground">@{username}</p>
              {user.email && (
                <p className="text-sm text-muted-foreground mt-1">
                  {user.email}
                </p>
              )}
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Bio</h3>
              <p className="text-sm">{user.bio}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SOCIALS */}
      {(user.twitter_url || user.github_url || user.portfolio_url) && (
        <Card>
          <CardHeader>
            <CardTitle>SOCIALS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {user.twitter_url && (
              <div className="flex items-center gap-3">
                <Twitter className="h-5 w-5 text-muted-foreground" />
                <a
                  href={user.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:underline"
                >
                  {twitterHandle ? `x.com/${twitterHandle}` : user.twitter_url}
                </a>
              </div>
            )}

            {user.github_url && (
              <div className="flex items-center gap-3">
                <Github className="h-5 w-5 text-muted-foreground" />
                <a
                  href={user.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:underline"
                >
                  {githubHandle ? `github.com/${githubHandle}` : user.github_url}
                </a>
              </div>
            )}

            {user.portfolio_url && (
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <a
                  href={user.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:underline"
                >
                  {user.portfolio_url}
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* WORK */}
      <Card>
        <CardHeader>
          <CardTitle>WORK</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Work Experience
              </h3>
              <p className="text-sm text-muted-foreground">
                Not specified
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </h3>
              <p className="text-sm text-muted-foreground">
                Not specified
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SKILLS */}
      {user.skills && user.skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State for Skills */}
      {(!user.skills || user.skills.length === 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No skills added yet. Edit your profile to add skills.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
