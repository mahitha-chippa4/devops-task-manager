from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Integer, String, Text

from app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="pending", index=True)
    priority = Column(String(20), nullable=False, default="medium", index=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)
