export interface AiDecision {
  confidence: number;
  needs_property_id: boolean;
  parameters: Record<string, unknown>;
  reasoning: string;
  tool_name: string;
}

export interface DimensionHeader {
  name: string;
}

export interface MetricHeader {
  name: string;
  type_?: string;
}

export interface DimensionValue {
  value: string;
}

export interface MetricValue {
  value: string;
}

export interface GA4Row {
  dimension_values: DimensionValue[];
  metric_values: MetricValue[];
}

export interface GA4ReportData {
  dimension_headers?: DimensionHeader[];
  metric_headers?: MetricHeader[];
  rows?: GA4Row[];
  metadata?: {
    time_zone?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface PropertySummary {
  display_name: string;
  property: string;
  property_type: string;
}

export interface AccountSummary {
  account: string;
  display_name: string;
  property_summaries?: PropertySummary[];
}

export type MCPResult = GA4ReportData | AccountSummary[] | Record<string, unknown>;

export interface AskResponse {
  success?: boolean;
  query?: string;
  ai_decision: AiDecision;
  ai_summary?: string;
  mcp_result: MCPResult;
  metadata?: {
    tool_used?: string;
    mcp_available?: boolean;
    property_id?: string | null;
  };
  error?: string;
}

export const askQuestion = async (query: string): Promise<AskResponse> => {
  const envUrl = import.meta.env.VITE_API_URL;
  // Route through pages-bff BFF Gateway by default to inject X-API-Key server-side safely
  const apiBase = (envUrl && !envUrl.includes('python-backend') ? envUrl : 'https://pages-bff.vercel.app').replace(/\/$/, '');
  const endpoint = `${apiBase}/api/ask`;
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    let errorMessage = `API hatası (${response.status})`;
    try {
      const errData = await response.json();
      if (errData.detail) {
        errorMessage = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
      } else if (errData.error) {
        errorMessage = errData.error;
      }
    } catch {
      // Fallback to HTTP status text
      if (response.statusText) errorMessage = `${response.statusText} (${response.status})`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
};