"use client";

interface ProfileAvatarProps {
  avatarUrl?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-12 h-12 text-lg",
  md: "w-16 h-16 text-xl",
  lg: "w-24 h-24 text-2xl",
};

export function ProfileAvatar({ 
  avatarUrl, 
  name, 
  size = "lg",
  className = "" 
}: ProfileAvatarProps) {
  const nameParts = (name || "").split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";
  const initials = `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
  const sizeClass = sizeClasses[size];

  return (
    <div className={`relative ${className}`}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="Profile"
          className={`${sizeClass} rounded-full object-cover`}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            const fallback = target.parentElement?.querySelector(".avatar-fallback") as HTMLElement;
            if (fallback) fallback.style.display = "flex";
          }}
        />
      ) : null}
      <div className={`avatar-fallback ${sizeClass} rounded-full bg-muted flex items-center justify-center ${avatarUrl ? "hidden absolute inset-0" : ""}`}>
        <span className={`font-semibold text-muted-foreground`}>
          {initials}
        </span>
      </div>
    </div>
  );
}

