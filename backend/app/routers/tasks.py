from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import crud, schemas
from app.database import get_db

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post(
    "",
    response_model=schemas.TaskResponse,
    status_code=status.HTTP_200_OK,
    summary="Create a new task",
)
def create_task(
    task_in: schemas.TaskCreate,
    db: Session = Depends(get_db),
):
    """Create a new task with title, optional description, priority, and status."""
    return crud.create_task(db=db, task=task_in)


@router.get(
    "",
    response_model=list[schemas.TaskResponse],
    status_code=status.HTTP_200_OK,
    summary="Retrieve all tasks",
)
def list_tasks(
    skip: int = Query(0, ge=0, description="Offset for pagination"),
    limit: int = Query(100, ge=1, le=500, description="Limit for pagination"),
    status_filter: Optional[schemas.TaskStatus] = Query(
        None, alias="status", description="Filter by status"
    ),
    priority_filter: Optional[schemas.TaskPriority] = Query(
        None, alias="priority", description="Filter by priority"
    ),
    search: Optional[str] = Query(
        None, description="Search term for title or description"
    ),
    db: Session = Depends(get_db),
):
    """Retrieve all tasks with optional filtering and search."""
    return crud.get_tasks(
        db=db,
        skip=skip,
        limit=limit,
        status=status_filter,
        priority=priority_filter,
        search=search,
    )


@router.get(
    "/stats",
    response_model=schemas.TaskStats,
    status_code=status.HTTP_200_OK,
    summary="Retrieve task summary statistics",
)
def get_task_statistics(db: Session = Depends(get_db)):
    """Retrieve aggregate statistics: total, completed, pending, in-progress, and high-priority."""
    return crud.get_task_stats(db=db)


@router.get(
    "/{task_id}",
    response_model=schemas.TaskResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve an individual task",
)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
):
    """Retrieve a single task by its integer identifier."""
    task = crud.get_task(db=db, task_id=task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found",
        )
    return task


@router.patch(
    "/{task_id}",
    response_model=schemas.TaskResponse,
    status_code=status.HTTP_200_OK,
    summary="Update an existing task",
)
def update_task(
    task_id: int,
    task_update: schemas.TaskUpdate,
    db: Session = Depends(get_db),
):
    """Update fields of an existing task (title, description, status, priority)."""
    updated = crud.update_task(db=db, task_id=task_id, task_update=task_update)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found",
        )
    return updated


@router.delete(
    "/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a task",
)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
):
    """Delete a task by its integer identifier."""
    success = crud.delete_task(db=db, task_id=task_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found",
        )
    return None
