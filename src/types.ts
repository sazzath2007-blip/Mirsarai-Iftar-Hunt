export interface Task {
  id: number;
  title: string;
  description: string;
  points: number;
}

export interface Upload {
  id: number;
  task_id: number;
  task_title: string;
  user_name: string;
  photo_url: string;
  caption: string;
  votes: number;
  created_at: string;
}
