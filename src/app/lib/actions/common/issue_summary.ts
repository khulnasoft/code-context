import { callAnthropic } from "../../anthropic";
import { Note } from "./entities/discussions";
import { Issue } from "./entities/issue";

export async function getIssueSummaries(
  issues: Issue[],
  githubAuthHeaders: Record<string, string> // This should include the GitHub token for authorization
): Promise<Issue[]> {
  const issueSummaries = await Promise.all(
    issues.map(async (issue) => {
      const { owner, repo } = issue.repository; // Assuming you have `repository` info (owner, repo) in `issue`

      // Fetch the discussions (comments) for the issue
      const discussionResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/issues/${issue.iid}/comments`, {
          headers: githubAuthHeaders,
        }
      );

      const discussions = await discussionResponse.json() as Note[];

      const prompt = `Summarize the following GitHub issue:\n\n
        Title: ${issue.title}
        Description: ${issue.body}

        Discussions:
        ------------
        ${discussions?.map((discussion: Note) => `
          Author: ${discussion.user.login}
          Message: ${discussion.body}
        `).join('\n')}
        -----------
        `;
      
      try {
        const summary = await callAnthropic(prompt, 'claude-3-5-haiku-latest', 8000);
        return { ...issue, summary };
      } catch (error) {
        console.error('Error generating issue summary:', error);
        return { ...issue, summary: 'Error generating summary' };
      }
    })
  );
  return issueSummaries;
}
