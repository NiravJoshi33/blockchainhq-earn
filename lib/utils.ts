import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate a random username
export function generateRandomUsername(): string {
  const adjectives = [
    "swift", "bright", "bold", "cool", "sharp", "quick", "smart", "brave",
    "calm", "clever", "daring", "eager", "fierce", "gentle", "happy", "jolly",
    "kind", "lively", "mighty", "noble", "proud", "quiet", "rapid", "smooth",
    "tough", "vivid", "witty", "zealous", "cosmic", "stellar", "lunar", "solar"
  ];
  
  const nouns = [
    "hunter", "explorer", "builder", "creator", "coder", "designer", "artist",
    "warrior", "wizard", "ninja", "knight", "pilot", "captain", "hero", "star",
    "moon", "sun", "comet", "planet", "galaxy", "nebula", "phoenix", "dragon",
    "tiger", "eagle", "wolf", "lion", "fox", "bear", "hawk", "falcon"
  ];
  
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(Math.random() * 10000);
  
  return `${randomAdjective}-${randomNoun}-${randomNumber}`;
}

// Generate avatar URL using UI Avatars (or DiceBear)
export function generateAvatarUrl(name?: string, size: number = 200): string {
  if (name) {
    // Use UI Avatars with initials (returns PNG)
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=${size}&background=random&color=fff&bold=true&format=png`;
  }
  
  // Fallback: use DiceBear with random seed (use PNG format instead of SVG)
  const randomSeed = Math.random().toString(36).substring(7);
  return `https://api.dicebear.com/7.x/avataaars/png?seed=${randomSeed}&size=${size}`;
}

/**
 * Format a date as relative time (e.g., "just now", "1 min ago", "1 hour ago", "1 day ago")
 * @param date - Date string, Date object, or timestamp number
 * @returns Formatted relative time string
 */
export function formatTimeAgo(date: string | Date | number | null | undefined): string {
  if (!date) return "Unknown";
  
  let dateObj: Date;
  
  // Handle different input types
  if (typeof date === "string") {
    dateObj = new Date(date);
  } else if (typeof date === "number") {
    // If it's a timestamp in seconds (Unix timestamp), convert to milliseconds
    dateObj = date < 10000000000 ? new Date(date * 1000) : new Date(date);
  } else {
    dateObj = date;
  }
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return "Unknown";
  }
  
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSeconds < 60) {
    return "just now";
  } else if (diffMinutes < 60) {
    return `${diffMinutes} min${diffMinutes > 1 ? "s" : ""} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  } else if (diffDays < 30) {
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  } else {
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) {
      return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
    } else {
      const diffYears = Math.floor(diffMonths / 12);
      return `${diffYears} year${diffYears > 1 ? "s" : ""} ago`;
    }
  }
}
