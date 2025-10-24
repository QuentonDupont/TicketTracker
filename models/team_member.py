"""Team member entity model with validation."""

from dataclasses import dataclass
from typing import List, Optional


@dataclass
class TeamMember:
    """Team member entity with validation."""

    name: str
    role: str
    skills: List[str]
    availability: int = 100
    cost_rate: float = 0.0
    id: Optional[int] = None

    def __post_init__(self):
        """Validate team member data after initialization."""
        if not self.name or len(self.name.strip()) == 0:
            raise ValueError("Team member name cannot be empty")

        if len(self.name) > 200:
            raise ValueError("Team member name must be 200 characters or less")

        if not self.role or len(self.role.strip()) == 0:
            raise ValueError("Team member role cannot be empty")

        if not isinstance(self.skills, list):
            raise ValueError("Skills must be a list")

        if not self.skills:
            raise ValueError("Team member must have at least one skill")

        if not all(isinstance(skill, str) for skill in self.skills):
            raise ValueError("All skills must be strings")

        if self.availability < 0 or self.availability > 100:
            raise ValueError("Availability must be between 0 and 100")

        if self.cost_rate < 0:
            raise ValueError("Cost rate cannot be negative")

    def to_dict(self):
        """Convert team member to dictionary for database storage."""
        return {
            'id': self.id,
            'name': self.name,
            'role': self.role,
            'skills': self.skills,  # Will be JSON-encoded by database layer
            'availability': self.availability,
            'cost_rate': self.cost_rate
        }

    @classmethod
    def from_dict(cls, data: dict):
        """Create team member from dictionary."""
        import json

        # Parse skills if it's a JSON string
        skills = data.get('skills', [])
        if isinstance(skills, str):
            skills = json.loads(skills)

        return cls(
            id=data.get('id'),
            name=data['name'],
            role=data['role'],
            skills=skills,
            availability=data.get('availability', 100),
            cost_rate=data.get('cost_rate', 0.0)
        )

    def is_available(self) -> bool:
        """Check if team member is available."""
        return self.availability > 0

    def has_skill(self, skill: str) -> bool:
        """Check if team member has a specific skill."""
        return skill.lower() in [s.lower() for s in self.skills]
