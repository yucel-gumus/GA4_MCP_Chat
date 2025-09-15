export interface AiDecision {
  confidence: number;
  needs_property_id: boolean;
  parameters: object;
  reasoning: string;
  tool_name: string;
}

export interface AskResponse {
ai_decision: AiDecision;
mcp_result: object;
metadata: object;
}

export const askQuestion = async (query: string): Promise<AskResponse> => {
  const response = await fetch('/api/ask', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query })
  });

  if (!response.ok) {
    throw new Error('API request failed');
  }

  return response.json();
};