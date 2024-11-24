"use server";

import { getServerSession } from "next-auth/next";
import { parseGithubEpicUrl } from "../../utils";
import { GITHUB_GRAPHQL_URL } from "../common/constants";
import { Epic, GraphQLEpicResponse, mapGraphQLResponseToEpic } from "../common/entities/epic";
import { EPIC_QUERY } from "./epic_query";
import { trackRun } from "../../telemetry";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getEpicSummary } from "./summary";
import { getIssueSummaries } from "../common/issue_summary";
import { getReleaseNotes } from "./release_notes";

export async function fetchEpic(url: string): Promise<Epic | null> {
  const {groupId, epicIid} = parseGithubEpicUrl(url)

  const session = await getServerSession(authOptions);
  if (!session) {
    return null
  }

  const { accessToken, user } = session;

  trackRun(user?.name, user?.email, url, 'epic')
    .catch(e => console.error('Could not track run:', e))

  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: EPIC_QUERY,
      variables: {
        "groupFullPath": groupId,
        "workItemIID": epicIid
      }
    })
  })

  const graphqlEpic: GraphQLEpicResponse = await response.json();
  const epic = mapGraphQLResponseToEpic(graphqlEpic);

  [epic.summary, epic.issues, epic.releaseNotes] = await Promise.all([
    getEpicSummary(epic),
    getIssueSummaries(epic.issues, headers),
    getReleaseNotes(epic)
  ]);

  return epic;
} 
