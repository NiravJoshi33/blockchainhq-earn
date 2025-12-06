import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileAvatar } from "./profile-avatar";

interface PersonalInfoCardProps {
  user: {
    name?: string | null;
    email?: string | null;
    bio?: string | null;
    avatar_url?: string | null;
  };
  username?: string;
}

export function PersonalInfoCard({ user, username }: PersonalInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>PERSONAL INFO</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Picture */}
        <div className="flex items-center gap-6">
          <ProfileAvatar 
            avatarUrl={user.avatar_url} 
            name={user.name}
            size="lg"
          />
          <div>
            <h2 className="text-2xl font-bold">
              {user.name || "No name set"}
            </h2>
            {username && (
              <p className="text-muted-foreground">@{username}</p>
            )}
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
  );
}

