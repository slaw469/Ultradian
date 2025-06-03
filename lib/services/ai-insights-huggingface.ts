export interface SessionInsights {
  summary: string;
  nextSteps: string[];
  tags: string[];
  activityType: string;
}

export interface SessionData {
  title: string;
  websiteUrl?: string;
  domain?: string;
  duration: number;
  startTime: Date;
  context?: string;
}

export async function generateSessionInsightsHuggingFace(sessionData: SessionData): Promise<SessionInsights> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  
  if (!apiKey) {
    console.log('No Hugging Face API key found, using fallback insights');
    return generateFallbackInsights(sessionData);
  }

  try {
    const prompt = `Analyze this work session and provide insights:

Session: ${sessionData.title}
Website: ${sessionData.websiteUrl || 'Unknown'}
Duration: ${sessionData.duration} minutes

Provide a JSON response with:
- summary: brief description of what the user was doing
- nextSteps: array of 2-3 actionable next steps
- tags: array of 2-4 relevant tags
- activityType: one of CODING, WRITING, RESEARCH, COMMUNICATION, DESIGN, LEARNING, PLANNING, OTHER

Example: {"summary": "Working on...", "nextSteps": ["Step 1", "Step 2"], "tags": ["tag1", "tag2"], "activityType": "CODING"}`;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 200,
            temperature: 0.7,
            return_full_text: false,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const result = await response.json();
    const aiText = result[0]?.generated_text || '';

    // Try to extract JSON from the response
    try {
      const jsonMatch = aiText.match(/\{.*\}/s);
      if (jsonMatch) {
        const insights = JSON.parse(jsonMatch[0]) as SessionInsights;
        if (insights.summary && insights.nextSteps && insights.tags) {
          return insights;
        }
      }
    } catch (parseError) {
      console.error('Failed to parse Hugging Face response:', parseError);
    }

    // If parsing fails, use fallback
    return generateFallbackInsights(sessionData);

  } catch (error) {
    console.error('Error with Hugging Face API:', error);
    return generateFallbackInsights(sessionData);
  }
}

function generateFallbackInsights(sessionData: SessionData): SessionInsights {
  // ... (same fallback logic as before)
  const duration = sessionData.duration;
  const domain = sessionData.domain?.toLowerCase() || '';
  const title = sessionData.title;
  
  let activityType = 'OTHER';
  if (domain.includes('github') || domain.includes('gitlab')) activityType = 'CODING';
  else if (domain.includes('docs.google') || domain.includes('notion')) activityType = 'WRITING';
  else if (domain.includes('youtube') || domain.includes('coursera')) activityType = 'LEARNING';
  else if (domain.includes('slack') || domain.includes('teams')) activityType = 'COMMUNICATION';
  else if (domain.includes('figma') || domain.includes('canva')) activityType = 'DESIGN';

  return {
    summary: `Worked on ${title} for ${duration} minutes on ${domain || 'unknown platform'}`,
    nextSteps: [
      'Continue with the current task',
      'Review progress made',
      'Plan next phase of work'
    ],
    tags: [activityType.toLowerCase(), 'productivity', 'focus'],
    activityType
  };
}

export function extractDomainFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
}

export function getFaviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
} 