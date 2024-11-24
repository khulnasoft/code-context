'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "../../../api/auth/[...nextauth]/options";
import { AnalysisComments, Issue, MergeRequest, Understanding } from "../common/entities/issue";
import { callAnthropic } from "../../anthropic";
import { Note } from "../common/entities/discussions";

const ISSUE_ANALYSIS_MODEL = "claude-3-5-sonnet-latest";
const ISSUE_ANALYSIS_MAX_TOKENS = 8192;
const DISCUSSIONS_ANALYSIS_MODEL = "claude-3-5-sonnet-latest";
const DISCUSSIONS_ANALYSIS_MAX_TOKENS = 8192;

// Fetch issue from GitHub API using the URL
export async function fetchIssue(url: string): Promise<Issue | null> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return null;
  }

  const { accessToken, user } = session;

  const baseURL = 'https://api.github.com';
  const { repo, issueNumber } = parseGitHubIssueUrl(url);

  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  try {
    const issueDetailsURL = `${baseURL}/repos/${repo}/issues/${issueNumber}`;
    const issueCommentsURL = `${baseURL}/repos/${repo}/issues/${issueNumber}/comments`;
    const issuePRsURL = `${baseURL}/repos/${repo}/issues/${issueNumber}/pulls`;

    const [
      issueDetailsResponse,
      issueCommentsResponse,
      issuePRsResponse,
    ] = await Promise.all([
      fetch(issueDetailsURL, { headers }),
      fetch(issueCommentsURL, { headers }),
      fetch(issuePRsURL, { headers }),
    ]);

    if (!issueDetailsResponse.ok || !issueCommentsResponse.ok || !issuePRsResponse.ok) {
      throw new Error('GitHub API error in one or more requests');
    }

    const [
      issueDetails,
      issueComments,
      issuePRs,
    ] = await Promise.all([
      issueDetailsResponse.json(),
      issueCommentsResponse.json(),
      issuePRsResponse.json(),
    ]);

    const issue = {
      ...issueDetails,
      comments: issueComments,
      pullRequests: issuePRs,
    };

    const [understanding, comments] = await Promise.all([
      getIssueUnderstanding(issue),
      getDiscussionSummary(issue),
    ]);

    return {
      ...issue,
      analysis: { understanding, comments },
    };
  } catch (error) {
    console.error('Error fetching issue:', error);
  }

  return null;
}

// Get understanding of an issue
export async function getIssueUnderstanding(issue: Issue): Promise<Understanding> {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error('No session found. Please log in.');
  }

  const prompt = `
    Analyze the following GitHub issue and provide a comprehensive breakdown:

    Title: ${issue.title}
    Description: ${issue.body}

    Please provide the following analysis:
    - Main problem and desired outcome
    - Key requirements and details
    - Use case analysis (real-world scenario, failure implications, success criteria)
    - Unfamiliar terms or concepts
    - Key terms and concepts

    Respond in the following format:
    <mainProblem>What is the main problem described in the issue, and what outcome is expected?</mainProblem>
    <requirements>Are there any specific requirements or details mentioned in the issue description that I need to consider while working on this?</requirements>
    <useCase>What is a real world use case scenario for this issue? What does failure of this issue look like or imply for the user? What does success imply for the user?</useCase>
    <unfamiliarTerms>Are there any unfamiliar terms or keywords in the issue? What do they mean according to GitHub’s documentation or resources?</unfamiliarTerms>
    <keyTerms>What are the key terms or concepts in this issue that I need to fully understand to work effectively?</keyTerms>
  `;
  
  const response = await callAnthropic(prompt, ISSUE_ANALYSIS_MODEL, ISSUE_ANALYSIS_MAX_TOKENS);

  const mainProblemMatch = response.match(/<mainProblem>([\s\S]*?)<\/mainProblem>/);
  const requirementsMatch = response.match(/<requirements>([\s\S]*?)<\/requirements>/);
  const useCaseMatch = response.match(/<useCase>([\s\S]*?)<\/useCase>/);
  const unfamiliarTermsMatch = response.match(/<unfamiliarTerms>([\s\S]*?)<\/unfamiliarTerms>/);
  const keyTermsMatch = response.match(/<keyTerms>([\s\S]*?)<\/keyTerms>/);

  return {
    mainProblem: mainProblemMatch ? mainProblemMatch[1].trim() : "Not found.",
    requirements: requirementsMatch ? requirementsMatch[1].trim() : "Not found.",
    useCase: useCaseMatch ? useCaseMatch[1].trim() : "Not found.",
    unfamiliarTerms: unfamiliarTermsMatch ? unfamiliarTermsMatch[1].trim() : "Not found.",
    keyTerms: keyTermsMatch ? keyTermsMatch[1].trim() : "Not found.",
  };
}

// Summarize the issue's comments
export async function getDiscussionSummary(issue: Issue): Promise<AnalysisComments> {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error('No session found. Please log in.');
  }

  const prompt = `
    Analyze the discussions on the following GitHub issue and provide a detailed summary of the discussions.

    Issue Details:
    Title: ${issue.title}
    Description: ${issue.body}

    Discussions:
    ----------------
    ${issue.comments.map(d => `
      Author: ${d.user.login}
      Body: ${d.body}
    `).join("\n\n")}
    ----------------

    Respond in the following format:
    <insights>Are there any comments from team members or stakeholders that provide useful insights or clarify expectations for this issue?</insights>
    <concerns>Have there been any suggestions or concerns raised in the comments that I need to address or keep in mind?</concerns>
  `;
  
  const response = await callAnthropic(prompt, DISCUSSIONS_ANALYSIS_MODEL, DISCUSSIONS_ANALYSIS_MAX_TOKENS);

  const insightsMatch = response.match(/<insights>([\s\S]*?)<\/insights>/);
  const concernsMatch = response.match(/<concerns>([\s\S]*?)<\/concerns>/);

  return {
    insights: insightsMatch ? insightsMatch[1].trim() : "Not found.",
    concerns: concernsMatch ? concernsMatch[1].trim() : "Not found.",
  };
}
