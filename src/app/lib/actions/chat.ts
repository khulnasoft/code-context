"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/options";
import { chatAnthropic } from "../anthropic";
import { MRDetails } from "./mr_analysis/actions";
import { Issue } from "./common/entities/issue";
import { Epic } from "./common/entities/epic";
import { trackAction } from "../telemetry";

export interface ChatMessage {
    sender: string,
    content: string,
    timestamp: string,
}

export async function* sendChatMessage(messages: ChatMessage[], mrDetails?: MRDetails | null, issue?: Issue | null, epic?: Epic | null): AsyncGenerator<string, void, unknown> {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error('No session found. Please log in.');
  }

  trackAction(session?.user?.name, "chat_message")
    .catch(e => console.error('Could not track action:', e))

  if (mrDetails) {
    messages = [{
      sender: 'System',
      content: `
        You are a helpful assistant and an expert software engineer
        You are reviewing the merge request ${mrDetails.title}. 
        The description is ${mrDetails.description}. 
        The code changes are ${mrDetails.codeChanges.map(change => change.diff).join('\n')}. 
        The discussions are ${mrDetails.discussions.map(discussion => discussion.message).join('\n')}.

        You have already shown the user the following information

        ----------
        Summary:
        ${mrDetails.summary.summary}

        ----------
        Key Changes:
        ${mrDetails.summary.keyChanges}

        ----------
        Analysis:
        ${mrDetails.analysis?.reviewApproach}
        ${mrDetails.analysis?.breakdown}
        ${mrDetails.analysis?.testingStrategy}
        ${mrDetails.analysis?.suggestedQuestions}
        ${mrDetails.analysis?.architecturalComponents}

        ----------
        Discussion Analysis:
        ${mrDetails.discussionsAnalysis.summary}

        ----------
        Open Actions:
        ${mrDetails.discussionsAnalysis.actions.map(action => `
          Action: ${action.action}
          Owner: ${action.owner}
          URL: ${action.web_url}
        `).join('\n')}

        Security Review:
        ---------------
        ${mrDetails.securityReview}

        You need to respond to the user as if you are a senior software engineer.
        Be as specific as possible, and try to include examples and code snippets where relevant.
        Be as friendly and professional as possible.
        Be as concise as possible.
        If you don't know the answer, just say "I don't know" and don't make up an answer.
      `,
      timestamp: new Date().toISOString(),
    }, ...messages];
  } else if (issue) {
    messages = [{
      sender: 'System',
      content: `
        You are a helpful assistant and an expert software engineer
        You are reviewing the issue ${issue.title}. 
        The description is ${issue.description}. 
        The discussions are ${issue.discussions.map(discussion => discussion.body).join('\n')}.

        ----------
        Understanding:
        ${issue.analysis.understanding.mainProblem}
        ${issue.analysis.understanding.requirements}
        ${issue.analysis.understanding.useCase}
        ${issue.analysis.understanding.unfamiliarTerms}
        ${issue.analysis.understanding.keyTerms}
        ----------
        Discussion Summary:
        ${issue.analysis.comments.insights}
        ${issue.analysis.comments.concerns}

        ----------
        You need to respond to the user as if you are a senior software engineer.
        Be as specific as possible, and try to include examples and code snippets where relevant.
        Be as friendly and professional as possible.
        Be as concise as possible.
        If you don't know the answer, just say "I don't know" and don't make up an answer.
      `,
      timestamp: new Date().toISOString(),
    }, ...messages];
  } else if (epic) {
    messages = [{
      sender: 'System',
      content: `
        You are a helpful assistant and an expert software engineer
        You are helping the user understand the epic ${epic.title}. 
        The description is ${epic.description}. 
        The issues are ${epic.issues.map(issue => issue.title).join('\n')}.
        The child epics are ${epic.childEpics.map(epic => epic.title).join('\n')}. 
        The discussions are ${epic.discussions.map(discussion => discussion.message).join('\n')}.
      `,
      timestamp: new Date().toISOString(),
    }, ...messages];
  } else {
    throw new Error('No MR, issue or epic provided');
  }

  const stream = chatAnthropic(
    'claude-3-5-sonnet-latest',
    messages.map(message => ({
      role: message.sender === 'Human' ? 'user' : 'assistant',
      content: message.content,
    })));

  
  for await (const chunk of stream) {
    yield chunk;
  }
}