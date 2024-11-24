import { callAnthropic } from "../../anthropic";
import { Discussion } from "./entities/discussions";

export async function formatDiscussions(discussions: Discussion[], baseURL: string): Promise<Discussion[]> {
  const filteredNotes = discussions.flatMap(discussion =>
    discussion.notes?.filter(note => !note.system && !note.author.username.includes('bot'))
  );

  const formattedDiscussionsPromises = filteredNotes.map(async (note) => {
    const prompt = `
    What is the sentiment of the following text? "${note?.body}"\n\n
    
    Respond with one of the following: Constructive, Encouraging, Candid, Diplomatic, Assertive, Appreciative, Cautionary, Insightful, Inquisitive, Objective.
    
    Please respond with the one word only.
    `;
    const sentiment = await callAnthropic(prompt, 'claude-3-5-haiku-latest', 50);
    return {
      ...note,
      id: note?.id || -1,
      author: note?.author.name || 'unknown',
      message: note?.body || 'unknown',
      sentiment,
      web_url: `${baseURL}#note_${note?.id}`,
    };
  });

  const formattedDiscussions = await Promise.all(formattedDiscussionsPromises);
  return formattedDiscussions;
}