import { Project, Task, FileNode, AgentEvent } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch(`${API_BASE}/projects`);
  if (!res.ok) throw new Error("Failed to load projects");
  return res.json();
}

export async function fetchProject(id: string): Promise<Project> {
  const res = await fetch(`${API_BASE}/projects/${id}`);
  if (!res.ok) throw new Error("Failed to load project");
  return res.json();
}

export async function fetchFileTree(projectId: string): Promise<FileNode[]> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/files`);
  if (!res.ok) throw new Error("Failed to load file tree");
  const data = await res.json();
  return data.files || [];
}

export async function fetchFileContent(projectId: string, path: string): Promise<string> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/files/${encodeURIComponent(path)}`);
  if (!res.ok) throw new Error("Failed to load file content");
  const data = await res.json();
  return data.content || "";
}

export async function createTask(params: {
  project_id: string;
  title: string;
  description: string;
  auto_approve_plan?: boolean;
  max_iterations?: number;
}): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error("Failed to create task");
  return res.json();
}

export async function fetchTasks(projectId?: string): Promise<Task[]> {
  const url = projectId ? `${API_BASE}/tasks?project_id=${projectId}` : `${API_BASE}/tasks`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load tasks");
  return res.json();
}

export async function fetchTask(taskId: string): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks/${taskId}`);
  if (!res.ok) throw new Error("Failed to load task details");
  return res.json();
}

export async function approvePlan(taskId: string): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks/${taskId}/approve-plan`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to approve plan");
  return res.json();
}

export async function approveChanges(taskId: string): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks/${taskId}/approve-changes`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to approve changes");
  return res.json();
}

export async function rejectChanges(taskId: string): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks/${taskId}/reject-changes`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to reject changes");
  return res.json();
}

export async function cancelTask(taskId: string): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks/${taskId}/cancel`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to cancel task");
  return res.json();
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

export function subscribeToEvents(
  taskId: string,
  onEvent: (event: AgentEvent) => void,
  onError?: (error: any) => void
): () => void {
  const eventSource = new EventSource(`${API_BASE}/tasks/${taskId}/events`);

  eventSource.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);
      onEvent(data);
    } catch (err) {
      console.error("Failed to parse SSE event", err);
    }
  };

  eventSource.onerror = (err) => {
    if (onError) onError(err);
  };

  return () => {
    eventSource.close();
  };
}
