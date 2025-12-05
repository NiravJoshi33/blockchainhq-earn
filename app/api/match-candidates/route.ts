import { NextRequest, NextResponse } from "next/server";
import { matchCandidatesForOpportunity } from "@/lib/ai-service";

/**
 * API Route: Match candidates for an opportunity using AI
 * POST /api/match-candidates
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { opportunityData, options } = body;

    if (!opportunityData) {
      return NextResponse.json(
        { error: "Opportunity data is required" },
        { status: 400 }
      );
    }

    // Run AI matching on the server
    const result = await matchCandidatesForOpportunity(
      opportunityData,
      options || {
        minMatchScore: 70,
        maxCandidates: 20,
        sendNotifications: true,
      }
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in match-candidates API:", error);
    return NextResponse.json(
      {
        error: "Failed to match candidates",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
