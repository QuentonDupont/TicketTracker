"""Statistics calculation service."""

import pandas as pd
from typing import Dict, Any


class StatsService:
    """Centralized statistics calculation for tickets, projects, and team."""

    @staticmethod
    def calculate_ticket_stats(tickets_df: pd.DataFrame) -> Dict[str, Any]:
        """
        Calculate ticket statistics.

        Args:
            tickets_df: DataFrame containing ticket data

        Returns:
            Dictionary with ticket statistics
        """
        if tickets_df.empty:
            return {
                'total': 0,
                'status_counts': pd.Series(dtype=int),
                'priority_counts': pd.Series(dtype=int),
                'completion_rate': 0.0
            }

        total = len(tickets_df)

        # Count tickets by status
        status_counts = tickets_df['status'].value_counts()

        # Count tickets by priority
        priority_counts = tickets_df['priority'].value_counts()

        # Calculate completion rate
        done_count = status_counts.get('Done', 0)
        completion_rate = (done_count / total * 100) if total > 0 else 0

        return {
            'total': total,
            'status_counts': status_counts,
            'priority_counts': priority_counts,
            'completion_rate': completion_rate,
            'done_count': done_count,
            'in_progress_count': status_counts.get('In Progress', 0),
            'todo_count': status_counts.get('To Do', 0),
            'blocked_count': status_counts.get('Blocked', 0)
        }

    @staticmethod
    def calculate_project_metrics(tickets_df: pd.DataFrame, project_id: int = None) -> Dict[str, Any]:
        """
        Calculate project metrics.

        Args:
            tickets_df: DataFrame containing ticket data
            project_id: Optional project ID to filter by

        Returns:
            Dictionary with project metrics
        """
        # Filter by project if specified
        if project_id is not None:
            tickets_df = tickets_df[tickets_df['project_id'] == project_id]

        if tickets_df.empty:
            return {
                'total_tickets': 0,
                'completed_tickets': 0,
                'completion_rate': 0.0,
                'total_estimated_hours': 0.0,
                'total_actual_hours': 0.0,
                'hour_variance': 0.0
            }

        total_tickets = len(tickets_df)
        completed_tickets = len(tickets_df[tickets_df['status'] == 'Done'])
        completion_rate = (completed_tickets / total_tickets * 100) if total_tickets > 0 else 0

        # Calculate hour metrics if columns exist
        total_estimated = tickets_df['estimated_hours'].sum() if 'estimated_hours' in tickets_df.columns else 0
        total_actual = tickets_df['actual_hours'].sum() if 'actual_hours' in tickets_df.columns else 0
        hour_variance = total_estimated - total_actual

        return {
            'total_tickets': total_tickets,
            'completed_tickets': completed_tickets,
            'completion_rate': completion_rate,
            'total_estimated_hours': total_estimated,
            'total_actual_hours': total_actual,
            'hour_variance': hour_variance,
            'on_track': hour_variance >= 0
        }

    @staticmethod
    def calculate_team_metrics(tickets_df: pd.DataFrame, team_members_df: pd.DataFrame) -> Dict[str, Dict[str, Any]]:
        """
        Calculate team member metrics.

        Args:
            tickets_df: DataFrame containing ticket data
            team_members_df: DataFrame containing team member data

        Returns:
            Dictionary mapping team member names to their metrics
        """
        team_stats = {}

        for _, member in team_members_df.iterrows():
            member_name = member['name']

            # Filter tickets assigned to this member (if assigned_to column exists)
            if 'assigned_to' in tickets_df.columns:
                member_tickets = tickets_df[tickets_df['assigned_to'] == member_name]
                total_tickets = len(member_tickets)
                completed_tickets = len(member_tickets[member_tickets['status'] == 'Done'])
                total_hours = member_tickets['actual_hours'].sum() if 'actual_hours' in tickets_df.columns else 0
            else:
                total_tickets = 0
                completed_tickets = 0
                total_hours = 0

            team_stats[member_name] = {
                'role': member['role'],
                'total_tickets': total_tickets,
                'completed_tickets': completed_tickets,
                'completion_rate': (completed_tickets / total_tickets * 100) if total_tickets > 0 else 0,
                'total_hours': total_hours,
                'availability': member.get('availability', 100),
                'cost_rate': member.get('cost_rate', 0.0)
            }

        return team_stats

    @staticmethod
    def calculate_overdue_tickets(tickets_df: pd.DataFrame) -> pd.DataFrame:
        """
        Find overdue tickets.

        Args:
            tickets_df: DataFrame containing ticket data

        Returns:
            DataFrame of overdue tickets
        """
        if tickets_df.empty or 'due_date' not in tickets_df.columns:
            return pd.DataFrame()

        from datetime import datetime

        # Convert due_date to datetime if needed
        tickets_df = tickets_df.copy()
        tickets_df['due_date'] = pd.to_datetime(tickets_df['due_date'])

        # Find tickets that are overdue and not done
        overdue = tickets_df[
            (tickets_df['due_date'] < datetime.now()) &
            (tickets_df['status'] != 'Done')
        ]

        return overdue

    @staticmethod
    def calculate_priority_distribution(tickets_df: pd.DataFrame) -> Dict[str, int]:
        """
        Calculate distribution of tickets by priority.

        Args:
            tickets_df: DataFrame containing ticket data

        Returns:
            Dictionary mapping priority to count
        """
        if tickets_df.empty or 'priority' not in tickets_df.columns:
            return {}

        return tickets_df['priority'].value_counts().to_dict()

    @staticmethod
    def calculate_status_distribution(tickets_df: pd.DataFrame) -> Dict[str, int]:
        """
        Calculate distribution of tickets by status.

        Args:
            tickets_df: DataFrame containing ticket data

        Returns:
            Dictionary mapping status to count
        """
        if tickets_df.empty or 'status' not in tickets_df.columns:
            return {}

        return tickets_df['status'].value_counts().to_dict()

    @staticmethod
    def calculate_burndown_data(tickets_df: pd.DataFrame) -> pd.DataFrame:
        """
        Calculate burndown chart data.

        Args:
            tickets_df: DataFrame containing ticket data

        Returns:
            DataFrame with date and remaining tickets count
        """
        if tickets_df.empty or 'created_date' not in tickets_df.columns:
            return pd.DataFrame()

        # Group by date and calculate cumulative tickets
        tickets_df = tickets_df.copy()
        tickets_df['created_date'] = pd.to_datetime(tickets_df['created_date'])
        tickets_df = tickets_df.sort_values('created_date')

        # Calculate remaining tickets over time
        daily_created = tickets_df.groupby(tickets_df['created_date'].dt.date).size()
        daily_completed = tickets_df[tickets_df['status'] == 'Done'].groupby(
            tickets_df['created_date'].dt.date
        ).size()

        # Calculate cumulative
        cumulative_created = daily_created.cumsum()
        cumulative_completed = daily_completed.cumsum()
        remaining = cumulative_created - cumulative_completed

        burndown_df = pd.DataFrame({
            'date': remaining.index,
            'remaining_tickets': remaining.values
        })

        return burndown_df
