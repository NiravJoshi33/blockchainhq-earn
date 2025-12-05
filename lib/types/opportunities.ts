export type OpportunityType =
  | "bounty"
  | "job"
  | "project"
  | "grant"
  | "hackathon";

export type BountyCategory =
  | "content"
  | "code"
  | "ux"
  | "graphic-design"
  | "marketing"
  | "research"
  | "video"
  | "community"
  | "translation"
  | "testing";

export type JobType =
  | "full-time"
  | "part-time"
  | "contract"
  | "freelance"
  | "internship";

export type ProjectDuration =
  | "short-term" // < 1 month
  | "medium-term" // 1-3 months
  | "long-term"; // > 3 months

export type DifficultyLevel =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "expert";

export type OpportunityStatus =
  | "draft"
  | "active"
  | "paused"
  | "completed"
  | "cancelled";

// Base Opportunity Interface
export interface BaseOpportunity {
  id: string;
  title: string;
  description: string;
  organization: string;
  organizationLogo?: string;
  amount: number;
  currency: "USDC" | "SOL" | "BNB" | "ETH" | "USD";
  deadline: number; // timestamp
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
  status: OpportunityStatus;
  tags: string[];
  requiredSkills: string[];
  difficultyLevel: DifficultyLevel;
  submissionUrl?: string;
  contactEmail?: string;
  applicants?: number;
}

// Specific Opportunity Types
export interface Bounty extends BaseOpportunity {
  type: "bounty";
  category: BountyCategory;
  maxSubmissions?: number;
  isRecurring?: boolean;
  verificationRequired?: boolean;
}

export interface Job extends BaseOpportunity {
  type: "job";
  jobType: JobType;
  location: string; // "Remote", "San Francisco", etc.
  salaryRange?: {
    min: number;
    max: number;
  };
  benefits?: string[];
  requirements: string[];
  responsibilities: string[];
}

export interface Project extends BaseOpportunity {
  type: "project";
  duration: ProjectDuration;
  teamSize?: number;
  milestonesCount?: number;
  milestones?: Milestone[];
  isOpenSource?: boolean;
  repositoryUrl?: string;
}

export interface Grant extends BaseOpportunity {
  type: "grant";
  fundingAmount: {
    min: number;
    max: number;
  };
  eligibilityCriteria: string[];
  applicationDeadline: number;
  reviewProcess?: string;
  expectedOutcomes: string[];
}

export interface Hackathon extends BaseOpportunity {
  type: "hackathon";
  startDate: number;
  endDate: number;
  location: string; // "Virtual", "San Francisco", etc.
  maxTeamSize: number;
  tracks?: string[];
  prizes: Prize[];
  partners?: string[];
  judges?: Judge[];
}

// Supporting Types
export interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  deadline: number;
  completed: boolean;
}

export interface Prize {
  id: string;
  position: string; // "1st Place", "2nd Place", "Best Design", etc.
  amount: number;
  description?: string;
}

export interface Judge {
  name: string;
  title: string;
  company: string;
  avatar?: string;
}

// Union type for all opportunities
export type Opportunity = Bounty | Job | Project | Grant | Hackathon;

// Form data type for creating new opportunities
export type CreateOpportunityData = Omit<
  Opportunity,
  "id" | "createdAt" | "updatedAt" | "applicants"
>;
