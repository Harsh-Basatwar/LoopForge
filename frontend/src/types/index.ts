export interface Project {
  id: string;
  name: string;
  path: string;
  language: string;
  framework: string;
  created_at: string;
  file_count: number;
}

export interface FileNode {
  name: string;
  path: string;
  is_dir: boolean;
  size?: number;
  children?: FileNode[];
}

export interface FileChange {
  path: string;
  change_type: "create" | "modify" | "delete";
  content: string;
  diff: string;
  description?: string;
}

export interface TestResult {
  command: string;
  exit_code: number;
  status: "passed" | "failed" | "error";
  passed: number;
  failed: number;
  total: number;
  output: string;
  duration_ms: number;
}

export interface AgentEvent {
  id: string;
  task_id: string;
  node: "planner" | "analyzer" | "coder" | "tester" | "reflector" | "workflow";
  status: "pending" | "running" | "completed" | "failed";
  message: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status:
    | "planning"
    | "analyzing"
    | "coding"
    | "testing"
    | "debugging"
    | "awaiting_plan_approval"
    | "awaiting_approval"
    | "completed"
    | "failed"
    | "cancelled";
  iteration: number;
  max_iterations: number;
  plan: string[];
  generated_changes: FileChange[];
  test_results?: TestResult;
  errors: string[];
  created_at: string;
  completed_at?: string;
}
