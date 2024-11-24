import { User } from "next-auth";
import clientPromise from "./mongodb";

const app = 'code-context';

export async function trackLogin(user: User) {
  const client = await clientPromise;
  const db = client.db();
  
  const loginCollection = db.collection('analytics_logins');
  await loginCollection.insertOne({
    ...user,
    app,
    timestamp: new Date()
  });
}

export async function trackRun(name: string | null | undefined, email: string | null | undefined, url: string, type: string) {
  if (!email) {
    return;
  }
  const client = await clientPromise;
  const db = client.db();
  
  const loginCollection = db.collection('analytics_runs');
  await loginCollection.insertOne({
    email,
    app,
    timestamp: new Date(),
    url,
    type,
  });
}

export async function trackAction(name: string | null | undefined, action: string) {
  const client = await clientPromise;
  const db = client.db();
  
  const loginCollection = db.collection('analytics_actions');
  await loginCollection.insertOne({
    name,
    action,
    app,
    timestamp: new Date(),
  });
}