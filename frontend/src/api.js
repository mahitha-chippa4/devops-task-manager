const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export async function fetchTasks({ status = '', priority = '', search = '' } = {}) {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (priority) params.append('priority', priority);
  if (search) params.append('search', search);

  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE}/tasks${query}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to fetch tasks (HTTP ${res.status})`);
  }
  return res.json();
}

export async function fetchTaskStats() {
  const res = await fetch(`${API_BASE}/tasks/stats`);
  if (!res.ok) {
    throw new Error(`Failed to fetch stats (HTTP ${res.status})`);
  }
  return res.json();
}

export async function createTask(taskData) {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    let msg = errorData.detail || `Failed to create task (HTTP ${res.status})`;
    if (Array.isArray(errorData.detail)) {
      msg = errorData.detail.map(d => `${d.loc.join('.')}: ${d.msg}`).join(', ');
    }
    throw new Error(msg);
  }
  return res.json();
}

export async function updateTask(taskId, taskData) {
  const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    let msg = errorData.detail || `Failed to update task (HTTP ${res.status})`;
    if (Array.isArray(errorData.detail)) {
      msg = errorData.detail.map(d => `${d.loc.join('.')}: ${d.msg}`).join(', ');
    }
    throw new Error(msg);
  }
  return res.json();
}

export async function deleteTask(taskId) {
  const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to delete task (HTTP ${res.status})`);
  }
  return true;
}

export async function checkBackendHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) {
    throw new Error(`Backend unhealthy (HTTP ${res.status})`);
  }
  return res.json();
}

export async function fetchPipelineStatus() {
  const res = await fetch(`${API_BASE}/api/pipeline/status`);
  if (!res.ok) {
    throw new Error(`Failed to fetch pipeline status (HTTP ${res.status})`);
  }
  return res.json();
}
