"""Date and time utility functions."""

import pandas as pd
from datetime import datetime
from typing import Union, Optional


class DateTimeUtil:
    """Centralized datetime handling utilities."""

    @staticmethod
    def parse_datetime(value: Union[str, datetime, pd.Timestamp, None]) -> Optional[datetime]:
        """
        Parse various datetime formats into a datetime object.

        Args:
            value: String, datetime, pandas Timestamp, or None

        Returns:
            datetime object or None
        """
        if value is None:
            return None

        if isinstance(value, datetime):
            return value

        if isinstance(value, pd.Timestamp):
            return value.to_pydatetime()

        if isinstance(value, str):
            try:
                return pd.to_datetime(value).to_pydatetime()
            except (ValueError, TypeError):
                return None

        return None

    @staticmethod
    def to_sql_date_string(dt: Union[datetime, pd.Timestamp]) -> str:
        """
        Convert datetime to SQL-compatible date string.

        Args:
            dt: datetime or pandas Timestamp

        Returns:
            String in YYYY-MM-DD format
        """
        if isinstance(dt, pd.Timestamp):
            dt = dt.to_pydatetime()
        return dt.strftime('%Y-%m-%d')

    @staticmethod
    def to_sql_datetime_string(dt: Union[datetime, pd.Timestamp]) -> str:
        """
        Convert datetime to SQL-compatible datetime string.

        Args:
            dt: datetime or pandas Timestamp

        Returns:
            String in YYYY-MM-DD HH:MM:SS format
        """
        if isinstance(dt, pd.Timestamp):
            dt = dt.to_pydatetime()
        return dt.strftime('%Y-%m-%d %H:%M:%S')

    @staticmethod
    def parse_dataframe_dates(df: pd.DataFrame, date_columns: list) -> pd.DataFrame:
        """
        Parse date columns in a DataFrame.

        Args:
            df: pandas DataFrame
            date_columns: List of column names to parse as dates

        Returns:
            DataFrame with parsed date columns
        """
        for col in date_columns:
            if col in df.columns:
                df[col] = pd.to_datetime(df[col], errors='coerce')
        return df

    @staticmethod
    def is_past_due(due_date: datetime) -> bool:
        """
        Check if a date is in the past.

        Args:
            due_date: The date to check

        Returns:
            True if the date is in the past
        """
        return datetime.now() > due_date

    @staticmethod
    def days_until(target_date: datetime) -> int:
        """
        Calculate days until a target date.

        Args:
            target_date: The target date

        Returns:
            Number of days until target date (negative if in past)
        """
        delta = target_date - datetime.now()
        return delta.days

    @staticmethod
    def format_for_display(dt: Union[datetime, pd.Timestamp, None], format_str: str = '%Y-%m-%d') -> str:
        """
        Format datetime for display.

        Args:
            dt: datetime, pandas Timestamp, or None
            format_str: Format string (default: YYYY-MM-DD)

        Returns:
            Formatted string or empty string if None
        """
        if dt is None:
            return ''

        if isinstance(dt, pd.Timestamp):
            dt = dt.to_pydatetime()

        return dt.strftime(format_str)
