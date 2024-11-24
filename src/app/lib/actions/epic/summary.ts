'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "../../../api/auth/[...nextauth]/options";
import { callAnthropic } from "../../anthropic";
import { Epic, EpicSummary } from "../common/entities/epic";

const EPIC_SUMMARY_MODEL = "claude-3-5-sonnet-latest"
const EPIC_SUMMARY_MAX_TOKENS = 8192

export async function getEpicSummary(epic: Epic): Promise<EpicSummary> {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw('No session found. Please log in.')
  }

  const prompt = `
    Analyze the following epic data and provide a comprehensive breakdown:

    Title: ${epic.title}
    Description: ${epic.description}

    Child Issues:
    ${epic.issues.map(issue => `
    Title: ${issue.title}
    Description: ${issue.description}
    Status: ${issue.state}
    `).join("\n\n")}
    
    Child Epics:
    ${epic.childEpics.map(childEpic => `
    Title: ${childEpic.title}
    Description: ${childEpic.description}
    `).join("\n\n")}

    Discussions:
    ${epic.discussions.map(discussion => `
    Author: ${discussion.author}
    Message: ${discussion.message}
    `).join("\n\n")}
    
    Respond in the following format:

    <summary>Summarize the goal and context of this epic, highlighting its importance and the benefits it provides.</summary>
    <keyPoints>Identify the key features or functionality that the epic aims to introduce. Discuss the expected impact on users or customers.</keyPoints>
    <discussionSummary>A summary of the discussions / notes</discussionSummary>
    <closedIssues>Provide a detailed summary of the issues that are closed and what has been delivered</closedIssues>
    <pendingIssues>Summarize the open issues and what is pending in the epic</pendingIssues>
    `;
  
  const response = await callAnthropic(prompt, EPIC_SUMMARY_MODEL, EPIC_SUMMARY_MAX_TOKENS);

  const summaryMatch = response.match(/<summary>([\s\S]*?)<\/summary>/);
  const keyPointsMatch = response.match(/<keyPoints>([\s\S]*?)<\/keyPoints>/);
  const discussionSummaryMatch = response.match(/<discussionSummary>([\s\S]*?)<\/discussionSummary>/);
  const closedIssuesMatch = response.match(/<closedIssues>([\s\S]*?)<\/closedIssues>/);
  const pendingIssuesMatch = response.match(/<pendingIssues>([\s\S]*?)<\/pendingIssues>/);

  return {
    summary: summaryMatch ? summaryMatch[1].trim() : "Not found.",
    keyPoints: keyPointsMatch ? keyPointsMatch[1].trim() : "Not found.",
    discussionSummary: discussionSummaryMatch ? discussionSummaryMatch[1].trim() : "Not found.",
    closedIssues: closedIssuesMatch ? closedIssuesMatch[1].trim() : "Not found.",
    pendingIssues: pendingIssuesMatch ? pendingIssuesMatch[1].trim() : "Not found.",
  };
}