'use server';

import { BaseIssue } from '../common/entities/issue';
import { callAnthropic } from "../../anthropic";

const BREAKDOWN_MODEL = "claude-3-5-sonnet-latest"
const BREAKDOWN_MODEL_MAX_TOKENS = 8192

export async function breakdownIssue(issueDescription: string): Promise<BaseIssue[]> {
  const prompt = `
    Analyze the following issue description and provide suggestions for breaking it down into smaller, more manageable iterations. 
    Focus on creating tasks that deliver incremental value. Present the breakdown as a list of concise, actionable items.

    Please make the description as detailed as possible and include all the necessary information. Include information about
    acceptance criteria and any dependencies. The description should be in markdown format. Also add infomartion about how to
    test the feature.

    Please don't create more than 3 issues. If the issue is small enough then do not suggest anything.

    Issue Description:
    ${issueDescription}

    Respond in the following format:

    <issue>
      <title>Suggestion 1</title>
      <description>Detailed description in markdown format</description>
    </issue>
    <issue>
      <title>Suggestion 2</title>
      <description>Detailed description in markdown format</description>
    </issue>

    Breakdown Suggestions:
  `;

  try {
    const content = await callAnthropic(prompt, BREAKDOWN_MODEL, BREAKDOWN_MODEL_MAX_TOKENS)
    
    // Parse response
    const issueRegex = /<issue>\s*<title>([\s\S]*?)<\/title>\s*<description>([\s\S]*?)<\/description>\s*<\/issue>/g;
    const matches = content.matchAll(issueRegex);

    const suggestions: BaseIssue[] = [];
    for (const match of matches) {
      suggestions.push({
        title: match[1].trim(),
        description: match[2].trim()
      });
    }

    return suggestions;
  } catch (error) {
    console.error('Error calling LLM:', error);
    throw new Error('Failed to analyze issue');
  }
}