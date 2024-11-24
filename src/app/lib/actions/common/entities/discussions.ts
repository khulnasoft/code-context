export interface Discussion {
  id: number;
  author: string;
  message: string;
  sentiment: string;
  notes?: Note[];
  web_url: string;
  resolved?: boolean;
}

export interface Note {
  id: number;
  body: string;
  web_url: string;
  system: boolean;
  author: {
    name: string;
    username: string;
  }
}