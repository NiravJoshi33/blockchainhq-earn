import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Twitter, Github, Linkedin, Globe } from "lucide-react";

interface SocialLinksCardProps {
  twitterUrl?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
}

export function SocialLinksCard({
  twitterUrl,
  githubUrl,
  linkedinUrl,
  portfolioUrl,
}: SocialLinksCardProps) {
  const hasAnyLink = twitterUrl || githubUrl || linkedinUrl || portfolioUrl;

  if (!hasAnyLink) return null;

  const twitterHandle = twitterUrl?.replace("https://x.com/", "").replace("https://twitter.com/", "") || "";
  const githubHandle = githubUrl?.replace("https://github.com/", "").replace("/", "") || "";

  return (
    <Card>
      <CardHeader>
        <CardTitle>SOCIALS</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {twitterUrl && (
          <div className="flex items-center gap-3">
            <Twitter className="h-5 w-5 text-muted-foreground" />
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:underline"
            >
              {twitterHandle ? `x.com/${twitterHandle}` : twitterUrl}
            </a>
          </div>
        )}

        {githubUrl && (
          <div className="flex items-center gap-3">
            <Github className="h-5 w-5 text-muted-foreground" />
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:underline"
            >
              {githubHandle ? `github.com/${githubHandle}` : githubUrl}
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

        {portfolioUrl && (
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <a
              href={portfolioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:underline"
            >
              {portfolioUrl}
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

