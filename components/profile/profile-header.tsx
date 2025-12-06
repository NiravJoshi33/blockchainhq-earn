import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import Link from "next/link";

interface ProfileHeaderProps {
  showEditButton?: boolean;
  title?: string;
  subtitle?: string;
}

export function ProfileHeader({ 
  showEditButton = true, 
  title = "Profile",
  subtitle = "Your public profile information" 
}: ProfileHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground mt-1">{subtitle}</p>
      </div>
      {showEditButton && (
        <Link href="/profile/edit">
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </Link>
      )}
    </div>
  );
}

