"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Twitter, Github, Linkedin, Globe, MapPin, Briefcase, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";

type User = Database["public"]["Tables"]["users"]["Row"];

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) throw error;
        setUser(data);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchUser();
    }
  }, [userId]);

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
            <p className="text-muted-foreground">User not found</p>
            <Link href="/opportunities">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Opportunities
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const nameParts = (user.name || "").split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";
  
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
  
  const username = profileData?.username || user.name?.toLowerCase().replace(/\s+/g, "-") || "";
  const twitterHandle = user.twitter_url?.replace("https://x.com/", "").replace("https://twitter.com/", "") || "";
  const githubHandle = user.github_url?.replace("https://github.com/", "").replace("/", "") || "";
  const linkedinUrl = profileData?.linkedin || null;

  return (
    <div className="container mx-auto py-8 max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Link href="/opportunities" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground mt-1">
            {user.name || "User"}'s public profile
          </p>
        </div>
      </div>

      {/* PERSONAL INFO */}
      <Card>
        <CardHeader>
          <CardTitle>PERSONAL INFO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Picture */}
          <div className="flex items-center gap-6">
            <div className="relative">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const fallback = target.parentElement?.querySelector(".avatar-fallback") as HTMLElement;
                    if (fallback) fallback.style.display = "flex";
                  }}
                />
              ) : null}
              <div className={`avatar-fallback w-24 h-24 rounded-full bg-muted flex items-center justify-center ${user.avatar_url ? "hidden absolute inset-0" : ""}`}>
                <span className="text-2xl font-semibold text-muted-foreground">
                  {firstName.charAt(0).toUpperCase()}
                  {lastName.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
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
              {user.wallet_address && (
                <p className="text-xs text-muted-foreground mt-1 font-mono">
                  {user.wallet_address.slice(0, 6)}...{user.wallet_address.slice(-4)}
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
      {(user.twitter_url || user.github_url || user.portfolio_url || linkedinUrl) && (
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

            {linkedinUrl && (
              <div className="flex items-center gap-3">
                <Linkedin className="h-5 w-5 text-muted-foreground" />
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:underline"
                >
                  {linkedinUrl.replace("https://linkedin.com/in/", "linkedin.com/in/")}
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
            {profileData?.workExperience && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Work Experience
                </h3>
                <p className="text-sm">{profileData.workExperience}</p>
              </div>
            )}

            {profileData?.location && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </h3>
                <p className="text-sm">{profileData.location}</p>
              </div>
            )}

            {profileData?.workPreference && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Work Preference</h3>
                <p className="text-sm">{profileData.workPreference}</p>
              </div>
            )}

            {profileData?.web3Areas && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Web3 Areas</h3>
                <p className="text-sm">{profileData.web3Areas}</p>
              </div>
            )}
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
    </div>
  );
}

