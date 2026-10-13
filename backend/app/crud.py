from typing import Optional

from sqlalchemy.orm import Session

from app import models, schemas


def get_task(db: Session, task_id: int) -> Optional[models.Task]:
    """Retrieve an individual task by ID."""
    return db.query(models.Task).filter(models.Task.id == task_id).first()


def get_tasks(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    status: Optional[schemas.TaskStatus] = None,
    priority: Optional[schemas.TaskPriority] = None,
    search: Optional[str] = None,
) -> list[models.Task]:
    """Retrieve all tasks with optional filtering and pagination."""
    query = db.query(models.Task)
    if status is not None:
        query = query.filter(models.Task.status == status.value)
    if priority is not None:
        query = query.filter(models.Task.priority == priority.value)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (models.Task.title.ilike(search_filter))
            | (models.Task.description.ilike(search_filter))
        )
    return query.order_by(models.Task.id.desc()).offset(skip).limit(limit).all()


def create_task(db: Session, task: schemas.TaskCreate) -> models.Task:
    """Create a new task."""
    db_task = models.Task(
        title=task.title,
        description=task.description,
        status=task.status.value,
        priority=task.priority.value,
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def update_task(
    db: Session, task_id: int, task_update: schemas.TaskUpdate
) -> Optional[models.Task]:
    """Update fields of an existing task."""
    db_task = get_task(db, task_id)
    if not db_task:
        return None

    update_data = task_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            if hasattr(value, "value"):
                setattr(db_task, key, value.value)
            else:
                setattr(db_task, key, value)

    db.commit()
    db.refresh(db_task)
    return db_task


def delete_task(db: Session, task_id: int) -> bool:
    """Delete an existing task by ID."""
    db_task = get_task(db, task_id)
    if not db_task:
        return False
    db.delete(db_task)
    db.commit()
    return True


def get_task_stats(db: Session) -> schemas.TaskStats:
    """Compute aggregate counts for dashboard."""
    total = db.query(models.Task).count()
    completed = (
        db.query(models.Task)
        .filter(models.Task.status == schemas.TaskStatus.COMPLETED.value)
        .count()
    )
    pending = (
        db.query(models.Task)
        .filter(models.Task.status == schemas.TaskStatus.PENDING.value)
        .count()
    )
    in_progress = (
        db.query(models.Task)
        .filter(models.Task.status == schemas.TaskStatus.IN_PROGRESS.value)
        .count()
    )
    high_priority = (
        db.query(models.Task)
        .filter(models.Task.priority == schemas.TaskPriority.HIGH.value)
        .count()
    )

    return schemas.TaskStats(
        total=total,
        completed=completed,
        pending=pending,
        in_progress=in_progress,
        high_priority=high_priority,
    )
