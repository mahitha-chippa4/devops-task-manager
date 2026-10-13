from fastapi import status

# HTTP 422 Unprocessable Content
HTTP_422 = getattr(status, "HTTP_422_UNPROCESSABLE_CONTENT", 422)


def test_root_endpoint(client):
    """Test API root welcome endpoint."""
    response = client.get("/")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "version" in data
    assert "docs_url" in data


def test_health_check_endpoint(client):
    """Test health check endpoint returns 200 and healthy status."""
    response = client.get("/health")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "healthy"
    assert "app" in data
    assert "version" in data


def test_pipeline_status_endpoint_unconfigured(client):
    """Test CircleCI pipeline status proxy reports unconfigured gracefully without crash."""
    response = client.get("/api/pipeline/status")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "configured" in data
    assert "message" in data


def test_create_task_success(client, sample_task_payload):
    """Test creating a valid task returns 201 Created and full task details."""
    response = client.post("/tasks", json=sample_task_payload)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["id"] is not None
    assert data["title"] == sample_task_payload["title"]
    assert data["description"] == sample_task_payload["description"]
    assert data["status"] == sample_task_payload["status"]
    assert data["priority"] == sample_task_payload["priority"]
    assert "created_at" in data
    assert "updated_at" in data


def test_create_task_with_defaults(client):
    """Test creating a task with only required fields applies schema defaults."""
    payload = {"title": "Minimal Task"}
    response = client.post("/tasks", json=payload)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["title"] == "Minimal Task"
    assert data["description"] is None
    assert data["status"] == "pending"
    assert data["priority"] == "medium"


def test_create_task_validation_empty_title(client):
    """Test creating a task with empty title returns 422 Unprocessable Entity."""
    response = client.post("/tasks", json={"title": ""})
    assert response.status_code == HTTP_422


def test_create_task_validation_invalid_status(client):
    """Test creating a task with invalid status enum value returns 422."""
    payload = {
        "title": "Invalid Status Task",
        "status": "not_a_valid_status",
    }
    response = client.post("/tasks", json=payload)
    assert response.status_code == HTTP_422


def test_create_task_validation_invalid_priority(client):
    """Test creating a task with invalid priority enum value returns 422."""
    payload = {
        "title": "Invalid Priority Task",
        "priority": "super_urgent",
    }
    response = client.post("/tasks", json=payload)
    assert response.status_code == HTTP_422


def test_get_all_tasks_empty(client):
    """Test retrieving tasks from an empty database returns empty list."""
    response = client.get("/tasks")
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == []


def test_get_all_tasks_populated(client):
    """Test retrieving multiple created tasks."""
    client.post("/tasks", json={"title": "Task 1", "priority": "low"})
    client.post("/tasks", json={"title": "Task 2", "priority": "high"})
    client.post("/tasks", json={"title": "Task 3", "priority": "medium"})

    response = client.get("/tasks")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 3


def test_filter_tasks_by_status(client):
    """Test filtering tasks by status query parameter."""
    client.post("/tasks", json={"title": "Task A", "status": "pending"})
    client.post("/tasks", json={"title": "Task B", "status": "completed"})
    client.post("/tasks", json={"title": "Task C", "status": "pending"})

    res_pending = client.get("/tasks?status=pending")
    assert res_pending.status_code == status.HTTP_200_OK
    pending_tasks = res_pending.json()
    assert len(pending_tasks) == 2
    assert all(t["status"] == "pending" for t in pending_tasks)

    res_completed = client.get("/tasks?status=completed")
    assert res_completed.status_code == status.HTTP_200_OK
    completed_tasks = res_completed.json()
    assert len(completed_tasks) == 1
    assert completed_tasks[0]["title"] == "Task B"


def test_filter_tasks_by_priority(client):
    """Test filtering tasks by priority query parameter."""
    client.post("/tasks", json={"title": "High Task", "priority": "high"})
    client.post("/tasks", json={"title": "Low Task", "priority": "low"})

    res = client.get("/tasks?priority=high")
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert len(data) == 1
    assert data[0]["title"] == "High Task"


def test_search_tasks(client):
    """Test searching tasks by title and description substring."""
    client.post(
        "/tasks",
        json={"title": "Deploy to Staging", "description": "Configure CircleCI job"},
    )
    client.post(
        "/tasks",
        json={"title": "Write Unit Tests", "description": "Add Pytest assertions"},
    )

    res = client.get("/tasks?search=CircleCI")
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert len(data) == 1
    assert data[0]["title"] == "Deploy to Staging"


