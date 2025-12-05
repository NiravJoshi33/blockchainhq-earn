import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { Badge } from "@/components/ui/badge";

interface OpportunityContentCardProps {
  title: string;
  content?: string | null;
  type?: "text" | "markdown" | "skills";
  skills?: string[] | null;
}

export function OpportunityContentCard({ 
  title, 
  content, 
  type = "text",
  skills 
}: OpportunityContentCardProps) {
  if (!content && (!skills || skills.length === 0)) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {type === "markdown" && content && (
          <MarkdownRenderer content={content} />
        )}
        {type === "text" && content && (
          <p className="text-muted-foreground whitespace-pre-wrap">
            {content}
          </p>
        )}
        {type === "skills" && skills && skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

