"""Application-wide constants."""

# Ticket constants
VALID_STATUSES = ["To Do", "In Progress", "Done", "Blocked"]
VALID_PRIORITIES = ["Low", "Medium", "High", "Critical"]

# Project constants
VALID_PROJECT_STATUSES = ["Active", "On Hold", "Completed", "Cancelled"]

# Team constants
DEFAULT_AVAILABILITY = 100
DEFAULT_COST_RATE = 0.0

# Date formats
SQL_DATE_FORMAT = '%Y-%m-%d'
SQL_DATETIME_FORMAT = '%Y-%m-%d %H:%M:%S'
DISPLAY_DATE_FORMAT = '%Y-%m-%d'
DISPLAY_DATETIME_FORMAT = '%Y-%m-%d %H:%M'

# Database constants
DEFAULT_DB_PATH = "data/tickettracker.db"

# Validation limits
MAX_TITLE_LENGTH = 200
MAX_DESCRIPTION_LENGTH = 2000
MIN_AVAILABILITY = 0
MAX_AVAILABILITY = 100
MIN_BUDGET = 0
MIN_COST_RATE = 0

# Default values
DEFAULT_STATUS = "To Do"
DEFAULT_PRIORITY = "Medium"
DEFAULT_PROJECT_STATUS = "Active"
