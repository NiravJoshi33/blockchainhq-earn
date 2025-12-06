import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, MapPin } from "lucide-react";

interface WorkInfoCardProps {
  profileData?: {
    workExperience?: string;
    location?: string;
    workPreference?: string;
    web3Areas?: string;
  } | null;
}

export function WorkInfoCard({ profileData }: WorkInfoCardProps) {
  const hasAnyWorkInfo = 
    profileData?.workExperience || 
    profileData?.location || 
    profileData?.workPreference || 
    profileData?.web3Areas;

  if (!hasAnyWorkInfo) return null;

  return (
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
  );
}

