'use server';

import { BaseIssue, CreatedIssue, Issue } from "../common/entities/issue";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../api/auth/[...nextauth]/options";
import { trackAction } from "../../telemetry";

export async function createIssues(issues: BaseIssue[], originalIssue: Issue, convertToEpic: boolean): Promise<CreatedIssue[]> {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw('No session found. Please log in.')
  }

  trackAction(session?.user?.name, "create_issue")
    .catch(e => console.error('Could not track action:', e))

  const { accessToken } = session;

  if (!accessToken) {
    throw('No access token found. Please log in.')
  }

  // In GitHub, we use a milestone for epics, if you want to convert to an epic, you can create a milestone.
  let milestoneId = originalIssue.milestone_id;

  if (convertToEpic) {
    // Optionally, you could create a milestone for the epic.
    const createdMilestone = await createMilestone(originalIssue, accessToken);
    milestoneId = createdMilestone.id;
  }

  return Promise.all(issues.map(issue => createIssue(issue, originalIssue, milestoneId, accessToken)))
}

async function createMilestone(originalIssue: Issue, accessToken: string): Promise<{ id: number, html_url: string }> {
  const githubApiUrl = `https://api.github.com/repos/${originalIssue.repo_owner}/${originalIssue.repo_name}/milestones`;

  try {
    const response = await fetch(githubApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: `Epic: ${originalIssue.title}`,
        description: originalIssue.description,
        due_on: originalIssue.due_date, // Optional due date
      })
    });

    if (!response.ok) {
      throw new Error(`Error creating milestone: ${response.statusText}`);
    }

    const createdMilestone = await response.json();

    return {
      id: createdMilestone.id,
      html_url: createdMilestone.html_url
    };
  } catch (error) {
    console.error('Error creating GitHub milestone:', error);
    throw new Error('Failed to create GitHub milestone');
  }
}

async function createIssue(issue: BaseIssue, originalIssue: Issue, milestoneId: number, accessToken: string): Promise<CreatedIssue> {
  const githubApiUrl = `https://api.github.com/repos/${originalIssue.repo_owner}/${originalIssue.repo_name}/issues`;

  try {
    const response = await fetch(githubApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: issue.title,
        body: issue.description,
        labels: originalIssue.labels,
        milestone: milestoneId,
      })
    });

    if (!response.ok) {
      throw new Error(`Error creating issue: ${response.statusText}`);
    }

    const createdIssue = await response.json();

    return {
      id: createdIssue.id,
      title: createdIssue.title,
      html_url: createdIssue.html_url
    };
  } catch (error) {
    console.error('Error creating GitHub issue:', error);
    throw new Error('Failed to create GitHub issue');
  }
}

async function fetchRepoInfo(owner: string, repo: string, accessToken: string): Promise<{ id: number, html_url: string }> {
  const githubApiUrl = `https://api.github.com/repos/${owner}/${repo}`;

  try {
    const response = await fetch(githubApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Error fetching repo info: ${response.statusText}`);
    }

    const repoInfo = await response.json();
    return {
      id: repoInfo.id,
      html_url: repoInfo.html_url
    };
  } catch (error) {
    console.error('Error fetching GitHub repo info:', error);
    throw new Error('Failed to fetch GitHub repo info');
  }
}
