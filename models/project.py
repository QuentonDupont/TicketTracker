"""Project entity model with validation."""

from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from enum import Enum


class ProjectStatus(Enum):
    """Valid project statuses."""
    ACTIVE = "Active"
    ON_HOLD = "On Hold"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"


@dataclass
class Project:
    """Project entity with validation."""

    name: str
    description: str
    start_date: datetime
    end_date: datetime
    budget: float
    manager: str
    status: ProjectStatus = ProjectStatus.ACTIVE
    id: Optional[int] = None

    def __post_init__(self):
        """Validate project data after initialization."""
        if not self.name or len(self.name.strip()) == 0:
            raise ValueError("Project name cannot be empty")

        if len(self.name) > 200:
            raise ValueError("Project name must be 200 characters or less")

        # Convert string status to enum if needed
        if isinstance(self.status, str):
            try:
                self.status = ProjectStatus(self.status)
            except ValueError:
                valid_statuses = [s.value for s in ProjectStatus]
                raise ValueError(f"Invalid status. Must be one of: {valid_statuses}")

        if self.start_date >= self.end_date:
            raise ValueError("End date must be after start date")

        if self.budget < 0:
            raise ValueError("Budget cannot be negative")

        if not self.manager or len(self.manager.strip()) == 0:
            raise ValueError("Project manager cannot be empty")

    def to_dict(self):
        """Convert project to dictionary for database storage."""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'start_date': self.start_date,
            'end_date': self.end_date,
            'budget': self.budget,
            'manager': self.manager,
            'status': self.status.value
        }

    @classmethod
    def from_dict(cls, data: dict):
        """Create project from dictionary."""
        return cls(
            id=data.get('id'),
            name=data['name'],
            description=data.get('description', ''),
            start_date=data['start_date'],
            end_date=data['end_date'],
            budget=data.get('budget', 0.0),
            manager=data['manager'],
            status=data.get('status', 'Active')
        )

    def is_active(self) -> bool:
        """Check if project is active."""
        return self.status == ProjectStatus.ACTIVE

    def duration_days(self) -> int:
        """Calculate project duration in days."""
        return (self.end_date - self.start_date).days
