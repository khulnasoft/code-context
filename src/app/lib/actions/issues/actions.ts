'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "../../../api/auth/[...nextauth]/options";
import { trackRun } from '@/app/lib/telemetry';
import { parseGitHubIssueUrl } from "../../utils"; // Adjust utility function for GitHub URL parsing
import { getDiscussionSummary, getIssueSummaries, getIssueUnderstanding, getPullRequestSummaries } from "./analysis";
import { redirect } from 'next/navigation';
import { getIssueSecurityRecommendations } from "./securityAnalysis";
import { breakdownIssue } from "./breakdown";
import { Issue } from "../common/entities/issue";

// Fetch issue from GitHub API using the URL
export async function fetchIssue(url: string): Promise<Issue | null> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return null;
  }

  const { accessToken, user } = session;

  trackRun(user?.name, user?.email, url, 'issue')
    .catch(e => console.error('Could not track run:', e));
  
  const baseURL = 'https://api.github.com';
  const { owner, repo, issueNumber } = parseGitHubIssueUrl(url); // Adjust parsing for GitHub URLs

  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };
  
  try {
    const issueDetailsURL = `${baseURL}/repos/${owner}/${repo}/issues/${issueNumber}`;
    const issueCommentsURL = `${baseURL}/repos/${owner}/${repo}/issues/${issueNumber}/comments`;
    const issueLinkedIssuesURL = `${baseURL}/repos/${owner}/${repo}/issues/${issueNumber}/events`; // Use events for linked issues (if applicable)
    const issuePullRequestsURL = `${baseURL}/repos/${owner}/${repo}/issues/${issueNumber}/pulls`; // For pull requests

    const [
      issueDetailsResponse,
      issueCommentsResponse,
      issueLinkedIssuesResponse,
      issuePullRequestsResponse,
    ] = await Promise.all([
      fetch(issueDetailsURL, { headers }),
      fetch(issueCommentsURL, { headers }),
      fetch(issueLinkedIssuesURL, { headers }), // Modify based on actual GitHub API usage for linked issues
      fetch(issuePullRequestsURL, { headers }),
    ]);

    if (!issueDetailsResponse.ok || !issueCommentsResponse.ok || !issueLinkedIssuesResponse.ok || !issuePullRequestsResponse.ok) {
      throw new Error('GitHub API error in one or more requests');
    }

    const [
      issueDetails,
      issueComments,
      issueLinkedIssues,
      issuePullRequests,
    ] = await Promise.all([
      issueDetailsResponse.json(),
      issueCommentsResponse.json(),
      issueLinkedIssuesResponse.json(),
      issuePullRequestsResponse.json(),
    ]);

    const issue = {
      ...issueDetails, 
      owner,
      repo,
      linkedIssues: issueLinkedIssues,  // Adjust this data structure based on GitHub's API
      comments: issueComments,  // Store comments for later use
      pullRequests: issuePullRequests,
    };

    const [understanding, comments, issueSummaries, prSummaries, securityRecommendations, breakdown]  = await Promise.all([
      getIssueUnderstanding(issue), 
      getDiscussionSummary(issue), 
      getIssueSummaries(issue.linkedIssues, headers),
      getPullRequestSummaries(issue.pullRequests, headers),
      getIssueSecurityRecommendations(issue),
      breakdownIssue(issue.body), // Assuming GitHub issue has a 'body' field for the description
    ]);

    return {
      ...issue,
      analysis: { understanding, comments },
      linkedIssues: issueSummaries,
      pullRequests: prSummaries,
      securityRecommendations: securityRecommendations,
      breakdown: breakdown,
    };
  } catch (error) {
    console.error('Error fetching issue:', error);
    if ((error as Error).message?.includes('GitHub API error')) {
      redirect('/api/auth/signout');
    }
  }

  return null;
}
