"""Ticket entity model with validation."""

from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from enum import Enum


class TicketStatus(Enum):
    """Valid ticket statuses."""
    TODO = "To Do"
    IN_PROGRESS = "In Progress"
    DONE = "Done"
    BLOCKED = "Blocked"


class TicketPriority(Enum):
    """Valid ticket priorities."""
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"


@dataclass
class Ticket:
    """Ticket entity with validation."""

    title: str
    description: str
    status: TicketStatus
    priority: TicketPriority
    due_date: datetime
    id: Optional[int] = None
    created_date: Optional[datetime] = None
    assigned_to: Optional[str] = None
    estimated_hours: float = 0.0
    actual_hours: float = 0.0
    project_id: Optional[int] = None

    def __post_init__(self):
        """Validate ticket data after initialization."""
        if not self.title or len(self.title.strip()) == 0:
            raise ValueError("Ticket title cannot be empty")

        if len(self.title) > 200:
            raise ValueError("Ticket title must be 200 characters or less")

        # Convert string status to enum if needed
        if isinstance(self.status, str):
            try:
                self.status = TicketStatus(self.status)
            except ValueError:
                valid_statuses = [s.value for s in TicketStatus]
                raise ValueError(f"Invalid status. Must be one of: {valid_statuses}")

        # Convert string priority to enum if needed
        if isinstance(self.priority, str):
            try:
                self.priority = TicketPriority(self.priority)
            except ValueError:
                valid_priorities = [p.value for p in TicketPriority]
                raise ValueError(f"Invalid priority. Must be one of: {valid_priorities}")

        if self.estimated_hours < 0:
            raise ValueError("Estimated hours cannot be negative")

        if self.actual_hours < 0:
            raise ValueError("Actual hours cannot be negative")

        if self.created_date is None:
            self.created_date = datetime.now()

    def to_dict(self):
        """Convert ticket to dictionary for database storage."""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'status': self.status.value,
            'priority': self.priority.value,
            'due_date': self.due_date,
            'created_date': self.created_date,
            'assigned_to': self.assigned_to,
            'estimated_hours': self.estimated_hours,
            'actual_hours': self.actual_hours,
            'project_id': self.project_id
        }

    @classmethod
    def from_dict(cls, data: dict):
        """Create ticket from dictionary."""
        return cls(
            id=data.get('id'),
            title=data['title'],
            description=data.get('description', ''),
            status=data['status'],
            priority=data['priority'],
            due_date=data['due_date'],
            created_date=data.get('created_date'),
            assigned_to=data.get('assigned_to'),
            estimated_hours=data.get('estimated_hours', 0.0),
            actual_hours=data.get('actual_hours', 0.0),
            project_id=data.get('project_id')
        )

    def is_overdue(self) -> bool:
        """Check if ticket is overdue."""
        return datetime.now() > self.due_date and self.status != TicketStatus.DONE

    def is_complete(self) -> bool:
        """Check if ticket is complete."""
        return self.status == TicketStatus.DONE
