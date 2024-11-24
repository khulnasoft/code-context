import { callAnthropic } from "../../anthropic";
import { Discussion } from "../common/entities/discussions";
import { MRDetails } from "./actions";

export interface DiscussionAnalysis {
    totalDiscussions: number;
    summary: string;
    actions: Action[];
}

export interface Action {
    owner: string;
    action: string;
    web_url: string;
}

export async function analyseDiscussions(discussions: Discussion[], mr: MRDetails, userName: string): Promise<DiscussionAnalysis> {
  const prompt = `
    Analyze the following discussions from a merge request and provide a list of actions that could be taken based on them.

    Merge Request Title: ${mr.title}
    Merge Request Description: ${mr.description}
    Merge Request Author: ${mr.author.name}
    Merge Request URL: ${mr.web_url}

    ---------
    ${discussions.map(discussion => `
        Author: ${discussion.author}
        Message: ${discussion.message}
        Resolved: ${discussion.resolved}
        Threads: ${discussion.notes?.map(note => `
            Author: ${note.author.name}
            Message: ${note.body}
        `).join("\n")}
    ----------`).join("\n")}

    Respond in the following format:
    
    <summary>A detailed summary of all the discussions</summary>
    <open_action>
      <action>A brief description of the action</action>
      <owner>The person who should take the action</owner>
      <web_url>The URL where the action can be taken</web_url>
    </open_action>
  `

  const response = await callAnthropic(prompt, 'claude-3-5-sonnet-latest', 8192);

  const summaryMatch = response.match(/<summary>([\s\S]*?)<\/summary>/);
  const summary = summaryMatch ? summaryMatch[1].trim() : 'No summary provided';

  const actionsMatches = response.matchAll(/<open_action>([\s\S]*?)<\/open_action>/g);
  const actions: Action[] = [];
  for (const match of actionsMatches) {
    const actionMatch = match[1].match(/<action>([\s\S]*?)<\/action>/);
    const ownerMatch = match[1].match(/<owner>([\s\S]*?)<\/owner>/);
    const urlMatch = match[1].match(/<web_url>([\s\S]*?)<\/web_url>/);
  
    if (actionMatch && ownerMatch && urlMatch) {
      const owner = ownerMatch[1].trim()
      actions.push({
        action: actionMatch[1].trim(),
        owner: owner === userName ? 'You' : owner,
        web_url: urlMatch[1].trim(),
      });
    }
  }

  return {
    totalDiscussions: discussions.length,
    summary,
    actions,
  }
}
