"""Validation utilities for data integrity."""

from typing import Optional
from datetime import datetime


class ValidationError(Exception):
    """Custom validation error."""
    pass


class ValidationService:
    """Centralized validation logic for all entities."""

    @staticmethod
    def validate_ticket(title: str, status: str, priority: str, due_date: datetime) -> None:
        """
        Validate ticket data.

        Args:
            title: Ticket title
            status: Ticket status
            priority: Ticket priority
            due_date: Due date

        Raises:
            ValidationError: If validation fails
        """
        if not title or len(title.strip()) == 0:
            raise ValidationError("Ticket title cannot be empty")

        if len(title) > 200:
            raise ValidationError("Ticket title must be 200 characters or less")

        valid_statuses = ["To Do", "In Progress", "Done", "Blocked"]
        if status not in valid_statuses:
            raise ValidationError(f"Invalid status. Must be one of: {valid_statuses}")

        valid_priorities = ["Low", "Medium", "High", "Critical"]
        if priority not in valid_priorities:
            raise ValidationError(f"Invalid priority. Must be one of: {valid_priorities}")

        if not isinstance(due_date, datetime):
            raise ValidationError("Due date must be a valid datetime")

    @staticmethod
    def validate_project(name: str, start_date: datetime, end_date: datetime,
                         budget: float, manager: str) -> None:
        """
        Validate project data.

        Args:
            name: Project name
            start_date: Project start date
            end_date: Project end date
            budget: Project budget
            manager: Project manager

        Raises:
            ValidationError: If validation fails
        """
        if not name or len(name.strip()) == 0:
            raise ValidationError("Project name cannot be empty")

        if len(name) > 200:
            raise ValidationError("Project name must be 200 characters or less")

        if not isinstance(start_date, datetime) or not isinstance(end_date, datetime):
            raise ValidationError("Start and end dates must be valid datetimes")

        if start_date >= end_date:
            raise ValidationError("End date must be after start date")

        if budget < 0:
            raise ValidationError("Budget cannot be negative")

        if not manager or len(manager.strip()) == 0:
            raise ValidationError("Project manager cannot be empty")

    @staticmethod
    def validate_team_member(name: str, role: str, skills: list, availability: int,
                             cost_rate: float) -> None:
        """
        Validate team member data.

        Args:
            name: Team member name
            role: Team member role
            skills: List of skills
            availability: Availability percentage (0-100)
            cost_rate: Cost per hour

        Raises:
            ValidationError: If validation fails
        """
        if not name or len(name.strip()) == 0:
            raise ValidationError("Team member name cannot be empty")

        if len(name) > 200:
            raise ValidationError("Team member name must be 200 characters or less")

        if not role or len(role.strip()) == 0:
            raise ValidationError("Team member role cannot be empty")

        if not isinstance(skills, list) or len(skills) == 0:
            raise ValidationError("Team member must have at least one skill")

        if not all(isinstance(skill, str) for skill in skills):
            raise ValidationError("All skills must be strings")

        if availability < 0 or availability > 100:
            raise ValidationError("Availability must be between 0 and 100")

        if cost_rate < 0:
            raise ValidationError("Cost rate cannot be negative")

    @staticmethod
    def sanitize_input(text: Optional[str]) -> str:
        """
        Sanitize text input.

        Args:
            text: Input text

        Returns:
            Sanitized text
        """
        if text is None:
            return ""
        return text.strip()
