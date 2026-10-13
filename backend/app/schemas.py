from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, description="Task title")
    description: Optional[str] = Field(None, max_length=2000, description="Optional task description")
    status: TaskStatus = Field(default=TaskStatus.PENDING, description="Current task lifecycle status")
    priority: TaskPriority = Field(default=TaskPriority.MEDIUM, description="Task urgency level")


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200, description="Updated task title")
    description: Optional[str] = Field(None, max_length=2000, description="Updated task description")
    status: Optional[TaskStatus] = Field(None, description="Updated task status")
    priority: Optional[TaskPriority] = Field(None, description="Updated task priority")


class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: TaskStatus
    priority: TaskPriority
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TaskStats(BaseModel):
    total: int
    completed: int
    pending: int
    in_progress: int
    high_priority: int


class MessageResponse(BaseModel):
    message: str
    detail: Optional[str] = None