def test_pagination_tasks(client):
    """Test skip and limit pagination parameters."""
    for i in range(5):
        client.post("/tasks", json={"title": f"Task {i}"})

    res = client.get("/tasks?skip=1&limit=2")
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert len(data) == 2


def test_get_task_by_id_success(client, sample_task_payload):
    """Test retrieving a specific task by ID."""
    created = client.post("/tasks", json=sample_task_payload).json()
    task_id = created["id"]

    response = client.get(f"/tasks/{task_id}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == task_id
    assert data["title"] == sample_task_payload["title"]


def test_get_nonexistent_task_returns_404(client):
    """Test retrieving a nonexistent task ID returns 404 Not Found."""
    response = client.get("/tasks/999999")
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "not found" in response.json()["detail"].lower()


def test_get_task_invalid_id_type(client):
    """Test retrieving a task with a non-integer ID returns 422."""
    response = client.get("/tasks/invalid-id")
    assert response.status_code == HTTP_422


def test_update_task_success(client, sample_task_payload):
    """Test updating task attributes returns 200 and updated fields."""
    created = client.post("/tasks", json=sample_task_payload).json()
    task_id = created["id"]

    update_payload = {
        "title": "Updated Task Title",
        "status": "completed",
        "priority": "low",
    }
    response = client.patch(f"/tasks/{task_id}", json=update_payload)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == task_id
    assert data["title"] == "Updated Task Title"
    assert data["status"] == "completed"
    assert data["priority"] == "low"
    assert data["description"] == sample_task_payload["description"]


def test_update_task_partial(client, sample_task_payload):
    """Test partially updating only one field preserves other attributes."""
    created = client.post("/tasks", json=sample_task_payload).json()
    task_id = created["id"]

    response = client.patch(f"/tasks/{task_id}", json={"status": "in_progress"})
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "in_progress"
    assert data["title"] == sample_task_payload["title"]
    assert data["priority"] == sample_task_payload["priority"]


def test_update_nonexistent_task_returns_404(client):
    """Test updating a nonexistent task returns 404 Not Found."""
    response = client.patch("/tasks/999999", json={"title": "Won't exist"})
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_update_task_invalid_status_returns_422(client, sample_task_payload):
    """Test updating a task with invalid status value returns 422."""
    created = client.post("/tasks", json=sample_task_payload).json()
    task_id = created["id"]

    response = client.patch(f"/tasks/{task_id}", json={"status": "invalid_status"})
    assert response.status_code == HTTP_422


def test_delete_task_success(client, sample_task_payload):
    """Test deleting an existing task returns 204 No Content and removes it."""
    created = client.post("/tasks", json=sample_task_payload).json()
    task_id = created["id"]

    del_resp = client.delete(f"/tasks/{task_id}")
    assert del_resp.status_code == status.HTTP_204_NO_CONTENT

    # Verify task is deleted
    get_resp = client.get(f"/tasks/{task_id}")
    assert get_resp.status_code == status.HTTP_404_NOT_FOUND


def test_delete_nonexistent_task_returns_404(client):
    """Test deleting a nonexistent task ID returns 404 Not Found."""
    response = client.delete("/tasks/999999")
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_task_statistics(client):
    """Test task stats endpoint computes correct summary metrics."""
    # Empty stats initially
    stats_empty = client.get("/tasks/stats").json()
    assert stats_empty["total"] == 0
    assert stats_empty["completed"] == 0
    assert stats_empty["pending"] == 0
    assert stats_empty["in_progress"] == 0
    assert stats_empty["high_priority"] == 0

    # Create several tasks
    client.post(
        "/tasks", json={"title": "T1", "status": "pending", "priority": "high"}
    )
    client.post(
        "/tasks", json={"title": "T2", "status": "in_progress", "priority": "high"}
    )
    client.post(
        "/tasks", json={"title": "T3", "status": "completed", "priority": "medium"}
    )
    client.post(
        "/tasks", json={"title": "T4", "status": "completed", "priority": "low"}
    )

    stats = client.get("/tasks/stats").json()
    assert stats["total"] == 4
    assert stats["pending"] == 1
    assert stats["in_progress"] == 1
    assert stats["completed"] == 2
    assert stats["high_priority"] == 2
