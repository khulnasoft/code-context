import { getReviewerPrompt, ReviewType } from "@/components/reviewer_prompts";
import { MRDetails, MRSummary } from "./actions";
import { callAnthropic } from "../../anthropic";

export async function generateMRSummary(mrDetails: MRDetails, reviewType: ReviewType): Promise<MRSummary> {
  const prompt = `${getReviewerPrompt(reviewType)}

    Provide a summary of this merge request with the following details:- 
    
    Title: ${mrDetails.title}- 
    Description: ${mrDetails.description}

    Discussions:
    ${mrDetails.discussions.map(discussion => `
      Author: ${discussion.author}
      Message: ${discussion.message}
    `).join('\n')}

    Code Changes
    ------------
    ${mrDetails.codeChanges.map(change => `
      Diff: ${change.diff}
    `).join('\n')}
    
    Analyze the code and response in the following format:

    <summary>Summary of the description of the MR</summary>
    <key-changes>A summary of the code changes and overall impact to the codebase. Also comment on test coverage.</key-changes>`;
  try {
    const response = await callAnthropic(prompt, 'claude-3-5-sonnet-latest', 8192);
    // Extract the fields from the response
    
    const summaryMatch = response.match(/<summary>([\s\S]*?)<\/summary>/);
    const keyChangesMatch = response.match(/<key-changes>([\s\S]*?)<\/key-changes>/);

    const summary = summaryMatch ? summaryMatch[1].trim() : 'No summary available';
    const keyChanges = keyChangesMatch ? keyChangesMatch[1].trim() : 'No key changes available';

    return { summary, keyChanges };
  } catch (error) {
    console.error('Error generating MR summary:', error);
    return { summary: 'Error generating summary', keyChanges: 'No key changes available' };
  }
}