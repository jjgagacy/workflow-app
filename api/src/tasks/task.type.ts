export interface TaskData {
  // Define the structure of the data that will be sent to the worker
  [key: string]: any;
}

export interface WorkerData<T = unknown> {
  body: T;
}

export interface WorkerResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
