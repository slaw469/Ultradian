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
  console.log('Generating insights for session:', sessionData.title);
  
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  
  if (!apiKey) {
    console.log('No Hugging Face API key found, using fallback insights');
    return generateFallbackInsights(sessionData);
  }

  try {
    const prompt = `Generate insights for this work session in JSON format:

Title: ${sessionData.title}
Website: ${sessionData.websiteUrl || 'Unknown'}
Duration: ${sessionData.duration} minutes
Domain: ${sessionData.domain || 'Unknown'}

Respond with valid JSON:
{
  "summary": "Brief description of what the user was doing",
  "nextSteps": ["actionable step 1", "actionable step 2", "actionable step 3"],
  "tags": ["relevant", "tags", "here"],
  "activityType": "CODING|WRITING|RESEARCH|COMMUNICATION|DESIGN|LEARNING|PLANNING|OTHER"
}`;

    // Use a more reliable text generation model
    const response = await fetch(
      "https://api-inference.huggingface.co/models/microsoft/DialoGPT-small",
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: 150,
            temperature: 0.7,
            do_sample: true,
            top_p: 0.9,
          },
          options: {
            wait_for_model: true,
            use_cache: false
          }
        }),
      }
    );

    console.log('Hugging Face API response status:', response.status);

    if (!response.ok) {
      console.error(`Hugging Face API error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('Hugging Face API result:', result);
    
    // Handle different response formats
    let aiText = '';
    if (Array.isArray(result) && result[0]?.generated_text) {
      aiText = result[0].generated_text;
    } else if (result.generated_text) {
      aiText = result.generated_text;
    } else {
      console.log('Unexpected response format, using fallback');
      return generateFallbackInsights(sessionData);
    }

    // Try to extract JSON from the response
    try {
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const insights = JSON.parse(jsonMatch[0]) as SessionInsights;
        if (insights.summary && insights.nextSteps && insights.tags && insights.activityType) {
          console.log('Successfully parsed AI insights');
          return insights;
        }
      }
    } catch (parseError) {
      console.error('Failed to parse Hugging Face response as JSON:', parseError);
    }

    // If parsing fails, use fallback
    console.log('AI response parsing failed, using fallback insights');
    return generateFallbackInsights(sessionData);

  } catch (error) {
    console.error('Error with Hugging Face API:', error);
    return generateFallbackInsights(sessionData);
  }
}

function generateFallbackInsights(sessionData: SessionData): SessionInsights {
  const duration = sessionData.duration;
  const domain = sessionData.domain?.toLowerCase() || '';
  const title = sessionData.title;
  const url = sessionData.websiteUrl?.toLowerCase() || '';
  
  let activityType = 'OTHER';
  let summary = '';
  let nextSteps: string[] = [];
  let tags: string[] = [];

  // Determine activity type and generate relevant insights
  if (domain.includes('github') || domain.includes('gitlab') || domain.includes('stackoverflow') || url.includes('code')) {
    activityType = 'CODING';
    summary = `Coding session: ${title}. Spent ${duration} minutes working on development tasks on ${domain}`;
    nextSteps = [
      'Review and test the code changes',
      'Commit and push changes to repository',
      'Document any new features or fixes'
    ];
    tags = ['coding', 'development', 'programming'];
  } else if (domain.includes('docs.google') || domain.includes('notion') || domain.includes('medium') || url.includes('write')) {
    activityType = 'WRITING';
    summary = `Writing session: ${title}. Spent ${duration} minutes creating or editing content on ${domain}`;
    nextSteps = [
      'Review and proofread the content',
      'Share with team or publish',
      'Plan follow-up content or improvements'
    ];
    tags = ['writing', 'content', 'documentation'];
  } else if (domain.includes('youtube') || domain.includes('coursera') || domain.includes('udemy') || domain.includes('khan')) {
    activityType = 'LEARNING';
    summary = `Learning session: ${title}. Spent ${duration} minutes studying or watching educational content on ${domain}`;
    nextSteps = [
      'Practice what was learned',
      'Take notes on key concepts',
      'Apply knowledge to current projects'
    ];
    tags = ['learning', 'education', 'skill-development'];
  } else if (domain.includes('slack') || domain.includes('teams') || domain.includes('zoom') || domain.includes('meet')) {
    activityType = 'COMMUNICATION';
    summary = `Communication session: ${title}. Spent ${duration} minutes in meetings or messaging on ${domain}`;
    nextSteps = [
      'Follow up on action items',
      'Share meeting notes with team',
      'Schedule any necessary follow-up meetings'
    ];
    tags = ['communication', 'collaboration', 'teamwork'];
  } else if (domain.includes('figma') || domain.includes('canva') || domain.includes('sketch') || domain.includes('design')) {
    activityType = 'DESIGN';
    summary = `Design session: ${title}. Spent ${duration} minutes working on design tasks using ${domain}`;
    nextSteps = [
      'Get feedback on design concepts',
      'Iterate based on user feedback',
      'Prepare design assets for development'
    ];
    tags = ['design', 'creative', 'visual'];
  } else if (domain.includes('research') || domain.includes('scholar') || domain.includes('wikipedia') || url.includes('search')) {
    activityType = 'RESEARCH';
    summary = `Research session: ${title}. Spent ${duration} minutes gathering information and researching on ${domain}`;
    nextSteps = [
      'Organize research findings',
      'Identify gaps in knowledge',
      'Plan next research steps'
    ];
    tags = ['research', 'analysis', 'information'];
  } else if (domain.includes('calendar') || domain.includes('plan') || domain.includes('trello') || domain.includes('asana')) {
    activityType = 'PLANNING';
    summary = `Planning session: ${title}. Spent ${duration} minutes organizing and planning tasks on ${domain}`;
    nextSteps = [
      'Review and prioritize planned tasks',
      'Set deadlines and milestones',
      'Share plans with relevant stakeholders'
    ];
    tags = ['planning', 'organization', 'productivity'];
  } else {
    summary = `Work session: ${title}. Spent ${duration} minutes focused on tasks using ${domain || 'various tools'}`;
    nextSteps = [
      'Review progress made in this session',
      'Plan next steps for continuation',
      'Document any insights or learnings'
    ];
    tags = ['productivity', 'focus', 'work'];
  }

  // Add duration-based insights
  if (duration > 60) {
    tags.push('deep-work');
  } else if (duration < 15) {
    tags.push('quick-task');
  }

  // Add domain to tags if it's meaningful
  const domainTag = domain.replace('.com', '').replace('.org', '').replace('www.', '');
  if (domainTag && domainTag.length > 2) {
    tags.push(domainTag);
  }

  return {
    summary,
    nextSteps,
    tags: tags.slice(0, 4), // Limit to 4 tags
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