import { GITHUB_BASE_URL } from "../common/constants";
import { Job, Pipeline } from "../common/entities/pipelines";
import { Change, MRDetails } from "./actions";
import { callAnthropic } from "../../anthropic";

async function getLatestPipelineForMR(projectId: string, mrIid: string, headers: Record<string, string>): Promise<Pipeline> {
  const url = `${GITHUB_BASE_URL}/projects/${encodeURIComponent(projectId)}/merge_requests/${mrIid}/pipelines`;

  const response = await fetch(url, {
    headers
  });

  if (!response.ok) {
    throw new Error(`Error fetching pipelines: ${response.statusText}`);
  }

  const pipelines = await response.json();

  if (pipelines.length === 0) {
    throw new Error('No pipelines found for the merge request');
  }

  pipelines.sort((a: Pipeline, b: Pipeline) => b.id - a.id);

  const latestPipeline = pipelines[0];

  return latestPipeline;
}

async function getJobsForPipeline(projectId: string, pipelineId: number, headers: Record<string, string>): Promise<Job[]> {
  const url = `${GITHUB_BASE_URL}/projects/${encodeURIComponent(projectId)}/pipelines/${pipelineId}/jobs`;

  const response = await fetch(url, {
    headers,
  });

  if (!response.ok) {
    throw new Error(`Error fetching jobs: ${response.statusText}`);
  }

  const jobs = await response.json();
  return jobs;
}

function filterFailedJobs(jobs: Job[]): Job[] {
  return jobs.filter((job) => job.status === 'failed');
}

async function getJobLog(projectId: string, jobId: number, headers: Record<string, string>): Promise<string> {
  const url = `${GITHUB_BASE_URL}/projects/${encodeURIComponent(projectId)}/jobs/${jobId}/trace`;

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`Error fetching job log: ${response.statusText}`);
  }

  const log = await response.text();
  return log;
}

export async function getFailingJobsForMR(projectId: string, mrIid: string, headers: Record<string, string>): Promise<Job[]> {
  try {
    const latestPipeline = await getLatestPipelineForMR(projectId, mrIid, headers);

    const jobs = await getJobsForPipeline(projectId, latestPipeline.id, headers);

    const failedJobs = filterFailedJobs(jobs);

    const jobsWithLogs = await Promise.all(failedJobs.map(async (job) => {
      try {
        const log = await getJobLog(projectId, job.id, headers);
        return { ...job, log };
      } catch (error) {
        console.error(`Failed to fetch job log for job ${job.id}:`, error);
        return { ...job, log: 'Failed to fetch job log' };
      }
    }));

    return jobsWithLogs;
  } catch (error) {
    console.error('An error occurred fetching job:', error);
  }

  return [];
}

export async function findReasonsForFailure(failedJobs: Job[], mr: MRDetails, changes: Change[]): Promise<Job[]> {
    return Promise.all(failedJobs.map(async (job) => {
      const prompt = `
          Can you analyse the reasons for failure of the following job and suggest a course of action to fix this error:
          
          Merge Request Title: ${mr.title}
          Merge Request Description: ${mr.description}

          Diff:
          ${changes.map(change => change.diff).join('\n')}
      
          Code Changes: ${changes.map(change => `
          Name: ${change.new_path || change.old_path}
          Summary: ${change.summary}
          `).join('\n')}

          Job Log:
          ${job.log}
          
          You should respond with the reason for failure and a description of how to fix the error. If the error is not clear then respond with "Error unclear"
        `
    
      const response = await callAnthropic(prompt, 'claude-3-5-sonnet-latest', 8192); 
    
      return {
        ...job,
        reason: response.trim()
      };
    }));
}