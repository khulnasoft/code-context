"use server";

import { getServerSession } from "next-auth";
import { GITHUB_BASE_URL } from "../common/constants";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getCurrentUser } from "../common/fetch_user";
import { MRDetails } from "./actions";

export async function getUserMRs(count: number = 3): Promise<MRDetails[]> {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error('Invalid session');
  }

  const { accessToken } = session;

  const currentUser = await getCurrentUser();

  const mrResponse = await fetch(`${GITHUB_BASE_URL}/merge_requests?reviewer_username=${currentUser.username}&scope=all&state=opened&order_by=updated_at&per_page=${count}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!mrResponse.ok) {
    throw new Error('Failed to fetch current user');
  }

  const mrs: MRDetails[] = await mrResponse.json()
  return mrs
}