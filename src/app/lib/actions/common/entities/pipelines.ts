export interface Pipeline {
  id: number;
  status: string;
  ref: string;
  sha: string;
  web_url: string;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: number;
  status: string;
  stage: string;
  name: string;
  ref: string;
  web_url: string;
  created_at: string;
  started_at: string;
  finished_at: string;
  duration: number;
  artifacts_file: {
    filename: string;
    size: number;
  };
  log: string;
  reason: string;
}