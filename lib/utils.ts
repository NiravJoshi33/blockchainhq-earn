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
