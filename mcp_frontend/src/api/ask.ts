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
  const apiBase = import.meta.env.VITE_API_URL || '';
  const apiKey = import.meta.env.VITE_API_KEY || 'a9c0347c273b6e94df81d6734fd6735a645d0f36ef0e5ea553901a95bc47de5f';
  const response = await fetch(`${apiBase}/api/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
    },
    body: JSON.stringify({ query })
  });

  if (!response.ok) {
    throw new Error('API request failed');
  }

  return response.json();
};