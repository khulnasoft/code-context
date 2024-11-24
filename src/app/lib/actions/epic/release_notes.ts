'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "../../../api/auth/[...nextauth]/options";
import { callAnthropic } from "../../anthropic";
import { Epic, EpicReleaseNotes } from "../common/entities/epic";

const RELEASE_NOTES_SUMMARY_MODEL = "claude-3-5-sonnet-latest"
const RELEASE_NOTES_SUMMARY_MAX_TOKENS = 8192

export async function getReleaseNotes(epic: Epic): Promise<EpicReleaseNotes[]> {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw('No session found. Please log in.')
  }

  const prompt = `
    Analyse the issues in the following epic and provide a release summary of what has been or will be delivered in each relese.

    Title: ${epic.title}
    Description: ${epic.description}

    Child Issues:
    ${epic.issues.map(issue => `
      Title: ${issue.title}
      Description: ${issue.description}
      Status: ${issue.state}
      Milestone: ${issue.milestone?.title}
    `).join("\n\n")}
    
    Respond in the following format:
    
    <releases>
    <release>
        <milestone>Milestone number such as 15.2</milestone>
        <summary>Description of what has been or is being delivered</summary>
    </release>
    <release>
        <milestone>15.3</milestone>
        <summary>Description of what has been or is being delivered</summary>
    </release>
    </releases>
    `;
  
  const response = await callAnthropic(prompt, RELEASE_NOTES_SUMMARY_MODEL, RELEASE_NOTES_SUMMARY_MAX_TOKENS);

  console.log('issue summary response', response);
  const releaseNotes = response.match(/<release>[\s\S]*?<\/release>/g) || [];

  const formattedReleaseNotes = releaseNotes.map(releaseNote => {
    const milestoneMatch = releaseNote.match(/<milestone>(.*?)<\/milestone>/);
    const summaryMatch = releaseNote.match(/<summary>([\s\S]*?)<\/summary>/);

    return {
      milestone: milestoneMatch ? milestoneMatch[1].trim() : '',
      summary: summaryMatch ? summaryMatch[1].trim() : ''
    };
  });

  return formattedReleaseNotes;
}