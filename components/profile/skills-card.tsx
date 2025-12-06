import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SkillsCardProps {
  skills?: string[] | null;
}

export function SkillsCard({ skills }: SkillsCardProps) {
  const hasSkills = skills && skills.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills</CardTitle>
      </CardHeader>
      <CardContent>
        {hasSkills ? (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No skills added yet. Edit your profile to add skills.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

