import { Note } from "./discussions";

export interface BaseIssue {
  title: string;
  description: string;
}

export interface Issue {
  iid: number;
  id: number;
  title: string;
  description: string;
  epic_id: number;
  labels: string[];
  project_id: string;
  analysis: Analysis;
  linkedIssues: Issue[];
  discussions: Note[];
  mergeRequests: MergeRequest[];
  summary: string;
  securityRecommentations: string;
  breakdown: BaseIssue[];
  state: string;
  milestone?: Milestone;
}

export interface MergeRequest {
  iid: number;
  id: number;
  title: string;
  description: string;
  author: { name: string };
  created_at: string;
  state: string;
  project_id: string;
  pipeline?: { status: string };
  approvalStatus: string;
  web_url: string;
  sha: string;
  analysis?: Analysis;
  summary: string;
}

export interface CreatedIssue {
  id: string;
  title: string;
  web_url: string;
}

export interface Analysis {
  understanding: Understanding
  comments: AnalysisComments
}

export interface Understanding {
  mainProblem: string,
  requirements: string,
  useCase: string,
  unfamiliarTerms: string,
  keyTerms: string
}

export interface AnalysisComments {
  insights: string,
  concerns: string,
}

export interface Milestone {
  id: number;
  iid: number;
  title: string;
  description: string;
  state: string;
  due_date: string;
}