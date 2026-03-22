import type { DailyRecordSummary, InsightCardData } from "@/types";

type NormalizedPerformanceData = {
  records: DailyRecordSummary[];
  metadata?: {
    windowLabel?: string;
  };
};

type PerformanceAnalysis = {
  summary: string;
  insights: InsightCardData[];
  recommendations: string[];
};

/**
 * Future AI boundary:
 * 1. Aggregate 7/30/90 day data on the server.
 * 2. Send normalized summaries to an AI endpoint.
 * 3. Merge AI narrative with deterministic guardrails before rendering.
 */
export async function analyzePerformanceData(
  data: NormalizedPerformanceData,
  fallbackInsights: InsightCardData[],
): Promise<PerformanceAnalysis> {
  return {
    summary: `Rule-based analysis across ${data.records.length} tracked days${
      data.metadata?.windowLabel ? ` (${data.metadata.windowLabel})` : ""
    }.`,
    insights: fallbackInsights,
    recommendations: fallbackInsights
      .map((insight) => insight.recommendation)
      .filter((recommendation): recommendation is string => Boolean(recommendation)),
  };
}

export async function summarizeWeek(
  data: NormalizedPerformanceData,
  fallbackSummary: string,
) {
  return {
    summary: fallbackSummary,
    recordCount: data.records.length,
  };
}

export async function recommendOptimizations(
  data: NormalizedPerformanceData,
  fallbackRecommendations: string[],
) {
  return {
    recommendations: fallbackRecommendations,
    inputWindow: data.metadata?.windowLabel ?? `${data.records.length} days`,
  };
}
